from flask import Flask, jsonify, request
import status

app = Flask(__name__)

# TODO:
# - Nothing I Guess ¯\_(ツ)_/¯
# - Connect to ML Model

# Sample data (to be replaced with database)
posts = [
    {"id": 1, "title": "First Post", "content": "This is my first post!"},
    {"id": 2, "title": "Second Post", "content": "Another post here."}
]

# Get all posts
@app.route('/api/posts', methods=['GET'])
def get_posts():
    return jsonify(posts)

# Get a specific post by id
@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = next((p for p in posts if p['id'] == post_id), None)
    if post:
        return jsonify(post)
    else:
        return jsonify({"error": "Post not found"}), status.HTTP_404_NOT_FOUND

# Create a new post
@app.route('/api/posts', methods=['POST'])
def create_post():
    new_post = request.json
    new_post['id'] = len(posts) + 1
    posts.append(new_post)
    return jsonify(new_post), status.HTTP_201_CREATED

# Update an existing post
@app.route('/api/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    for post in posts:
        if post['id'] == post_id:
            post.update(request.json)
            return jsonify(post)
    return jsonify({"error": "Post not found"}), status.HTTP_404_NOT_FOUND

# Delete a post
@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    global posts
    posts = [p for p in posts if p['id'] != post_id]
    return jsonify({"message": "Post deleted"}), status.HTTP_200_OK

if __name__ == '__main__':
    app.run(debug=True)
