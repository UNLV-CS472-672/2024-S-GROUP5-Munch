# import unittest
# import requests
# import server

# import os
# import firebase_admin
# import status
# from flask import Flask, jsonify, request
# from firebase_admin import credentials
# from firebase_admin import firestore
# from dotenv import load_dotenv


# class TestAPI(unittest.TestCase):
#     base_url = "http://127.0.0.1:5000/api/posts"  # Adjust URL as needed


#     def test_get_post_by_id(self):
#         # Test retrieving an existing post by ID

#         new_post_data = {
#             "author": {
#                 "bio": "bioTest",
#                 "followers": 10,
#                 "following": 10,
#                 "user_id": "h7xOBio5qy9sGIJExFru",
#                 "username": "test_create_post USER"
#             },
#             "comments": [
#                 {
#                     "author": {
#                         "bio": "bioTest",
#                         "followers": 10,
#                         "following": 10,
#                         "user_id": "h7xOBio5qy9sGIJExFru",
#                         "username": "userTest"
#                     },
#                     "comment": "FIRST TEST INSERT",
#                     "creation_date": "2024-03-20 22:53:36.118000+00:00"
#                 }
#             ],
#             "creation_date": "2024-03-20 21:41:30.786000+00:00",
#             "description": "THIS IS MY FIRST TEST POST",
#             "likes": 0,
#             "pictures": [
#                 "ROUTE/TO/SOME/PIC",
#                 "ROUTE/TO/ANOTHER/PIC"
#             ],
#             "testcase": True,
#         }

#         requests.post(self.base_url, json=new_post_data)

#         # Connect to db and firestore db
#         server.try_connect_to_db()
#         db = firestore.client()

#         # Get all the posts in the database
#         posts_collection = db.collection("posts")
#         docs = posts_collection.get()

#         # Check the database for the testcase post we've created
#         for doc in docs:
#             doc_data = doc.to_dict()
#             if doc_data.get('testcase', False) == True:
#                 print(f"Document ID: {doc.id}")
#                 testing_id = doc.id

#         # Get the test id
#         response = requests.get(f"{self.base_url}/{testing_id}")

#         # Delete it
#         requests.delete(f"{self.base_url}/{testing_id}")
#         print("Deleted: ", testing_id)

#         # Check if correct get
#         self.assertEqual(response.status_code, 200)  # Check if status code is OK

# if __name__ == '__main__':
#     unittest.main()
