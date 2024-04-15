import os
import sys


# Append parent directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


import unittest
import status
from server import app


class TestAPI(unittest.TestCase):

    def setUp(self):
        self.app = app
        self.app.testing = True
        self.client = self.app.test_client()

    def test_users(self):
        """
        Test case for creating, updating, getting, and deleting a user via API.
        """
        testing_user_id = "test_user_id"

        # This is the data that a new user should have
        new_user_mock_data = {
            "bio": "",
            "username": "",
            "bookmarks": [],
            "followers": [],
            "following": [],
            "likes": [],
            "posts": [],
        }

        # Create user
        create_response = self.client.post(f"/api/users/{testing_user_id}")
        self.assertEqual(new_user_mock_data, create_response.json)
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        # This is the data I will send in my PUT request
        updated_user_mock_data = {
            "bio": "Updating this user for testing",
            "username": "test_user",
            "bookmarks": [],
            "followers": [],
            "following": [],
            "likes": [],
            "posts": [],
        }

        # Update user
        update_response = self.client.patch(
            f"/api/users/{testing_user_id}", json=updated_user_mock_data
        )
        self.assertEqual(updated_user_mock_data, update_response.json)
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        # Get user
        get_response = self.client.get(f"/api/users/{testing_user_id}")
        # Verify data is returned properly, no status code returned, no assert
        self.assertEqual(updated_user_mock_data, get_response.json)

        # Test getting a non-existing user
        bad_get_response = self.client.get(f"/api/users/bad_id")
        self.assertEqual(
            bad_get_response.status_code, status.HTTP_404_NOT_FOUND
        )

        # Data that will Error (mising a field)
        bad_data = {
            "bio": "",
            "username": "",
            "bookmarks": [],
            "following": [],
            "likes": [],
            "posts": [],
        }

        # Creating an invalid user
        try:
            response = self.client.post("/api/users/bad_id", json=bad_data)
        except:
            # self.assertEqual(response.json, {"error": "Error adding new user"})
            self.assertEqual(
                response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Updating a post invalidly
        try:
            response = self.client.patch(f"/api/users/bad_id", json=bad_data)
        except:
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Delete users
        delete_response = self.client.delete(f"/api/users/{testing_user_id}")
        delete_response = self.client.delete(f"/api/users/bad_id")

        # When user is deleted, the json returned is the below
        self.assertEqual(delete_response.json, {"message": "User deleted"})
        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)


if __name__ == "__main__":
    unittest.main()
