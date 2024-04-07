import unittest
import requests
import server
from server import app

import os
import firebase_admin
import status
from flask import Flask, jsonify, request
from firebase_admin import credentials
from firebase_admin import firestore
from dotenv import load_dotenv


# import unittest
# from your_module import firestore  # Assuming your Flask firestore instance is named 'firestore'
class SetUp:
    base_url = "http://127.0.0.1:5000/api/posts"  # Adjust URL as needed
    users_url = "http://127.0.0.1:5000/api/users"

    def database_connect(self):
        # Connect to database
        server.try_connect_to_db()


class TestUser(unittest.TestCase):
    users_url = "http://127.0.0.1:5000/api/users"
    db = SetUp()
    client = app.test_client()

    def test_get_user(self):
        # Connect to database
        try:
            res = self.db.database_connect()
        except Exception as e:
            self.assertEqual(res.status_code, 500)

        # use a test user_id
        testing_user_id = "f7Mbtze3VqixFLJPQ492"

        # perform a get request
        self.client.get(f"{self.users_url}/{testing_user_id}")

        # Fake ID
        testing_user_id = "0000000"

        # try a get for the fake user, it should fail and throw an error
        try:
            response = self.client.get(f"{self.users_url}/{testing_user_id}")
        except:
            self.assertEqual(response.status_code, 404)

    def test_update_user(self):
        try:
            res = self.db.database_connect()
        except Exception as e:
            self.assertEqual(res.status_code, 500)

        # use a test user_id
        testing_user_id = "f7Mbtze3VqixFLJPQ492"

        # updated data
        updated_user_data = {
            "bio": "<Users bio for testing update>",
            "bookmarks": ["URL to post 1", "URL to post 2"],
            "followers": [
                "URL to other users following current user 1",
                "URL to other users following current user 2",
            ],
            "following": [
                "URL to other users current user follows 1",
                "URL to other users current user follows 2",
            ],
            "likes": ["URL to other users 1", "URL to other users 2"],
            "posts": ["URL to users own posts 1", "URL to users own posts 2"],
            "username": "<Users Username for testing update>",
        }

        # calling put to update the data and if there is an error then do the
        try:

            new_path = f"{self.users_url}/{testing_user_id}"
            response = self.client.put(new_path, json=updated_user_data)
            self.assertEqual(response.status_code, 200)
        except:
            self.assertEqual(response.status_code, 500)


if __name__ == "__main__":
    unittest.main()
