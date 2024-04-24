import status
from flask import jsonify, request, Blueprint
from firebase_admin import firestore, storage
import copy
import base64
import datetime
import pytz
from helper_functions import try_connect_to_db, post_validation, generate_unique_id


post_bp = Blueprint("post", __name__)


# Get a specific post by id
@post_bp.route("/api/posts/<post_id>", methods=["GET"])
def get_post(post_id):
    """
    Get a specific post by its ID.

    Args:
        post_id (str): The ID of the post to retrieve.

    Returns:
        dict: A dictionary representing the post.

    Raises:
        ValueError: If the specified post is not found.
        ValueError: If an error occurs while connecting to the database.
    """
    # Connect to the database
    try_connect_to_db()

    # Get the database
    db = firestore.client()

    # Get the post by ID
    post_ref = db.collection("posts").document(post_id)
    post_doc = post_ref.get()

    # Check if the post exists
    if not post_doc.exists:
        return jsonify({"error": "Post not found"}), status.HTTP_404_NOT_FOUND

    # Convert the post to a dictionary
    post_data = post_doc.to_dict()

    # Convert the author to a dictionary
    post_data["author"] = post_data["author"].path

    # Convert the comments to a dictionary
    for comment in post_data["comments"]:
        comment["author"] = comment["author"].path

    # if there is nothing in the array then just skip over it, otherwise get all the like info
    if len(post_data["likes"]) != 0:
        post_data["likes"] = [
            {
                "user": ref.get("user", {}).path,
                "timestamp": ref.get("timestamp", ""),
            }
            for ref in post_data["likes"]
        ]
    else:
        post_data["likes"] = []

    return jsonify(post_data), status.HTTP_200_OK


# Create a new post
@post_bp.route("/api/posts", methods=["POST"])
def create_post():
    """
    Create a new post.

    Returns:
        dict: A dictionary representing the newly created post.
    """
    # Get data, check if it is empty
    res = request.json

    # Make a deep copy of the data
    data = copy.deepcopy(res)

    # The request has been validated, connect to the database
    try_connect_to_db()

    try:
        db = firestore.client()
        # Get data
        res = request.json

        # Make a deep copy of the data
        data = copy.deepcopy(res)

        base64Image = data["pictures"][0]

        # Decode base64 data into binary
        try:
            image_binary = base64.b64decode(base64Image)
        except Exception as e:
            return jsonify({"error": "Invalid base64 data"}), 400

        # Set the file path and name in Firebase Storage
        file_path = f'images/{generate_unique_id()}.jpg'

        # Get Firebase Storage bucket
        bucket = storage.bucket()

        # Upload the image data to Firebase Storage
        blob = bucket.blob(file_path)

        blob.upload_from_string(image_binary, content_type='image/jpeg')

        # Set expiration time to a distant future (e.g., 10 years from now)
        expiration_time = datetime.datetime.now(pytz.utc) + datetime.timedelta(days=36500)  # 100 years

        image_url = blob.generate_signed_url(expiration=expiration_time, method='GET')

        # Assign proper values to and pictures array to res object
        res["pictures"] = [image_url]

        # Assign proper values to pictures array and author ref to data object
        data["pictures"] = [image_url]
        data["author"] = db.document(data["author"])

        # Add the new post to the 'posts' collection
        new_post_ref = db.collection("posts").document()

        new_post_ref.set(data)

        # Get the user reference
        user_ref = db.document("users/" + data["author"].id)

        # Get the user data
        user_data = user_ref.get().to_dict()
        post_ref = db.document("posts/" + new_post_ref.id)

        # Add the new post to the user's posts list
        user_data["posts"].append(post_ref)

        # Update the user data
        user_ref.update(user_data)

        # Return the newly created post
        return jsonify(res), status.HTTP_201_CREATED

    except Exception as e:
        print("Error adding new post:", str(e))
        return (
            jsonify({"error": "Error adding new post"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Update an existing post
@post_bp.route("/api/posts/<post_id>", methods=["PATCH"])
def update_post(post_id):
    """
    Update an existing post.

    Args:
        post_id (str): The ID of the post to be updated.

    Returns:
        dict: A dictionary representing the updated post.
    """
    # Get the JSON data from the request
    res = request.json

    # Make a deep copy of the data
    data = copy.deepcopy(res)

    # The request has been validated, connect to the database
    try_connect_to_db()

    try:
        # Connect to the database
        db = firestore.client()

        # Update the post in the 'posts' collection
        post_ref = db.collection("posts").document(post_id)
        data["author"] = db.document(data["author"])
        for comment in data["comments"]:
            comment["author"] = db.document(comment["author"])
        data["likes"] = [
            {"user": db.document(like["user"]), "timestamp": like["timestamp"]}
            for like in data["likes"]
        ]
        post_ref.update(data)

        # Return the updated post
        return jsonify(res), status.HTTP_200_OK

    except Exception as e:
        print("Error updating post:", str(e))
        return (
            jsonify({"error": "Error updating post"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Delete a post
@post_bp.route("/api/posts/<post_id>", methods=["DELETE"])
def delete_post(post_id):
    """
    Delete a post.

    Args:
        post_id (str): The ID of the post to be deleted.

    Returns:
        tuple: A tuple containing a JSON response and a status code.
    """
    # Check connection to the database
    try_connect_to_db()

    try:
        # Connect to the database
        db = firestore.client()

        # Get the post reference
        post_ref = db.collection("posts").document(post_id)

        # Get the post data
        post_data = post_ref.get().to_dict()

        # Delete the post
        post_ref.delete()

        # Get the user reference
        user_ref = db.collection("users").document(
            str(post_data["author"].path[len("users/") :])
        )

        # Get the user data
        user_data = user_ref.get().to_dict()

        # Get the post reference
        user_data["posts"].remove(post_ref)

        # Update the user data
        user_ref.update(user_data)

        # Return a success message
        return jsonify({"message": "Post deleted"}), status.HTTP_200_OK

    except Exception as e:
        print("Error deleting post:", str(e))
        return (
            jsonify({"error": "Error deleting post"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@post_bp.route("/api/posts/<user_id>/nonfollowing", methods=["GET"])
def get_non_following_posts(user_id):
    try_connect_to_db()

    # Get the database
    db = firestore.client()

    # Get the post by ID
    post_ref = db.collection("posts")
    post_doc = post_ref.get()

    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()
    user_data = user_doc.to_dict()

    following = [user["user"].path for user in user_data["following"]]

    post_data = {}
    filtered_post_data = []
    for doc in post_doc:
        post_data[doc.id] = doc.to_dict()
        post_data[doc.id]["key"] = "posts/" + doc.id
        post_data[doc.id]["author"] = post_data[doc.id]["author"].path
        if (
            user_id != post_data[doc.id]["author"].split("/")[1]
            and post_data[doc.id]["author"] not in following
        ):
            filtered_post_data.append(post_data[doc.id])
        for comment in post_data[doc.id]["comments"]:
            comment["author"] = comment["author"].path

    return jsonify(filtered_post_data), status.HTTP_200_OK
