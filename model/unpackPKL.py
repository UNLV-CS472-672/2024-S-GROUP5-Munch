import numpy as np

# Load the .npz file
data = np.load('model.pkl.npz')

# Print the keys of the loaded data
print("Keys in the .npz file:", data.files)

# Access and print individual arrays
for key in data.files:
    print(key, ":", data[key])
