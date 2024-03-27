import os
import firebase_admin
import status
from flask import Flask, jsonify, request
from firebase_admin import credentials
from firebase_admin import firestore
from dotenv import load_dotenv
import copy

app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()


# Middleware function
@app.before_request
def middleware():
    print("Incoming request:", request.method, request.path)

    # Current idea is to take a token created from a prior interaction (aka login)
    # and verify on each request that the token currently assigned matches the
    # token used on post creation.

    # User 1 signed in and has token 1234, and created post 4321 with the token 1234
    # User 1 tries to PUT (update) post 4321
    #  Current token 1234 is verified against post token 1234, and changes are ACCEPTED
    # User 2 with token 1111 tries to PUT (update) post 4321
    #  Current token 1111 is verified against post token 1234, and changes are DENIED


# Error checking for connecting to database, refactored for error repetition
def try_connect_to_db():
    # Connect to database, gives error if cannot
    try:
        connect_to_db()
    except Exception as e:
        print("Error connecting to the database:", str(e))
        return (
            jsonify({"error": "Database connection error"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Check if the app is already initialized
def connect_to_db():
    """
    Initialize the Firebase Admin SDK if it is not already initialized.

    This function checks if the Firebase Admin SDK has already been initialized.
    If it has not been initialized, it attempts to initialize it with the credentials
    obtained from the environment variable 'DB_PRIV_KEY_PATH'. If initialization is successful,
    a message indicating the initialization is printed.

    Raises:
        FileNotFoundError: If the specified file for credentials is not found.
        ValueError: If the credentials are invalid or the environment variable is not set correctly.
        firebase_admin.exceptions.FirebaseError: If an error occurs during Firebase initialization.
        Exception: If any other unexpected exception occurs.

    Note:
        This function is designed to be called at the beginning of the application to ensure
        that the Firebase Admin SDK is initialized before any Firebase operations are performed.
        It handles various exceptions that may occur during initialization and prints
        informative error messages before raising the exceptions for further handling.
    """
    if not firebase_admin._apps:
        try:
            # Initialize Firebase Admin SDK with the credentials
            cred = credentials.Certificate(os.getenv("DB_PRIV_KEY_PATH"))
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized")
            return
        except FileNotFoundError as e:
            print(f"Error: File not found - {e}")
            raise
        except ValueError as e:
            print(f"Error: Invalid credentials or environment variable - {e}")
            raise
        except firebase_admin.exceptions.FirebaseError as e:
            print(f"Firebase Error: {e}")
            raise
        except Exception as e:
            # Catch any other unexpected exceptions
            print(f"Unexpected Error: {e}")
            raise


# function for error message for field issues
def field_error_message(message, fields):
    return (
        jsonify({"error": f"{message + (', ').join(fields)}"}),
        status.HTTP_400_BAD_REQUEST,
    )


# function to check author validitiy
def invalid_author_check(author, users):
    if str(author[len("users/") :]) not in users:
        return True
    return False


# Validate the post verifying it has the correct fields
def post_validation(data):
    """
    Validate the JSON data for creating or updating a post.

    Expects JSON data with the following format:
    {
        "author": /users/<user_id>,
        "comments": [
            {
                "author": /users/<user_id>,
                "comment": "Comment text",
                "creation_date": "Comment creation date (optional)"
            },
            ...
        ],
        "creation_date": "Post creation date",
        "description": "Post description",
        "likes": "Number of likes",
        "location": "36.1048299,-115.1454664",
        "pictures": [
            "URL to picture 1",
            "URL to picture 2",
            ...
        ]
    }

    Args:
        data (dict): JSON data representing the post.

    Returns:
        tuple: A tuple containing a dictionary of errors (if any) and a status code.
    """
    if not data:
        return (
            jsonify({"error": "No data provided"}),
            status.HTTP_400_BAD_REQUEST,
        )

    try:
        connect_to_db()
    except Exception as e:
        print("Error connecting to the database:", str(e))
        return (
            jsonify({"error": "Database connection error"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Get posts collection
    db = firestore.client()
    posts_collection = db.collection("posts")

    # get required fields
    required_fields = set(
        key
        for post in posts_collection.stream()
        for key in post.to_dict().keys()
    )

    # get any missing or extra fields
    missing_fields = [field for field in required_fields if field not in data]
    extra_fields = [field for field in data if field not in required_fields]

    # post error message if any
    if missing_fields:
        return field_error_message(
            "Missing required field(s): ", missing_fields
        )

    if extra_fields:
        return field_error_message("Input has extra field(s): ", extra_fields)

    # get users collection
    users_collection = db.collection("users")

    # get user ids
    user_ids = [user.id for user in users_collection.stream()]

    # Validate 'author' field
    author_data = data.get("author", str)

    if not isinstance(author_data, str):
        return (
            jsonify({"error": f"Invalid format for author"}),
            status.HTTP_400_BAD_REQUEST,
        )

    # make sure author id is a reference to actual user
    if invalid_author_check(author_data, user_ids):
        return (
            jsonify(
                {"error": f"Author field in post is not a reference to a user"}
            ),
            status.HTTP_400_BAD_REQUEST,
        )

    # get required fields for comments
    required_comment_fields = set(
        key
        for post in posts_collection.stream()
        for comment in post.to_dict().get("comments", {})
        for key in comment.keys()
    )

    # Validate 'comments' field
    comments_data = data.get("comments", [])
    for comment in comments_data:

        # get missing or extra comment fields if any
        missing_comment_fields = [
            field for field in required_comment_fields if field not in comment
        ]
        extra_comment_fields = [
            field for field in comment if field not in required_comment_fields
        ]

        # post error if any missing or extra fields
        if missing_comment_fields:
            return field_error_message(
                "Missing required comment field(s): ", missing_comment_fields
            )

        if extra_comment_fields:
            return field_error_message(
                "Comment input has extra field(s): ", extra_comment_fields
            )

        # make sure comment is proper type of dictionary
        if (
            not isinstance(comment, dict)
            or not isinstance(comment["comment"], str)
            or not isinstance(comment["creation_date"], str)
        ):
            return (
                jsonify({"error": "Invalid format for comment"}),
                status.HTTP_400_BAD_REQUEST,
            )

        # make sure commenter is an actual user
        if invalid_author_check(comment["author"], user_ids):
            return (
                jsonify(
                    {
                        "error": f"Author field in comment is not a reference to a user"
                    }
                ),
                status.HTTP_400_BAD_REQUEST,
            )

    # Validate other fields
    if (
        not isinstance(data["creation_date"], str)
        or not isinstance(data["description"], str)
        or not isinstance(data["likes"], int)
        or not isinstance(data["pictures"], list)
    ):
        return (
            jsonify({"error": "Invalid data type for one or more fields"}),
            status.HTTP_400_BAD_REQUEST,
        )

    return None, status.HTTP_200_OK


# Get a specific post by id
@app.route("/api/posts/<post_id>", methods=["GET"])
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

    return jsonify(post_data), status.HTTP_200_OK


# Create a new post
@app.route("/api/posts", methods=["POST"])
def create_post():
    """
    Create a new post.

    Returns:
        dict: A dictionary representing the newly created post.
    """
    # Get data, check if it is empty
    res = request.json

    # Check that data is valid
    validation_error, status_code = post_validation(res)
    if validation_error:
        return validation_error, status_code

    # Make a deep copy of the data
    data = copy.deepcopy(res)

    # The request has been validated, connect to the database
    try_connect_to_db()

    try:
        # Connect to the database
        db = firestore.client()

        # Add the new post to the 'posts' collection
        new_post_ref = db.collection("posts").document()

        data["author"] = db.document(data["author"])

        for comment in data["comments"]:
            comment["author"] = db.document(comment["author"])

        new_post_ref.set(data)

        # # Update user posts list
        # Get the user reference
        user_ref = db.collection("users").document(data["author"].id)

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
@app.route("/api/posts/<post_id>", methods=["PUT"])
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

    # Validate the JSON res
    validation_error, status_code = post_validation(res)
    if validation_error:
        return jsonify(validation_error), status_code

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
@app.route("/api/posts/<post_id>", methods=["DELETE"])
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


# Get all posts of specific user
@app.route("/api/posts/user/<user_id>", methods=["GET"])
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
            # Get the post reference
            post_ref = db.collection("posts").document(
                post_doc.path[len("posts/") :]
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


# Get a specific user by id
@app.route("/api/users/<user_id>", methods=["GET"])
def get_user(user_id):
    """
    Get a specific user by ID.

    Args:
        user_id (str): The ID of the user to retrieve.

    Returns:
        dict: A dictionary representing the user.

    Raises:
        ValueError: If an error occurs while connecting to the database.
        ValueError: If the specific user is not found.
    """
    # Connect to the database
    try:
        connect_to_db()
    except Exception as e:
        print("Error connecting to the database:", str(e))
        return (
            jsonify({"error": "Database connection error"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Get the database
    db = firestore.client()

    # Get the User by ID
    user_ref = db.collection("users").document(
        user_id
    )  # Check if collection is called "users"
    user_doc = user_ref.get()

    # Check if the user exists
    if not user_doc.exists:
        return (
            jsonify({"error": "No user found"}),
            status.HTTP_404_NOT_FOUND,
        )

    # Convert the user document to a dictionary
    user_data = user_doc.to_dict()

    # Convert the bio and username to strings
    user_data["bio"] = str(user_data["bio"])
    user_data["username"] = str(user_data["username"])
    # Convert the bookmarks, followers, following, likes, and posts to refernces
    user_data["bookmarks"] = [
        ref.path for ref in user_data.get("bookmarks", [])
    ]
    user_data["followers"] = [
        ref.path for ref in user_data.get("followers", [])
    ]
    user_data["following"] = [
        ref.path for ref in user_data.get("following", [])
    ]
    user_data["likes"] = [ref.path for ref in user_data.get("likes", [])]
    user_data["posts"] = [ref.path for ref in user_data.get("posts", [])]

    # Return the user ID as Dictionary
    return user_data


# Validate the post verifying it has the correct fields
def user_validation(data):
    """
    Validate the JSON data for creating or updating a user.

    Expects JSON data with the following format:

    {
        "bio": "<Users bio>",
        "username": "<Users Username>",
        "bookmarks": "<Users number of bookmarks>",
        "likes": "<Users number of likes>",
        "posts": "<Users number of posts>",
        "followers": "<Users number of followers>",
        "following": "<Users number of following other users>"
    }

    Args:
        data (dict): JSON data representing the user.

    Returns:
        tuple: A tuple containing a dictionary of errors (if any) and a status code.
    """

    if not data:
        return (
            jsonify({"error": "No data provided"}),
            status.HTTP_400_BAD_REQUEST,
        )

    # Check for missing required fields
    required_fields = [
        "bio",
        "username",
        "bookmarks",
        "likes",
        "posts",
        "followers",
        "following",
    ]
    missing_fields = [field for field in required_fields if field not in data]

    # Validate fields
    if (
        not isinstance(data, dict)
        or "bio" not in data
        or "username" not in data
        or "bookmarks" not in data
        or "likes" not in data
        or "posts" not in data
        or "followers" not in data
        or "following" not in data
    ):
        return (
            jsonify(
                {"error": f"Missing field(s):  {', '.join(missing_fields)}"}
            ),
            status.HTTP_400_BAD_REQUEST,
        )

    return None, status.HTTP_200_OK


# Create a new user
@app.route("/api/users", methods=["POST"])
def create_user():
    """
    Create a new user.

    Args:
        N/A

    Returns:
        dict: A dictionary representing the newly created user.

    Raises:
        ValueError: If an error occurs while connecting to the database.
        ValueError: If the specific user already exists.
    """
    # Get data from the request
    data = request.json

    # Check that data is valid
    validation_error, status_code = user_validation(data)
    if validation_error:
        return validation_error, status_code

    # The request has been validated, connect to the database
    try_connect_to_db()

    try:
        # Connect to the database
        db = firestore.client()

        # Add the new user to the 'users' collection
        new_user_ref = db.collection("users").document()

        # Set the user data
        new_user_ref.set(data)

        # Return the newly created user
        return jsonify(data), status.HTTP_201_CREATED

    except Exception as e:
        print("Error adding new user:", str(e))
        return (
            jsonify({"error": "Error adding new user"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Update an existing user
@app.route("/api/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    """
    Update an existing user.

    Args:
        user_id (str): The ID of the user to be updated.

    Returns:
        dict: A dictionary representing the updated user.

    Raises:
        ValueError: If an error occurs while connecting to the database.
        ValueError: If there was an error updating the user.
    """
    # Get data from the request
    data = request.json

    # Check that data is valid
    validation_error, status_code = user_validation(data)
    if validation_error:
        return validation_error, status_code

    # The request has been validated, connect to the database
    try_connect_to_db()

    try:
        # Connect to the database
        db = firestore.client()

        # Add the new user to the 'users' collection
        new_user_ref = db.collection("users").document(user_id)
        new_user_data = new_user_ref.get().to_dict()

        # Convert the bookmarks list to a list of document references
        new_user_data["bookmarks"] = [
            db.collection("posts").document(bookmark)
            for bookmark in data["bookmarks"]
        ]

        # Convert the followers list to a list of document references
        new_user_data["followers"] = [
            db.collection("users").document(follower)
            for follower in data["followers"]
        ]

        # Convert the following list to a list of document references
        new_user_data["following"] = [
            db.collection("users").document(following)
            for following in data["following"]
        ]

        # Convert the likes list to a list of document references
        new_user_data["likes"] = [
            db.collection("posts").document(like) for like in data["likes"]
        ]

        # Update the users bio
        new_user_data["bio"] = data["bio"]

        # Update the users username
        new_user_data["username"] = data["username"]

        new_user_ref.update(new_user_data)

        # Return the newly created user
        return jsonify(data), status.HTTP_200_OK

    except Exception as e:
        print("Error updating user:", str(e))
        return (
            jsonify({"error": "Error updating user"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Delete a user
@app.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    """
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

        # Get the user reference
        user_ref = db.collection("users").document(user_id)

        # Get the user data
        user_data = user_ref.get().to_dict()

        # Delete all posts from the user
        for post in user_data["posts"]:
            post_ref = db.document(post.path)
            post_ref.delete()

        # Delete the user
        user_ref.delete()

        # Return a success message
        return jsonify({"message": "User deleted"}), status.HTTP_200_OK

    except Exception as e:
        print("Error deleting user:", str(e))
        return (
            jsonify({"error": "Error deleting user"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


if __name__ == "__main__":
    app.run(debug=True)
