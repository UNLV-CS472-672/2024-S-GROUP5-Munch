import os
import firebase_admin
import status
from flask import Flask, jsonify, request
from firebase_admin import credentials
from firebase_admin import firestore
from dotenv import load_dotenv

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


# Validate the post verifying it has the correct fields
def post_validation(data):
    """
    Validate the JSON data for creating or updating a post.

    Expects JSON data with the following format:
    {
        "author": {
            "bio": "Author's bio",
            "username": "Author's username"
        },
        "comments": [
            {
                "author": {
                    "bio": "Comment author's bio",
                    "username": "Comment author's username"
                },
                "comment": "Comment text",
                "creation_date": "Comment creation date (optional)"
            },
            ...
        ],
        "creation_date": "Post creation date",
        "description": "Post description",
        "likes": "Number of likes",
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

    # Check for missing required fields
    required_fields = [
        "author",
        "comments",
        "creation_date",
        "description",
        "likes",
        "pictures",
    ]
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return (
            jsonify(
                {
                    "error": f"Missing required field(s): {', '.join(missing_fields)}"
                }
            ),
            status.HTTP_400_BAD_REQUEST,
        )

    # Validate 'author' field
    author_data = data.get("author", {})
    if (
        not isinstance(author_data, dict)
        or "bio" not in author_data
        or "username" not in author_data
    ):
        return (
            jsonify(
                {"error": "Author field must contain 'bio' and 'username'"}
            ),
            status.HTTP_400_BAD_REQUEST,
        )

    # Validate 'comments' field
    comments_data = data.get("comments", [])
    for comment in comments_data:
        if (
            not isinstance(comment, dict)
            or "author" not in comment
            or "comment" not in comment
        ):
            return (
                jsonify(
                    {
                        "error": "Each comment must contain 'author' and 'comment'"
                    }
                ),
                status.HTTP_400_BAD_REQUEST,
            )
        if (
            not isinstance(comment["author"], dict)
            or "bio" not in comment["author"]
            or "username" not in comment["author"]
        ):
            return (
                jsonify(
                    {
                        "error": "Author of each comment must contain 'bio' and 'username'"
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

    # Get the post by ID
    post_ref = db.collection("posts").document(post_id)
    post_doc = post_ref.get()

    # Check if the post exists
    if not post_doc.exists:
        return jsonify({"error": "Post not found"}), status.HTTP_404_NOT_FOUND

    # Convert the post to a dictionary
    post_data = post_doc.to_dict()

    # Convert the date to string
    post_data["creation_date"] = str(post_data["creation_date"])
    # Convert the author to a dictionary
    post_data["author"] = post_data["author"].get().to_dict()
    # Convert the comments to a list of dictionaries
    for comment in post_data["comments"]:
        # Convert the date to string
        comment["creation_date"] = str(comment["creation_date"])
        # Convert the author to a dictionary
        comment["author"] = comment["author"].get().to_dict()

    return post_data


# Create a new post
@app.route("/api/posts", methods=["POST"])
def create_post():
    """
    Create a new post.

    Returns:
        dict: A dictionary representing the newly created post.
    """
    # Get data, check if it is empty
    data = request.json

    # Check that data is valid
    validation_error, status_code = post_validation(data)
    if validation_error:
        return validation_error, status_code

    # The request has been validated, connect to the database
    try:
        connect_to_db()
    except Exception as e:
        print("Error connecting to the database:", str(e))
        return (
            jsonify({"error": "Database connection error"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        # Connect to the database
        db = firestore.client()

        # Add the new post to the 'posts' collection
        new_post_ref = db.collection("posts").document()
        new_post_ref.set(data)

        # Return the newly created post
        return jsonify(data), status.HTTP_201_CREATED

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
    data = request.json

    # Validate the JSON data
    validation_error, status_code = post_validation(data)
    if validation_error:
        return jsonify(validation_error), status_code

    # The request has been validated, connect to the database
    try:
        connect_to_db()
    except Exception as e:
        print("Error connecting to the database:", str(e))
        return (
            jsonify({"error": "Database connection error"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        # Connect to the database
        db = firestore.client()

        # Update the post in the 'posts' collection
        post_ref = db.collection("posts").document(post_id)
        post_ref.update(data)

        # Return the updated post
        return jsonify(data), status.HTTP_200_OK

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
    try:
        connect_to_db()
    except Exception as e:
        print("Error connecting to the database:", str(e))
        return (
            jsonify({"error": "Database connection error"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        # Connect to the database
        db = firestore.client()

        # Delete the post from the 'posts' collection
        db.collection("posts").document(post_id).delete()

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

    # Get first 50 posts
    all_posts = (
        db.collection("posts")
        .where("author", "==", db.collection("users").document(user_id))
        .limit(50)
        .get()
    )
    all_posts = [post.to_dict() for post in all_posts]

    if not all_posts:
        return jsonify({"error": "No posts found"}), status.HTTP_404_NOT_FOUND

    # Convert non-serializable data to string
    for post in all_posts:
        # Convert the date to string
        post["creation_date"] = str(post["creation_date"])
        # Convert the author to a dictionary
        post["author"] = post["author"].get().to_dict()
        # Convert the comments to a list of dictionaries
        for comment in post["comments"]:
            # Convert the date to string
            comment["creation_date"] = str(comment["creation_date"])
            # Convert the author to a dictionary
            comment["author"] = comment["author"].get().to_dict()

    # Return the posts
    return all_posts


# Validate the post verifying it has the correct fields
def user_validation(data):
    """
    Validate the JSON data for creating or updating a user.

    Expects JSON data with the following format:

    {
        "bio": "<Users bio>",
        "username": "<Users Username>",
        "userID": "<Users unique ID>",
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
        "userID",
        "bookmarks",
        "likes",
        "posts",
        "followers",
        "following"
    ]
    missing_fields = [field for field in required_fields if field not in data]
    
    # Validate fields
    if (
        not isinstance(data, dict)
        or "bio" not in data
        or "username" not in data
        or "userID" not in data
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
    try:
        connect_to_db()
    except Exception as e:
        print("Error connecting to the database:", str(e))
        return (
            jsonify({"error": "Database connection error"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        # Connect to the database
        db = firestore.client()

        # Add the new user to the 'users' collection
        new_user_ref = db.collection("users").document()
        new_user_ref.set(data)
        
        # Return the newly created user
        return jsonify(data), status.HTTP_201_CREATED

    except Exception as e:
        print("Error adding new user:", str(e))
        return (
            jsonify({"error": "Error adding new user"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


if __name__ == "__main__":
    app.run(debug=True)
