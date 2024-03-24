from flask import Flask, jsonify, request
import requests
import states
import random

app = Flask(__name__)

LOCAL_URL = "http://127.0.0.1:5000/"
URL = "https://api.yelp.com/v3/"

# API_KEY is blank, make sure to grab correct API Key from Team Yelp account and paste here to get authorization to Yelp API
API_KEY = ""

headers = {"Authorization": f"Bearer {API_KEY}"}


# route gets the default amount from yelp API (20 businesses in one request)
@app.route("/", methods=["GET"])
def get_business():
    # Grab a random state from states.py
    random_state = random.choice(states.us_states)
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
@app.route("/random", methods=["GET"])
def get_our_own_businesses():
    # Grab a random state from states.py
    random_state = random.choice(states.us_states)
    # Use query filter to get 50 businesses from the random state provided, can change limit query to X amount
    response = requests.get(
        URL + "businesses/search?location=" + random_state + "&limit=50",
        headers=headers,
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


if __name__ == "__main__":
    app.run(debug=True)
