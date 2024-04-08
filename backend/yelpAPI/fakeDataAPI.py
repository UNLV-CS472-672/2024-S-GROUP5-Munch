from flask import Flask, jsonify, Blueprint
import requests
import yelpAPI.states
import random
import os
import json

yelp_bp = Blueprint("yelp", __name__)

app = Flask(__name__)

LOCAL_URL = "http://127.0.0.1:5000/"
URL = "https://api.yelp.com/v3/"

# API_KEY is blank, make sure to grab correct API Key from Team Yelp account and paste here to get authorization to Yelp API
API_KEY = os.getenv("YELP_API_KEY")

headers = {"Authorization": f"Bearer {API_KEY}"}


# route gets the default amount from yelp API (20 businesses in one request)
@yelp_bp.route("/", methods=["GET"])
def get_business():
    # Grab a random state from states.py
    random_state = random.choice(yelpAPI.states.us_states)
    response = requests.get(
        URL + "businesses/search?location=" + random_state, headers=headers
    )

    if response.status_code == 200:
        # Return the data from the API as JSON
        return response.json(), 200
    else:
        # If the request was not successful, return an error message
        return (
            jsonify({"error": "Failed to fetch data from the API"}),
            response.status_code,
        )


# route gets 50 businessses from yelp API
@yelp_bp.route("/api/<latitude>/<longitude>", methods=["GET"])
def get_our_own_businesses(latitude, longitude):
    # Get a random integer for the offset
    random_int = str(random.randint(0, 500))
    # Use query filter to get 50 businesses from provided latitude and longitude, can change limit query to X amount
    # offset is from integer above, to get more random options
    response = requests.get(
        URL + "businesses/search?latitude=" + latitude + "&longitude=" + longitude + "&limit=50" + "&offset=" + random_int,
        headers=headers,
    )

    # if successful response
    if response.status_code == 200:
        # keep these fields from the yelp API
        kept_fields = ["coordinates", "location", "name", "price", "rating", "image_url", "description"]

        filtered_responses = []
        # for each business "r"
        for r in response.json()["businesses"]:
            # convert coordinates to one string
            latitude = r["coordinates"].get("latitude")
            longitude = r["coordinates"].get("longitude")
            if latitude is not None and longitude is not None:
                r["coordinates"] = f"{latitude}, {longitude}"
            
            # put all the categories into a "description"
            if "categories" in r:
                r["description"] = ", ".join(category["title"] for category in r["categories"])
                    
            # filter response to only keep the fields we want
            filtered_response = {key: value for key, value in r.items() if key in kept_fields}
            filtered_responses.append(filtered_response)

        # do some formatting
        filtered_response_json = json.dumps(filtered_responses, indent=4)
        # Return the data from the API as JSON
        return filtered_response_json, 200
    else:
        # If the request was not successful, return an error message
        return (
            jsonify({"error": "Failed to fetch data from the API"}),
            response.status_code,
        )


if __name__ == "__main__":
    app.run(debug=True)
