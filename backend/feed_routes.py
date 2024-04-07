import status
from flask import jsonify, Blueprint
from firebase_admin import firestore
from helper_functions import try_connect_to_db


feed_bp = Blueprint("feed", __name__)


# Get all posts of specific user
@feed_bp.route("/api/posts/user/<user_id>", methods=["GET"])
def get_user_posts(user_id):
    """
    Get all posts of a specific user.

    Args:
        user_id (str): The ID of the user whose posts are to be retrieved.

    Returns:
        list: A list containing dictionaries representing the user's posts.

    Raises:
        ValueError: If no posts are found for the specified user.
        ValueError: If an error occurs while connecting to the database.

    Note:
        This function connects to a Firestore database to retrieve posts authored by the specified user.
        It limits the result to the first 50 posts and converts non-serializable data to string representations.
        If no posts are found for the specified user, it raises a ValueError.
        If an error occurs while connecting to the database, it raises a ValueError with an appropriate message.
    """
    # Check connection to the database
    try_connect_to_db()

    try:
        # Get the database
        db = firestore.client()

        # Query for the first 50 posts of the specified user
        user_ref = db.collection("users").document(user_id)
        user_data = user_ref.get().to_dict()
        post_data = user_data["posts"]

        # Initialize an empty list to store post data
        user_posts = []

        # Iterate over the query results
        for post_doc in post_data:
            posts_collection_and_value = post_doc.path.split("/")

            post_ref = None

            # Get the post reference
            if posts_collection_and_value[0] == "posts":
                post_ref = db.collection("posts").document(
                    # Extract the post ID from the path thats either "[posts/ID]" or "[recipes/ID]"
                    post_doc.path.split("/")[1]
                )
            elif posts_collection_and_value[0] == "recipes":
                post_ref = db.collection("recipes").document(
                    # Extract the post ID from the path thats either "[posts/ID]" or "[recipes/ID]"
                    post_doc.path.split("/")[1]
                )
            else:
                return (
                    jsonify({"error": "Invalid post type"}),
                    status.HTTP_400_BAD_REQUEST,
                )

            # Get the post data
            post_data = post_ref.get().to_dict()

            # Convert the author to a dictionary
            post_data["author"] = post_data["author"].path

            # Convert the comments to a dictionary
            for comment in post_data["comments"]:
                comment["author"] = comment["author"].path

            # Append the post data to the list
            user_posts.append(post_data)

        # Return the list of post data as JSON response
        return jsonify(user_posts), status.HTTP_200_OK

    except Exception as e:
        print("Error fetching user's posts:", str(e))
        return (
            jsonify({"error": "Error fetiching user's posts"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
