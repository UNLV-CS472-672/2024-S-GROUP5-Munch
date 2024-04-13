from unittest import TestCase
from unittest.mock import patch

import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import status
from server import app


class FollowTest(TestCase):
    # set up
    def setUp(self):
        self.app = app
        self.app.testing = True

        self.client = self.app.test_client()

    # actual tests of follows
    def test_follow(self):
        # create mock user_1 and user_2 and test it
        user_1 = "user_1"
        user_2 = "user_2"

        # Create user_1
        create_user_1 = self.client.post(f"/api/users/{user_1}")

        # Check if status code received is expected (201 user created)
        self.assertEqual(create_user_1.status_code, status.HTTP_201_CREATED)

        # Create user_2
        create_user_2 = self.client.post(f"/api/users/{user_2}")

        # Check if status code received is expected (201 user created)
        self.assertEqual(create_user_2.status_code, status.HTTP_201_CREATED)

        # Try following non-existent user
        follow_non_existent_user = self.client.patch(f"/api/users/{user_1}/follow/non_existent_user")

        # Check if status code received is expected (404 User not found)
        self.assertEqual(follow_non_existent_user.status_code, status.HTTP_404_NOT_FOUND)

        # Try following from non-existent user
        follow_from_non_existent_user = self.client.patch(f"/api/users/non_existent_user/follow/{user_1}")

        # Check if status code received is expected (404 User not found)
        self.assertEqual(follow_from_non_existent_user.status_code, status.HTTP_404_NOT_FOUND)

        # Check user_1 and user_2 followers and following are empty
        get_user_1_res = self.client.get(f"/api/users/{user_1}")

        self.assertEqual(get_user_1_res.json["followers"], [])
        self.assertEqual(get_user_1_res.json["following"], [])

        get_user_2_res = self.client.get(f"/api/users/{user_2}")

        self.assertEqual(get_user_2_res.json["followers"], [])
        self.assertEqual(get_user_2_res.json["following"], [])

        # Test following user_2
        follow_user_2 = self.client.patch(f"/api/users/{user_1}/follow/{user_2}")

        # Get user_1 object after issuing follow
        get_user_1_res = self.client.get(f"/api/users/{user_1}")

        # Get user_2 object after issuing follow
        get_user_2_res = self.client.get(f"/api/users/{user_2}")

        # Check if user_1 object is now following user_2
        self.assertEqual(get_user_1_res.json["followers"], [])
        self.assertEqual(get_user_1_res.json["following"], [f"users/{user_2}"])

        # Check if user_1 object is now being followed by user_1
        self.assertEqual(get_user_2_res.json["followers"], [f"users/{user_1}"])
        self.assertEqual(get_user_2_res.json["following"], [])

        # Check that for proper json message and proper http response (200)
        self.assertEqual(follow_user_2.json["message"], "User followed successfully")
        self.assertEqual(follow_user_2.status_code, status.HTTP_200_OK)

        # Test unfollowing user_2
        unfollow_user_2 = self.client.patch(f"/api/users/{user_1}/follow/{user_2}")

        # Get user_1 object after issuing follow
        get_user_1_res = self.client.get(f"/api/users/{user_1}")

        # Get user_2 object after issuing follow
        get_user_2_res = self.client.get(f"/api/users/{user_2}")

        # Check if user_1 is not following user_2 anymore
        self.assertEqual(get_user_1_res.json["followers"], [])
        self.assertEqual(get_user_1_res.json["following"], [])

        # Check if user_2 is not being followed by user_1 anymore
        self.assertEqual(get_user_2_res.json["followers"], [])
        self.assertEqual(get_user_2_res.json["following"], [])

        # Check that for proper json message and proper http response (200)
        self.assertEqual(unfollow_user_2.json["message"], "User unfollowed successfully")
        self.assertEqual(unfollow_user_2.status_code, status.HTTP_200_OK)

        # test exception
        with patch(
            "follow_routes.firestore.client",
            side_effect=Exception("Simulating an exception"),
        ):
            patch_follow = self.client.patch(
                f"/api/users/{user_1}/follow/{user_2}"
            )

            self.assertEqual(
                patch_follow.status_code,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
