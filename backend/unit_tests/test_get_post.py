import unittest
import requests
import server

import os
import firebase_admin
import status
from flask import Flask, jsonify, request
from firebase_admin import credentials
from firebase_admin import firestore
from dotenv import load_dotenv


class TestAPI(unittest.TestCase):
    base_url = "http://127.0.0.1:5000/api/posts"  # Adjust URL as needed
    users_url = "http://127.0.0.1:5000/api/users"

    def test_get_post_by_id(self):

        # Connect to database
        server.try_connect_to_db()
        db = firestore.client()

        # User Testing Data
        new_user_data = {
            "bio": "test_get_post bio",
            "username": "userTest",
            "userID": "000000",
            "bookmarks": "10",
            "likes": "10",
            "posts": "10",
            "followers": "10",
            "following": "10",
        }

        # Post into users database
        response = requests.post(self.users_url, json=new_user_data)

        # Grab all users
        users_collection = db.collection("users")
        user_docs = users_collection.get()

        # Look for the test post created and append the appropriate user id
        for user in user_docs:
            user_data = user.to_dict()
            if user_data.get("bio", "") == "test_get_post bio":
                testing_user_id = user.id

        # Create the author reference as string
        author_id = f"/users/{testing_user_id}"

        # Test creating a new post
        new_post_data = {
            "author": author_id,
            "comments": [
                {
                    "author": author_id,
                    "comment": "Valid Input",
                    "creation_date": "2024-03-25 21:41:30.786000+00:00",
                }
            ],
            "creation_date": "2024-03-25 23:45:20.786000+00:00",
            "description": "test_get_post method",
            "likes": 0,
            "pictures": ["ROUTE/TO/SOME/PIC", "ROUTE/TO/ANOTHER/PIC"],
        }

        # Post the test post data
        requests.post(self.base_url, json=new_post_data)

        # Grab all posts
        posts_collection = db.collection("posts")
        docs = posts_collection.get()

        # Look for test post created
        for doc in docs:
            doc_data = doc.to_dict()
            if doc_data.get("description", " ") == "test_get_post method":
                global testing_id
                testing_id = doc.id

        # Get the test id
        response = requests.get(f"{self.base_url}/{testing_id}")

        # Deleting all testing data
        requests.delete(f"{self.base_url}/{testing_id}")
        requests.delete(f"{self.users_url}/{testing_user_id}")

        self.assertEqual(
            response.status_code, 200
        )  # Check if status code is OK


if __name__ == "__main__":
    unittest.main()
