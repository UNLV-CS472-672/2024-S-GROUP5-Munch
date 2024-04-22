# routes/__init__.py

from flask import Blueprint

# Import all blueprints
from .user_routes import user_bp
from .post_routes import post_bp
from .recipe_routes import recipe_bp
from .like_routes import like_bp
from .comment_routes import comment_bp
from .bookmark_routes import bookmark_bp
from .follow_routes import follow_bp
from .yelpAPI.fakeDataAPI import yelp_bp

# List of Blueprints
blueprints = [
    user_bp,
    post_bp,
    recipe_bp,
    like_bp,
    comment_bp,
    bookmark_bp,
    follow_bp,
    yelp_bp,
]
