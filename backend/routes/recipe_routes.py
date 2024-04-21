import status
from flask import jsonify, request, Blueprint
from firebase_admin import firestore
import copy
from helper_functions import try_connect_to_db, recipe_validation

# Creating a Blueprint for handling recipe related endpoints
recipe_bp = Blueprint("recipe", __name__)


# Get a specific recipe by id
@recipe_bp.route("/api/recipes/<recipe_id>", methods=["GET"])
def get_recipe(recipe_id):
    """
    Get a specific recipe by its ID.

    Args:
        recipe_id (str): The ID of the recipe to retrieve.

    Returns:
        dict: A dictionary representing the recipe.

    Raises:
        ValueError: If the specified recipe is not found.
        ValueError: If an error occurs while connecting to the database.
    """
    # Connect to the database
    try_connect_to_db()

    # Get the database
    db = firestore.client()

    # Get the recipe by ID
    recipe_ref = db.collection("recipes").document(recipe_id)
    recipe_doc = recipe_ref.get()

    # Check if the recipe exists
    if not recipe_doc.exists:
        return jsonify({"error": "Recipe not found"}), status.HTTP_404_NOT_FOUND

    # Convert the recipe to a dictionary
    recipe_data = recipe_doc.to_dict()

    # Convert the author to a dictionary
    recipe_data["author"] = recipe_data["author"].path

    # Convert the comments to a dictionary
    for comment in recipe_data["comments"]:
        comment["author"] = comment["author"].path

    # if there is nothing in the array then just skip over it, otherwise get all the like info
    if len(recipe_data["likes"]) != 0:
        recipe_data["likes"] = [
            {
                "user": ref.get("user", {}).path,
                "timestamp": ref.get("timestamp", ""),
            }
            for ref in recipe_data["likes"]
        ]
    else:
        recipe_data["likes"] = []

    return jsonify(recipe_data), status.HTTP_200_OK


# Create a new recipe
@recipe_bp.route("/api/recipes", methods=["POST"])
def create_recipe():
    """
    Endpoint to create a new recipe
    """

    # Extracting JSON data from the request
    res = request.json

    # Creating a deep copy of the received data
    data = copy.deepcopy(res)

    # Attempting to connect to the Firestore database
    try_connect_to_db()

    try:
        # Getting a reference to the Firestore client
        db = firestore.client()

        # Creating a new document reference in the "recipes" collection
        new_recipe_ref = db.collection("recipes").document()

        # Converting author ID to Firestore document reference
        data["author"] = db.document(data["author"])

        # Converting comment authors' IDs to Firestore document references
        for comment in data["comments"]:
            comment["author"] = db.document(comment["author"])
        data["likes"] = [
            {"user": db.document(like["user"]), "timestamp": like["timestamp"]}
            for like in data["likes"]
        ]

        # Setting the recipe data in the Firestore document
        new_recipe_ref.set(data)

        # Retrieving user data to update their posts list
        user_ref = db.collection("users").document(data["author"].id)
        user_data = user_ref.get().to_dict()

        # Creating a reference to the newly created recipe
        recipe_ref = db.document("recipes/" + new_recipe_ref.id)

        # Adding the reference of the new recipe to the user's posts list
        user_data["posts"].append(recipe_ref)
        user_ref.update(user_data)

        # Returning success response with created recipe data
        return jsonify(res), status.HTTP_201_CREATED

    except Exception as e:
        # Handling errors during recpe creation
        print("Error adding new recipe", str(e))
        return (
            jsonify({"error": "Error adding new recipe"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Update an existing recipe
@recipe_bp.route("/api/recipes/<recipe_id>", methods=["PATCH"])
def update_recipe(recipe_id):
    """
    Update an existing recipe.

    Args:
        recipe_id (str): The ID of the recipe to be updated.

    Returns:
        dict: A dictionary representing the updated recipe.
    """
    # Get the JSON data from the request
    res = request.json

    # Make a deep copy of the data
    data = copy.deepcopy(res)

    # The request has been validated, connect to the database
    try_connect_to_db()

    try:
        # Connect to the database
        db = firestore.client()

        # Update the recipe in the 'recipes' collection
        recipe_ref = db.collection("recipes").document(recipe_id)

        data["author"] = db.document(data["author"])
        for comment in data["comments"]:
            comment["author"] = db.document(comment["author"])
        data["likes"] = [
            {"user": db.document(like["user"]), "timestamp": like["timestamp"]}
            for like in data["likes"]
        ]
        recipe_ref.update(data)

        # Return the updated recipe
        return jsonify(res), status.HTTP_200_OK

    except Exception as e:
        # Handling errors during recpe update
        print("Error updating recipe:", str(e))
        return (
            jsonify({"error": "Error updating recipe"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Delete a recipe
@recipe_bp.route("/api/recipes/<recipe_id>", methods=["DELETE"])
def delete_recipe(recipe_id):
    """
    Endpoint to delete a recipe
    """

    # Attempting to connect to the Firestore database
    try_connect_to_db()

    try:
        # Getting a reference to the Firestore client
        db = firestore.client()

        # Retrieving the recipe document reference
        recipe_ref = db.collection("recipes").document(recipe_id)
        recipe_data = recipe_ref.get().to_dict()

        # Deleting the recipe document
        recipe_ref.delete()

        # Retrieving the author's user data to update their posts list
        user_ref = db.collection("users").document(
            str(recipe_data["author"].path[len("users/") :])
        )
        user_data = user_ref.get().to_dict()

        # Removing the deleted recipe reference from the user's posts list
        user_data["posts"].remove(recipe_ref)
        user_ref.update(user_data)

        # Returning success response
        return jsonify({"message": "Recipe Deleted"}), status.HTTP_200_OK

    except Exception as e:
        # Handling errors during recipe deletion
        print("Error deleting recipe:", str(e))
        return (
            jsonify({"error": "Error deleting recipe"}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
