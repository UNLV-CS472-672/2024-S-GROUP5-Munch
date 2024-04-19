import status
from flask import jsonify, request, Blueprint
from firebase_admin import firestore
from helper_functions import try_connect_to_db, generate_unique_id
import datetime
import uuid
import copy


comment_bp = Blueprint("comment", __name__)


@comment_bp.route("/api/posts/comment/<user_id>/<post_id>", methods=["PATCH"])
def comment_post(user_id, post_id):
    # user_id: Whoever comments on the post
    # post_id: The post reference itself

    # Connect to database
    try_connect_to_db()
    db = firestore.client()

    # Gives current time
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f%z")

    # Grab the posts reference from firebase DB using post id, then grab data from reference
    post_ref = db.collection("posts").document(post_id)
    post_data = post_ref.get().to_dict()

    # Error checking that post exists
    if not post_data:
        return (
            jsonify({"error": "Post not found"}),
            status.HTTP_404_NOT_FOUND,
        )

    # Grab the users reference from firebase DB using user id, the grab data from reference
    user_ref = db.collection("users").document(user_id)
    user_data = user_ref.get().to_dict()
    # Error checking that user exists
    if not user_data:
        return (
            jsonify({"error": "User not found"}),
            status.HTTP_404_NOT_FOUND,
        )

    # Grab comments from the post
    post_comments = post_data.get("comments")

    # Get the request's json (Should be the comment itself) i.e. "comment": "Some comment information"
    res = request.json

    # Create a copy of the result
    data = copy.deepcopy(res)

    # Setting up data with author id, use db.document to create reference in Firebase
    new_author = db.document("users/" + user_id)
    new_comment = res["comment"]
    new_comment_id = generate_unique_id()
    username = user_data["username"]

    comment_json = {
        "author": new_author,
        "comment": new_comment,
        "comment_id": new_comment_id,
        "creation_date": current_time,
        "username": username,
    }

    # Append the comment to the list of comments, set it to the new post data and set it into the reference
    post_comments.append(comment_json)
    post_data["comments"] = post_comments
    post_ref.set(post_data)

    comment_json["author"] = comment_json["author"].path
    return jsonify(comment_json), status.HTTP_200_OK


@comment_bp.route(
    "/api/posts/comment/<user_id>/<post_id>/<comment_id>", methods=["DELETE"]
)
def delete_comment_post(user_id, post_id, comment_id):
    # user_id: Who commented on the post
    # post_id: The post reference itself
    # comment_id: The ID of the comment on the post

    try_connect_to_db()
    db = firestore.client()

    # Grab the posts reference from firebase DB using post id, then grab data from reference
    post_ref = db.collection("posts").document(post_id)
    post_data = post_ref.get().to_dict()

    # Error checking that post exists

    if not post_data:
        return (
            jsonify({"error": "Post not found"}),
            status.HTTP_404_NOT_FOUND,
        )

    # Grab comments from the post
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

    # Set it to the new post data and set it into the reference

    post_data["comments"] = post_comments
    post_ref.update(post_data)

    return jsonify({"message": "deleted"}), status.HTTP_200_OK
