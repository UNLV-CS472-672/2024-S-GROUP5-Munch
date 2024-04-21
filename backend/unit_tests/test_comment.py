from unittest import TestCase
from unittest.mock import patch

import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import status
from server import app


class CommentTest(TestCase):
    # Set up client
    def setUp(self):
        self.app = app
        self.app.testing = True
        self.client = self.app.test_client()

    # Test Function
    def test_comment(self):

        # Testing User Data
        testing_user_id = "comment_test_id"
        username = "test_comment_user"
        user_data = {
            "bio": "",
            "bookmarks": [],
            "followers": [],
            "following": [],
            "likes": [],
            "posts": [],
            "username": username,
        }

        # Create user
        create_user = self.client.post(f"/api/users/{testing_user_id}")
        self.assertEqual(create_user.status_code, status.HTTP_201_CREATED)
        create_user = self.client.put(
            f"/api/users/{testing_user_id}", json=user_data
        )

        # Testing Post Data
        new_post_mock_data = {
            "author": f"users/{testing_user_id}",
            "comments": [],
            "creation_date": "2024-03-20 21:41:30.786000+00:00",
            "description": "Comment Unit Test Post",
            "likes": [],
            "location": "36.1048299,-115.1454664",
            "pictures": [],
            "username": "test_comment_user",
        }

        # Create post
        create_post = self.client.post(f"/api/posts", json=new_post_mock_data)
        self.assertEqual(create_post.status_code, status.HTTP_201_CREATED)

        # Grab the post that was just created
        get_user_posts = self.client.get(f"/api/users/{testing_user_id}")
        post_id = get_user_posts.json["posts"][0]

        # Comment data
        new_comment_data = {"comment": "This is a new comment for comment test"}

        # Append endpoint to post id and test patch comment
        post_id = post_id[len("posts/") :]
        patch_comment = self.client.patch(
            f"/api/posts/comment/{testing_user_id}/{post_id}",
            json=new_comment_data,
        )
        self.assertEqual(patch_comment.status_code, status.HTTP_200_OK)

        # Get the comment id from the post
        get_post = self.client.get(f"/api/posts/{post_id}")
        comment_id = get_post.json["comments"][0]["comment_id"]

        # Delete the comment and check passing test
        patch_comment = self.client.delete(
            f"/api/posts/comment/{testing_user_id}/{post_id}/{comment_id}",
            json=new_comment_data,
        )
        self.assertEqual(patch_comment.status_code, status.HTTP_200_OK)

        # Testing Errors
        error_post = self.client.patch(
            f"api/posts/comment/{testing_user_id}/ThisDoesntWork"
        )
        self.assertEqual(error_post.status_code, status.HTTP_404_NOT_FOUND)

        error_post = self.client.patch(
            f"api/posts/comment/ThisDoesntWork/{post_id}"
        )
        self.assertEqual(error_post.status_code, status.HTTP_404_NOT_FOUND)

        error_post = self.client.delete(
            f"api/posts/comment/{testing_user_id}/ThisDoesntWork/{comment_id}"
        )
        self.assertEqual(error_post.status_code, status.HTTP_404_NOT_FOUND)

        error_post = self.client.delete(
            f"api/posts/comment/ThisDoesntWork/{post_id}/{comment_id}"
        )
        self.assertEqual(error_post.status_code, status.HTTP_404_NOT_FOUND)

        delete = self.client.delete(f"/api/users/{testing_user_id}")
