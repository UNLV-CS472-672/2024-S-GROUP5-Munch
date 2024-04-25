from unittest import TestCase
from unittest.mock import patch

import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import status
from server import app


class YelpTest(TestCase):
    # Set up client
    def setUp(self):
        self.app = app
        self.app.testing = True
        self.client = self.app.test_client()

    def test_yelp(self):
        # Get Businesses test
        create_businesses = self.client.get(f"/api/business")
        self.assertEqual(create_businesses.status_code, status.HTTP_200_OK)

        # Create valid coordinates
        valid_longitude = -122.083922
        valid_latitude = 37.4220936

        # Get local businesses
        get_local_businesses = self.client.get(
            f"/api/{valid_latitude}/{valid_longitude}"
        )
        self.assertEqual(get_local_businesses.status_code, status.HTTP_200_OK)

        # Error check local businesses
        get_local_businesses = self.client.get(
            f"/api/InvalidLatitude/InvalidLongitude"
        )
        self.assertEqual(
            get_local_businesses.status_code, status.HTTP_400_BAD_REQUEST
        )
