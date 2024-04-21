import status
from flask import jsonify, request, Blueprint
from firebase_admin import firestore
import copy
from helper_functions import try_connect_to_db

bookmark_bp = Blueprint("bookmark", __name__)


# Toggle bookmark on or off
@bookmark_bp.route("/api/users/<user_id>/bookmarks", methods=["PATCH"])
def toggle_bookmark(user_id):
    """
    Toggle bookmarks.

    Returns:
        dict: This dict contains the post/recipe from the request JSON if it's valid.
    """
    # get json request data
    res = request.json

    # make sure post is a field in that data
    if "post" not in res:
        return (
            jsonify({"error": f"Missing post to bookmark"}),
            status.HTTP_400_BAD_REQUEST,
        )

    # copy data
    data = copy.deepcopy(res)
    # request connection to database
    try_connect_to_db()

    try:
        # connect to database
        db = firestore.client()

        # Get posts collection, then get all post ids
        posts_collection = db.collection("posts")
        post_ids = [post.id for post in posts_collection.stream()]

        # Get recipes collection, then get all recipe ids
        recipes_collection = db.collection("recipes")
        recipe_ids = [recipe.id for recipe in recipes_collection.stream()]

        # get post id from data, make sure it's an actual post or recipe, if not return error
        if (
            str(data["post"].split("/")[1]) not in post_ids
            and str(data["post"].split("/")[1]) not in recipe_ids
        ):
            return (
                jsonify(
                    {
                        "error": f"Post or recipe requested to bookmark does not exist"
                    }
                ),
                status.HTTP_400_BAD_REQUEST,
            )

        # get user collection based on user id and convert to dict
        user_ref = db.collection("users").document(user_id)
        user_data = user_ref.get().to_dict()

        # convert the post from the data to a reference
        post_ref = db.document(data["post"])

        # if bookmark is not in user database, add the reference to user database
        if str(data["post"]) not in [
            bookmark.path for bookmark in user_data["bookmarks"]
        ]:
            user_data["bookmarks"].append(post_ref)
            user_ref.update(user_data)
        # if bookmark already in user database, remove the reference from user database
        else:
            user_data["bookmarks"].remove(post_ref)
            user_ref.update(user_data)

        # return success and the original data
        return jsonify(res), status.HTTP_200_OK

    # in case of exception
    except Exception as e:
        print("Error adding new bookmark:", str(e))
        return (
            jsonify({"error": "Error adding new bookmark"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
