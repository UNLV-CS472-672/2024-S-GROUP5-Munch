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


# Get all posts of specific user
@app.route("/api/posts/<userid>", methods=["GET"])
def get_user_posts(userid):
    '''
    Get all posts of a specific user.

    Args:
        userid (str): The ID of the user whose posts are to be retrieved.

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
    '''
    # Connect to the database
    try:
        connect_to_db()
    except Exception as e:
        print("Error connecting to the database:", str(e))
        return jsonify({"error": "Database connection error"}), status.HTTP_404_NOT_FOUND

    # Get the database
    db = firestore.client()

    # Get first 50 posts
    all_posts = db.collection("posts").where("author", "==", db.collection("users").document(userid)).limit(50).get()
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


# Get a specific post by id
@app.route("/api/posts/<int:post_id>", methods=["GET"])
def get_post(post_id):
    post = next((p for p in posts if p["id"] == post_id), None)
    if post:
        return jsonify(post)
    else:
        return jsonify({"error": "Post not found"}), status.HTTP_404_NOT_FOUND


# Create a new post
@app.route("/api/posts", methods=["POST"])
def create_post():
    new_post = request.json
    new_post["id"] = len(posts) + 1
    posts.append(new_post)
    return jsonify(new_post), status.HTTP_201_CREATED


# Update an existing post
@app.route("/api/posts/<int:post_id>", methods=["PUT"])
def update_post(post_id):
    for post in posts:
        if post["id"] == post_id:
            post.update(request.json)
            return jsonify(post)
    return jsonify({"error": "Post not found"}), status.HTTP_404_NOT_FOUND


# Delete a post
@app.route("/api/posts/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    global posts
    posts = [p for p in posts if p["id"] != post_id]
    return jsonify({"message": "Post deleted"}), status.HTTP_200_OK


if __name__ == "__main__":
    app.run(debug=True)
