import os
import sys


# Append parent directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import unittest
from flask import Flask
from flask.testing import FlaskClient
from follow_routes import follow_bp  # Assuming 'app' is your Flask application
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class TestFollowUserRoute(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Get service account key file path from environment variable
        service_account_key_path = os.getenv("DB_PRIV_KEY_PATH")

        if not service_account_key_path:
            raise ValueError("DB_PRIV_KEY_PATH environment variable is not set")

        # Initialize Firebase Admin SDK with credentials
        cred = credentials.Certificate(service_account_key_path)
        firebase_admin.initialize_app(cred)

    @classmethod
    def tearDownClass(cls):
        # Clean up Firebase Admin SDK resources after all tests
        firebase_admin.delete_app(firebase_admin.get_app())

    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(follow_bp)
        self.client = self.app.test_client()

        # Get Firestore client from initialized Firebase Admin app
        self.firestore_client = firestore.client()

    def tearDown(self):
        # Clean up Firestore data after each test
        # (Optional: You can delete specific collections or documents if needed)
        pass

    def test_follow_user(self):
        # Test following a user
        response = self.client.patch('/api/users/user_2cwMgsX7SwXnnnYJ2piefltKxLO/follow/user_2dNr6COlTiUgw8m3mgb4ilbPDsF')
        data = response.get_json()

        # Check if the response contains the expected message
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', data)
        self.assertEqual(data['message'], 'User followed successfully')

        # Test unfollowing the same user
        response = self.client.patch('/api/users/user_2cwMgsX7SwXnnnYJ2piefltKxLO/follow/user_2dNr6COlTiUgw8m3mgb4ilbPDsF')
        data = response.get_json()

        # Check if the response contains the expected message
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', data)
        self.assertEqual(data['message'], 'User unfollowed successfully')

    def test_user_not_found(self):
        # Test following a non-existent user
        response = self.client.patch('/api/users/user_2cwMgsX7SwXnnnYJ2piefltKxLO/follow/nonexistent_user')
        data = response.get_json()

        # Check if the response contains the expected error message
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Trying to follow/unfollow non-existent user')

if __name__ == '__main__':
    unittest.main()
