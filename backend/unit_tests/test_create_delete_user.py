import firebase_admin
from flask import Flask
from unittest.mock import patch
import unittest
from server import user_bp
import sys
import os


# Add parent directory to the sys.path to allow relative imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


class TestUserRoutes(unittest.TestCase):
    """
    Test case for user routes in the server.

    This test case class is responsible for testing the user routes defined in the server.
    It includes tests for creating and deleting users, mocking Firestore interactions for testing purposes.

    Usage:
        1. Define a specific user ID for testing purposes using the `test_user_id` class attribute.
        2. Initialize Firebase Admin SDK using the `setUpClass` method.
        3. Use the `test_create_user` and `test_delete_user` methods to write test cases for creating and deleting users, respectively.
    """
    @classmethod
    def setUpClass(cls):
        """
        Set up the Firebase Admin SDK for testing.

        This method initializes the Firebase Admin SDK with the provided service account key file path.
        It is called once before running any test cases in the class.
        """
        cred = firebase_admin.credentials.Certificate(
            "../" + os.getenv("DB_PRIV_KEY_PATH"))
        firebase_admin.initialize_app(cred)

    def setUp(self):
        """
        Set up the test environment.

        This method creates a Flask test app and sets up a test client for making requests.
        It is called before each test case.
        """
        # Create a test Flask app
        self.app = Flask(__name__)
        self.app.register_blueprint(user_bp)

        # Set up a test client
        self.client = self.app.test_client()

    def test_create_user(self):
        """
        Test creating a user.

        This method tests the functionality of the user creation route.
        It mocks Firestore interactions to simulate the creation of a user.
        """
        with patch("firebase_admin.firestore") as firestore_mock:
            # Mock Firestore client and collection
            collection_mock = firestore_mock.client().collection("users")
            document_mock = collection_mock.document.return_value

            # Mock successful user creation
            document_mock.set.return_value = None

            # Send a request to create a user
            response = self.client.post("/api/users/test_user_id")

            # Check if the user was created successfully
            self.assertEqual(response.status_code, 201)
            self.assertIn("bio", response.json)
            self.assertIn("username", response.json)

    def test_delete_user(self):
        """
        Test deleting a user.

        This method tests the functionality of the user deletion route.
        It mocks Firestore interactions to simulate the deletion of a user.
        """
        with patch("firebase_admin.firestore") as firestore_mock:
            # Mock Firestore client and collection
            collection_mock = firestore_mock.client().collection("users")
            document_mock = collection_mock.document.return_value

            # Mock successful user deletion
            document_mock.get.return_value.exists = True
            document_mock.delete.return_value = None

            # Send a request to delete a user
            response = self.client.delete("/api/users/test_user_id")

            # Check if the user was deleted successfully
            self.assertEqual(response.status_code, 200)
            self.assertIn("message", response.json)
            self.assertEqual(response.json["message"], "User deleted")


if __name__ == "__main__":
    unittest.main()
