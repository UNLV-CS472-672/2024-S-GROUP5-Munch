import status
from flask import jsonify, request, Blueprint
from firebase_admin import firestore
from helper_functions import try_connect_to_db
import datetime

like_bp = Blueprint("like", __name__)


@like_bp.route("/api/users/<user_id>/like/<post_id>", methods=["PATCH"])
def like_post(user_id, post_id):
    """
    Like a post.

    Args:
        user_id (str): The ID of the user performing the action.
        post_id (str): The ID of the post to be liked.

    Returns:
        dict: A message confirming the post has been liked.

    Raises:
        ValueError: If an error occurs while connecting to the database.
        ValueError: If the post or user is not found.
    """
    try_connect_to_db()

    # Connect to the database
    db = firestore.client()

    # Fetch user document from Firestore
    user_ref = db.collection("users").document(user_id)
    user_data = user_ref.get().to_dict()

    # Ensure the user exists
    if not user_data:
        return (
            jsonify({"error": "User not found"}),
            status.HTTP_404_NOT_FOUND,
        )

    # Fetch post document from Firestore
    post_ref = db.collection("posts").document(post_id)
    post_data = post_ref.get().to_dict()
    my_post = "posts"

    # Ensure the post exists
    if not post_data:
        # If a post doesnt exist check if it is a recipe
        post_ref = db.collection("recipes").document(post_id)
        post_data = post_ref.get().to_dict()

        if not post_data:
            return (
                jsonify({"error": "Post not found"}),
                status.HTTP_404_NOT_FOUND,
            )
        my_post = "recipes"

    # Append post reference to user's likes
    user_likes = user_data.get("likes", [])
    post_reference = db.document(f"{my_post}/{post_id}")
    if post_reference not in user_likes:
        # Get current UTC time
        current_time = datetime.datetime.utcnow()
        # Format the datetime object
        formatted_time = (
            current_time.strftime("%Y-%m-%d %H:%M:%S.%f") + "+00:00"
        )

        user_likes.append(post_reference)
        user_ref.update({"likes": user_likes})

        # Increment likes count in the post document
        post_likes = post_data.get("likes", [])
        post_likes.append(
            {
                "user": db.document(f"users/{user_id}"),
                "timestamp": formatted_time,
            }
        )
        post_ref.update({"likes": post_likes})

    return (
        jsonify({"message": "Post liked successfully"}),
        status.HTTP_200_OK,
    )


@like_bp.route("/api/users/<user_id>/unlike/<post_id>", methods=["PATCH"])
def unlike_post(user_id, post_id):
    """
    Unlike a post.

    Args:
        user_id (str): The ID of the user performing the action.
        post_id (str): The ID of the post to be unliked.

    Returns:
        dict: A message confirming the post has been unliked.

    Raises:
        ValueError: If an error occurs while connecting to the database.
        ValueError: If the post or user is not found.
    """
    try_connect_to_db()

    # Connect to the database
    db = firestore.client()

    # Fetch user document from Firestore
    user_ref = db.collection("users").document(user_id)
    user_data = user_ref.get().to_dict()

    # Ensure the user exists
    if not user_data:
        return (
            jsonify({"error": "User not found"}),
            status.HTTP_404_NOT_FOUND,
        )

    # Fetch post document from Firestore
    post_ref = db.collection("posts").document(post_id)
    post_data = post_ref.get().to_dict()
    my_post = "posts"

    # Ensure the post exists
    if not post_data:
        post_ref = db.collection("recipes").document(post_id)
        post_data = post_ref.get().to_dict()
        if not post_data:
            return (
                jsonify({"error": "Post not found"}),
                status.HTTP_404_NOT_FOUND,
            )
        my_post = "recipes"

    # Remove post reference from user's likes if it exists
    user_likes = user_data.get("likes", [])
    post_reference = db.document(f"{my_post}/{post_id}")
    if post_reference in user_likes:
        # Decrement likes count in the post document
        post_likes = post_data.get("likes", [])
        for like in post_likes:
            if like.get("user").path == f"users/{user_id}":
                post_likes.remove(like)
                post_ref.update({"likes": post_likes})
                break
        user_likes.remove(post_reference)
        user_ref.update({"likes": user_likes})

    return (
        jsonify({"message": "Post unliked successfully"}),
        status.HTTP_200_OK,
    )
