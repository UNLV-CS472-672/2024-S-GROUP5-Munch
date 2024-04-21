import status
from flask import jsonify, request, Blueprint
from firebase_admin import firestore
from helper_functions import try_connect_to_db
import datetime

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
                jsonify(
                    {"error": "Trying to follow/unfollow non-existent user"}
                ),
                status.HTTP_404_NOT_FOUND,
            )

        # Get the following and followers lists
        first_user_following = first_user_data.get("following", [])
        second_user_followers = second_user_data.get("followers", [])

        # Check if the users are already following each other
        first_user_following_ids = [user_map.get("user") for user_map in first_user_following]
        second_user_followers_ids = [user_map.get("user") for user_map in second_user_followers]

        # If users are already following each other, unfollow them
        if second_user_ref in first_user_following_ids and first_user_ref in second_user_followers_ids:
            # Update the following list
            for following in first_user_following:
                if following.get("user") == second_user_ref:
                    first_user_following.remove(following)
                    first_user_ref.update({"following": first_user_following})
                    break

            # Update the followers list
            for followers in second_user_followers:
                if followers.get("user") == first_user_ref:
                    second_user_followers.remove(followers)
                    second_user_ref.update({"followers": second_user_followers})
                    break

            return (
                jsonify({"message": "User unfollowed successfully"}),
                status.HTTP_200_OK,
            )
        else:
            # Get current UTC time
            current_time = datetime.datetime.utcnow()
            # Format the datetime object
            formatted_time = current_time.strftime('%Y-%m-%d %H:%M:%S.%f') + '+00:00'
            
            # Update the following list
            first_user_following.append({"user": second_user_ref, "timestamp": formatted_time})
            first_user_ref.update({"following": first_user_following})

            # Update the followers list
            second_user_followers.append({"user": first_user_ref, "timestamp": formatted_time})
            second_user_ref.update({"followers": second_user_followers})

            return (
                jsonify({"message": "User followed successfully"}),
                status.HTTP_200_OK,
            )

    except Exception as e:
        print("Error following/unfollowing user:", str(e))
        return (
            jsonify({"error": "Error following/unfollowing user"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
