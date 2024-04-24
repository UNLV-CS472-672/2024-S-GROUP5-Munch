import os
import firebase_admin
import status
from flask import jsonify
from firebase_admin import credentials
from firebase_admin import firestore
import uuid


# Check if User exists in database
def check_user_existence(user_id):
    try:
        # Attempt to connect to the database
        try_connect_to_db()

        # Get reference to the users collection
        db = firestore.client()
        users_collection = db.collection("users")

        # Get the document reference for the specified user_id
        user_doc_ref = users_collection.document(user_id)

        if user_doc_ref.get().exists:
            return True
        else:
            return False
    except Exception as e:
        print("An error occurred:", e)
        return False


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
            firebase_admin.initialize_app(cred, {
                'storageBucket': 'munch-37564.appspot.com'
            })
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


# Validate the recipe verifying it has the correct fields
def recipe_validation(data):
    """
    Validate the JSON data for creating or updating a post.

    Expects JSON data with the following format:
    {
        "author": "Reference to user ID here",
        "comments": [
            {
                "author": "<string> Reference to user ID here",
                "comment": "<string> Comments here",
                "comment_id": "<string> Comment ID here",
                "creation_date": "<string> Creation Date here",
                "username": "<string> Authors username field here"
            }
        ],
        "creation_date": "<string> Creation Date here",
        "description": "<string> deciption here",
        "ingredients": [
            "<string> ingredient #1",
            "<string> ingredient #2"
        ],
        "likes": "<int> likes here",
        "pictures": [
            "<string> Route to picture 1",
            "<string> Route to picture 2"
        ],
        "steps": [
            "<string> Step 1 here",
            "<string> Step 2 here"
        ],
        "username": "<string> Authors username field"
    }

    Args:
        data (dict): JSON data representing the recipe.

    Returns:
        tuple: A tuple containing a dictionary of errors (if any) and a status code.
    """

    # Check if data is provided
    if not data:
        return (
            jsonify({"error": "No data provided"}),
            status.HTTP_400_BAD_REQUEST,
        )

    try:
        connect_to_db()  # Connect to database
    except Exception as e:
        print("Error connecting to the database:", str(e))
        return (
            jsonify({"error": "Database connection error"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Get Firestore client
    db = firestore.client()
    recipes_collection = db.collection("recipes")  # Access recipes collection

    # get required fields from existing recipies in the collection
    required_fields = set(
        key
        for recipe in recipes_collection.stream()
        for key in recipe.to_dict().keys()
    )

    # Identify missing or extra fields in the input data
    missing_fields = [field for field in required_fields if field not in data]
    extra_fields = [field for field in data if field not in required_fields]

    # Return error message for missing or extra fields
    if missing_fields:
        return field_error_message(
            "Missing required field(s): ", missing_fields
        )

    if extra_fields:
        return field_error_message("Input has extra field(s): ", extra_fields)

    # Access 'users' collection to validate author and commenter IDs
    users_collection = db.collection("users")
    user_ids = [user.id for user in users_collection.stream()]

    # Validate 'author' field
    author_data = data.get("author", str)

    if not isinstance(author_data, str):
        return (
            jsonify({"error": f"Invalid format for author"}),
            status.HTTP_400_BAD_REQUEST,
        )

    if invalid_author_check(author_data, user_ids):
        return (
            jsonify(
                {"error": f"Author field in post is not a reference to a user"}
            ),
            status.HTTP_400_BAD_REQUEST,
        )

    # Validate 'comments' field
    required_comment_fields = set(
        key
        for recipe in recipes_collection.stream()
        for comment in recipe.to_dict().get("comments", {})
        for key in comment.keys()
    )
    comments_data = data.get("comments", [])
    for comment in comments_data:

        # Get missing or extra comment fields if any
        missing_comment_fields = [
            field for field in required_comment_fields if field not in comment
        ]
        extra_comment_fields = [
            field for field in comment if field not in required_comment_fields
        ]

        # Post error if any missing or extra fields
        if missing_comment_fields:
            return field_error_message(
                "Missing required comment field(s): ", missing_comment_fields
            )

        if extra_comment_fields:
            return field_error_message(
                "Comment input has extra field(s): ", extra_comment_fields
            )

        # Make sure comment is proper type of dictionary
        if (
            not isinstance(comment, dict)
            or not isinstance(comment["comment"], str)
            or not isinstance(comment["creation_date"], str)
        ):
            return (
                jsonify({"error": "Invalid format for comment"}),
                status.HTTP_400_BAD_REQUEST,
            )

        # Make sure commenter is an actual user
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


def generate_unique_id():
    """
    Generate a new unique ID.

    Returns:
        str: A new unique ID.
    """
    return str(uuid.uuid4())
