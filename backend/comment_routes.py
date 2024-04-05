import status
from flask import jsonify, request, Blueprint
from firebase_admin import firestore
from helper_functions import try_connect_to_db
import datetime
import uuid
import copy


def generate_unique_id():
    """
    Generate a new unique ID.

    Returns:
        str: A new unique ID.
    """
    return str(uuid.uuid4())


comment_bp = Blueprint("comment", __name__)


@comment_bp.route("/api/posts/comment/<user_id>/<post_id>", methods=["PATCH"])
def comment_post(user_id, post_id):
    # user_id: Who commented on the post
    # post_id: The post reference itself

    try_connect_to_db()
    db = firestore.client()

    # Gives current time
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f%z")

    post_ref = db.collection("posts").document(post_id)
    post_data = post_ref.get().to_dict()

    user_ref = db.collection("users").document(user_id)
    user_data = user_ref.get().to_dict()

    if not post_data:
        return (
            jsonify({"error": "Post not found"}),
            status.HTTP_404_NOT_FOUND,
        )

    post_comments = post_data.get("comments")

    res = request.json
    data = copy.deepcopy(res)

    new_author = db.document("users/" + user_id)
    new_comment = res["comment"]
    new_comment_id = generate_unique_id()
    username = user_data["username"]

    testing_json = {
        "author": new_author,
        "comment": new_comment,
        "comment_id": new_comment_id,
        "creation_date": current_time,
        "username": username,
    }

    post_comments.append(testing_json)
    post_data["comments"] = post_comments
    post_ref.set(post_data)

    return jsonify(request.json), status.HTTP_200_OK


@comment_bp.route(
    "/api/posts/comment/<user_id>/<post_id>/<comment_id>", methods=["DELETE"]
)
def delete_comment_post(user_id, post_id, comment_id):
    # user_id: Who commented on the post
    # post_id: The post reference itself

    try_connect_to_db()
    db = firestore.client()

    post_ref = db.collection("posts").document(post_id)
    post_data = post_ref.get().to_dict()

    if not post_data:
        return (
            jsonify({"error": "Post not found"}),
            status.HTTP_404_NOT_FOUND,
        )

    post_comments = post_data.get("comments")

    # Error Checking if Comment ID exist
    comment_to_delete = next(
        (
            comment
            for comment in post_comments
            if comment["comment_id"] == comment_id
        ),
        None,
    )
    if comment_to_delete is None:
        return (
            jsonify({"error": "Comment not found"}),
            status.HTTP_404_NOT_FOUND,
        )

    # Create a new list with comments except the one with the specified comment_id

    post_comments = [
        comment
        for comment in post_comments
        if comment["comment_id"] != comment_id
    ]

    post_data["comments"] = post_comments
    post_ref.update(post_data)

    return jsonify(request.json), status.HTTP_200_OK
