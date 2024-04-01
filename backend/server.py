# Imports for Server.py
import os
import status
from flask import Flask, jsonify, request
from dotenv import load_dotenv
import jwt

# Import Flask Blueprints
from user_routes import user_bp
from post_routes import post_bp
from feed_routes import feed_bp
from recipe_routes import recipe_bp

# Import functions needed for middleware
from helper_functions import check_user_existence
from user_routes import get_user, create_user


# Create the app
app = Flask(__name__)


# Register Flask Blueprints under app
app.register_blueprint(user_bp)
app.register_blueprint(post_bp)
app.register_blueprint(feed_bp)
app.register_blueprint(recipe_bp)


# Load environment variables from .env file
load_dotenv()


# Middleware function to handle JWT authentication for incoming requests
@app.before_request
def middleware():
    """
    Intercepts incoming requests to validate JWT authentication.

    This middleware function intercepts all incoming requests to ensure that they are
    properly authenticated using JSON Web Tokens (JWT). It checks for the presence of
    an 'Authorization' header containing a JWT token. If the token is present and valid,
    it verifies its authenticity and expiration, using the 'uid' field to determine user
    access rights to requested resources.

    If the JWT token is valid and the user has the necessary permissions, the request is
    allowed to proceed. Otherwise, access is denied, and an appropriate error response
    is returned.

    Raises:
        jwt.ExpiredSignatureError: If the JWT token has expired.
        jwt.InvalidTokenError: If the JWT token is invalid or malformed.
    """
    print("\nIncoming request:", request.method, request.path)

    # Check for Authorization header containing JWT token
    token = request.headers.get("Authorization")
    if token:
        try:
            # Verify and decode JWT token
            decoded_token = jwt.decode(
                token,
                os.getenv("CLERK_PEM_PUBLIC_KEY"),
                options={"verify_signature": False},
            )

            # Extract user_id and API details from the request
            user_id = decoded_token["uid"]

            # Extract API name and address from request path
            api_name = request.path.split("/", 2)[-1].split("/", 1)[0]
            api_address = request.path.split("/", 3)[-1]

            # Create the user if not already existing
            if not check_user_existence(user_id):
                create_user(user_id)

            result = get_user(user_id)

            # Authorization logic based on request method and resource type
            if request.method == "GET":
                # Allow any GET request by default
                print(
                    "User",
                    user_id,
                    "has been given access to perform a GET request.",
                )
                return None
            elif (
                api_name == "users"
                and user_id == api_address
                and request.method != "POST"
            ):
                # Allow accessing and modifying the user's own information
                # excluding POST requests as user creation happens above
                print(
                    "User",
                    user_id,
                    "has been given access to get, update, or delete, their own account.",
                )
                return None
            elif api_name == "posts" and request.method == "POST":
                # Allow access to create new posts
                print(
                    "User",
                    user_id,
                    "has been given access to create a new post.",
                )
                return None
            elif (
                api_name == "posts"
                and request.method == "DELETE"
                or request.method == "PUT"
            ):
                # Check if user has access to modify/delete specific post
                posts = result.get("posts", [])
                for post in posts:
                    if request.path.split("/api/")[1] == post:
                        return None

            # Deny access if none of the above conditions are met
            print("Access denied.")
            return (
                jsonify({"error": "Unauthorized access"}),
                status.HTTP_403_FORBIDDEN,
            )

        except jwt.ExpiredSignatureError:
            print("Token Expired")
            return (
                jsonify({"error": "Token expired"}),
                status.HTTP_401_UNAUTHORIZED,
            )
        except jwt.InvalidTokenError:
            print("Invalid Token")
            return (
                jsonify({"error": "Invalid token"}),
                status.HTTP_401_UNAUTHORIZED,
            )
    else:
        print("NO AUTHORIZATION HEADER FOUND")
        return (
            jsonify({"error": "AUTHORIZATION HEADER NOT PROVIDED"}),
            status.HTTP_400_BAD_REQUEST,
        )


if __name__ == "__main__":
    app.run(debug=True)
