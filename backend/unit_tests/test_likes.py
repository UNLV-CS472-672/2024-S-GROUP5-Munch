import os
import sys

# Append parent directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import unittest
from server import app
import status
from unittest.mock import patch


class TestLikeRoutes(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.app.testing = True
        self.client = self.app.test_client()

    def test_like_and_unlike_post(self):
        testing_user_id = "test_user_id"

        # Create a test user
        create_user_response = self.client.post("/api/users/test_user_id")
        self.assertEqual(
            create_user_response.status_code, status.HTTP_201_CREATED
        )

        # Create a test post
        new_post_mock_data = {
            "author": f"users/{testing_user_id}",
            "comments": [
                {
                    "author": f"users/{testing_user_id}",
                    "comment": "Updating comment on my first post!",
                    "comment_id": "comment_id",
                    "creation_date": "2024-03-20 22:53:36.118000+00:00",
                    "username": "test_user",
                }
            ],
            "creation_date": "2024-03-20 21:41:30.786000+00:00",
            "description": "This is my first post and I just edited it!",
            "likes": [],
            "location": "36.1048299,-115.1454664",
            "pictures": [],
            "username": "test_user",
        }
        create_post_response = self.client.post(
            "/api/posts", json=new_post_mock_data
        )
        self.assertEqual(new_post_mock_data, create_post_response.json)
        self.assertEqual(
            create_post_response.status_code, status.HTTP_201_CREATED
        )

        # Call to get user route to get list of posts, this is to find post_id
        get_user_response = self.client.get(f"/api/users/{testing_user_id}")
        # Save the post id from the above response
        post_id = get_user_response.json["posts"][0].split("/")[1]

        # Like the post
        like_response = self.client.patch(
            f"/api/users/{testing_user_id}/like/{post_id}"
        )
        self.assertEqual(like_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            like_response.json["message"], "Post liked successfully"
        )

        # Unlike the post
        unlike_response = self.client.patch(
            f"/api/users/{testing_user_id}/unlike/{post_id}"
        )
        self.assertEqual(unlike_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            unlike_response.json["message"], "Post unliked successfully"
        )

        # Delete the test post
        delete_post_response = self.client.delete(f"/api/posts/{post_id}")
        self.assertEqual(delete_post_response.status_code, status.HTTP_200_OK)

        # Testing errors where user exists
        error_like = self.client.patch(
            f"/api/users/{testing_user_id}/like/invalid_post"
        )
        self.assertEqual(error_like.status_code, status.HTTP_404_NOT_FOUND)

        error_like = self.client.patch(
            f"/api/users/{testing_user_id}/unlike/invalid_post"
        )
        self.assertEqual(error_like.status_code, status.HTTP_404_NOT_FOUND)

        # Delete the test user
        delete_user_response = self.client.delete(
            f"/api/users/{testing_user_id}"
        )
        self.assertEqual(delete_user_response.status_code, status.HTTP_200_OK)

        # Testing errors where user doesn't exist
        error_like = self.client.patch(
            f"/api/users/invalid_user/like/{post_id}"
        )
        self.assertEqual(error_like.status_code, status.HTTP_404_NOT_FOUND)

        error_like = self.client.patch(
            f"/api/users/invalid_user/unlike/{post_id}"
        )
        self.assertEqual(error_like.status_code, status.HTTP_404_NOT_FOUND)

        # error_like_post_response = self.client.patch("/api/users/non_existent_user/unlike/non_existent_post/")
        # self.assertEqual(error_like_post_response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)


if __name__ == "__main__":
    unittest.main()
