import status
from flask import jsonify, request, Blueprint
from firebase_admin import firestore
import copy
from helper_functions import try_connect_to_db

bookmark_bp = Blueprint("bookmark", __name__)

@bookmark_bp.route("/api/users/<user_id>/bookmarks", methods=["PATCH"])
def toggle_bookmark(user_id):
    res = request.json

    if "post" not in res:
        return (jsonify({"error": f"Missing post to bookmark"}),
        status.HTTP_400_BAD_REQUEST)

    data = copy.deepcopy(res)

    try_connect_to_db()

    try:
        db = firestore.client()

        posts_collection = db.collection("posts")
        post_ids = [post.id for post in posts_collection.stream()]
        
        recipes_collection = db.collection("recipes")
        recipe_ids = [recipe.id for recipe in recipes_collection.stream()]

        if str(data["post"].split("/")[1]) not in post_ids and str(data["post"].split("/")[1]) not in recipe_ids:
            return (jsonify({"error": f"Post or recipe, {data["post"]}, does not exist"}), 
                    status.HTTP_400_BAD_REQUEST)

        user_ref = db.collection("users").document(user_id)
        user_data = user_ref.get().to_dict()

        post_ref =  db.document(data["post"])

        # if bookmark is not in user database, add to user database
        if str(data["post"]) not in [bookmark.path for bookmark in user_data["bookmarks"]]:
            user_data["bookmarks"].append(post_ref)
            user_ref.update(user_data)
        # if bookmark already in user database, remove from user database
        else:
            user_data["bookmarks"].remove(post_ref)
            user_ref.update(user_data)

        return jsonify(res), status.HTTP_200_OK

    except Exception as e:
        print("Error adding new bookmark:", str(e))
        return (
            jsonify({"error": "Error adding new bookmark"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    