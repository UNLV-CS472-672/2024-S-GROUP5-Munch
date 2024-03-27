import unittest
import requests
import server
from server import app

import firebase_admin
from firebase_admin import credentials, firestore

class SetUp:
    base_url = "http://127.0.0.1:5000/api/posts"
    users_url = "http://127.0.0.1:5000/api/users"

    def database_connect(self):
        # Connect to database
        server.try_connect_to_db()

class TestAPI(unittest.TestCase):
    base_url = "http://127.0.0.1:5000/api/posts"
    users_url = "http://127.0.0.1:5000/api/users"
    api_url = "http://127.0.0.1:5000/api"

    db = SetUp()

    client = app.test_client()

    def test_create_user(self):
        """
        Test case for creating a user via API.
        """
        try:
            res = self.db.database_connect()
        except Exception as e:
            self.assertEqual(res.status_code, 500)

        # Use a test user_id
        testing_user_id = "TESTING_UNIT_TEST"

        # Put into database
        self.client.put(f"{self.users_url}/{testing_user_id}")

        try:
            response = self.client.put(f"{self.users_url}/{testing_user_id}")
        except:
            self.assertEqual(response.status_code, 404)

    def test_delete_user(self):
        """
        Test case for deleting a user via API.
        """
        try:
            res = self.db.database_connect()
        except Exception as e:
            self.assertEqual(res.status_code, 500)

        # Use a test user_id
        testing_user_id = "TESTING_UNIT_TEST"

        # Delete from database
        self.client.delete(f"{self.users_url}/{testing_user_id}")

        try:
            response = self.client.delete(f"{self.users_url}/{testing_user_id}")
        except:
            self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
