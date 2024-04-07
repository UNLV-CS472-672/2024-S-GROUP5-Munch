import status
from flask import jsonify, request, Blueprint
from firebase_admin import firestore
from helper_functions import try_connect_to_db

follow_bp = Blueprint("follow", __name__)


@follow_bp.route(
    "/api/users/<first_user>/follow/<second_user>", methods=["PATCH"]
)
def follow_user(first_user, second_user):
    """
    Toggle following a user.
    Args:
        first_user (str): The ID of the user performing the action.
        second_user (str): The ID of the user to be followed or unfollowed.
    Returns:
        dict: A message confirming the user has been followed.
    Raises:
        ValueError: If an error occurs while connecting to the database.
        ValueError: If any user is not found.
    """
    try:
        try_connect_to_db()

        # Connect to the database
        db = firestore.client()

        # Fetch first user document from Firestore
        first_user_ref = db.collection("users").document(first_user)
        first_user_data = first_user_ref.get().to_dict()

        # Ensure the first user exists
        if not first_user_data:
            return (
                jsonify({"error": "User not found"}),
                status.HTTP_404_NOT_FOUND,
            )

        # Fetch second user document from Firestore
        second_user_ref = db.collection("users").document(second_user)
        second_user_data = second_user_ref.get().to_dict()

        # Ensure the second user exists
        if not second_user_data:
            return (
                jsonify({"error": "Trying to follow/unfollow non-existent user"}),
                status.HTTP_404_NOT_FOUND,
            )

        # Get the following and followers lists
        first_user_following = first_user_data.get("following", [])
        second_user_followers = second_user_data.get("followers", [])

        # Check if the users are already following each other
        if (
            second_user_ref not in first_user_following
            and first_user_ref not in second_user_followers
        ):
            # Update the following list
            first_user_following.append(second_user_ref)
            first_user_ref.update({"following": first_user_following})

            # Update the followers list
            second_user_followers.append(first_user_ref)
            second_user_ref.update({"followers": second_user_followers})

            return (
                jsonify({"message": "User followed successfully"}),
                status.HTTP_200_OK,
            )
        else:
            # Update the following list
            first_user_following.remove(second_user_ref)
            first_user_ref.update({"following": first_user_following})

            # Update the followers list
            second_user_followers.remove(first_user_ref)
            second_user_ref.update({"followers": second_user_followers})

            return (
                jsonify({"message": "User unfollowed successfully"}),
                status.HTTP_200_OK,
            )

    except Exception as e:
        print("Error following/unfollowing user:", str(e))
        return (
            jsonify({"error": "Error following/unfollowing user"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
