# %%
import pandas as pd
import numpy as np
from pathlib import Path
from scipy import sparse
from scipy.sparse import csr_matrix
from implicit.nearest_neighbours import bm25_weight
from implicit.als import AlternatingLeastSquares
from IPython.core.interactiveshell import InteractiveShell
from typing import Dict
import time

# %%
class DataLoader:
    def __init__(self, userData:Path, restaurantMenuData: Path, restaurantData: Path) -> None:
        self.userData = userData
        self.restaurantData = restaurantData
        self.restaurantMenuData = restaurantMenuData

        #for user data 
        df = pd.read_csv(self.userData, sep=',')

        self.userDataDF = df

        #for restaurant data
        df = pd.read_csv(self.restaurantData, sep= ',')
        self.restaurantDF = df

        df = pd.read_csv(self.restaurantMenuData, sep=',')
        self.restaurantMenuDataDF = df


    def load_user_data(self) -> csr_matrix:
        """
          Creates a sparse row matrix for the user data
          This is the matrix that is used to calculate the recommendation for each user based on the scores of the food they have seen.

          Parameters:
          - None

          Returns:
          csr_matrix: The CSR matrix
        """
        df = self.userDataDF

        df = df.set_index(['userID', 'restaurantID'])
        coo = sparse.coo_matrix(
            (
                df["rating"].astype(float),
                ( 
                    df.index.get_level_values(0), 
                    df.index.get_level_values(1)
                ),
            )
        )
        coo = bm25_weight(coo, K1=1000, B=0.75) 
        return coo.tocsr()

    def get_item_info(self, item_id: int) -> Dict[str, str]:
        """
          Return information about the item.

          Parameters:
          - item_id (int) : The item that we want to get info from.

          Returns: 
          - Dict[str, str]: The item containing the information
        """
        restaurant_info = {}
        item = self.restaurantMenuDataDF.iloc[item_id]
        rest_id = item['restaurant_id']

        for key in ['category', 'name', 'price']:
          if key == 'name':
             restaurant_info['item_name'] = item[key]
          restaurant_info[key] = item[key]

        #second pass
        keys = ['name', 'score', 'ratings', 'category', 'price_range', 'full_address']
        for key in keys:
          restaurant_info[key] = self.restaurantDF.iloc[rest_id][key]

        restaurant_info['coordinates'] = (self.restaurantDF.iloc[rest_id]['lat'], self.restaurantDF.iloc[rest_id]['lng'])
        return restaurant_info

    def load_restaurants(self) -> None:
      """
      Loads restaurant data from a CSV file and performs data preprocessing.

      Parameters:
      None

      Returns:
      None
      """
      df = pd.read_csv(self.restaurantData, sep=',')
      df = df.set_index('id')
      
      df['score'] = df['score'].fillna(np.random.uniform(0, 10))
      df['ratings'] = df['ratings'].fillna(np.random.randint(1, 100))
      df['price_range'] = df['price_range'].fillna(np.random.randint(1,2) * "$")

      df['zip_code'] = df['zip_code'].str.split('-', n=1, expand=True)[0]
      self.restaurantDF = df
      return

    def load_restaurant_menu(self) -> None:
        """
        Loads the restaurant menu data
        
        Parameters:
        - None
                            
        Returns: 
        None
        """
        df = pd.read_csv(self.restaurantMenuData, sep=',')
        
        for item in ['Other Essentials', "Electronics: Batteries & Phone Accessories", 'Health & Beauty', "Household Goods"]:
          df = df.drop(df[df.category == item].index)
        self.restaurantMenuDataDF = df
        return

    def get_user_data(self, userID: int) -> pd.DataFrame:
        df = self.userDataDF

        return df.loc[df['userID'] == userID]

# %%
class Model:
    def __init__(self, user_items: csr_matrix, restaurant_data: pd.DataFrame) -> None:
      self.model= AlternatingLeastSquares(factors = 50, iterations=15, regularization=0.01)
      self.user_items = user_items
      self.recommend_data = restaurant_data

    def fitModel(self) -> None:
      """
      Fits the model to the user items.

      This method trains the model using the user items data.

      Returns:
        None
      """
      start = time.time()
      self.model.fit(self.user_items)

      print(f"Finished training the model at {time.time() - start}")
    
    def recommend_items(self, userID: int, n: int = 10):
      """
      Recommends items for a given user.

      Parameters:
      - userID (int): The ID of the user for whom recommendations are generated.
      - n (int): The number of recommendations to generate. Default is 10.

      Returns:
      - recommendations (list): A list of recommended item IDs.
      - scores (list): A list of scores corresponding to the recommended items.
      """
      recommendations, scores = self.model.recommend(userID, self.user_items[userID], N=n, recalculate_user=True)
      
      return recommendations, scores, 
    
    def similar_items(self, restaurant_id): 
      """
      Retrieve similar items based on the given restaurant ID.

      Parameters:
      - restaurant_id (int): The ID of the restaurant for which to find similar items.

      Returns:
      - id (list): A list of IDs of similar items.
      - scores (list): A list of similarity scores corresponding to the similar items.
      """
      id, scores = self.model.similar_items(restaurant_id)

      return id, scores
    
    def refresh_user(self, userID, user_items):
      """
      Recalculates the user based on the given userID.

      Parameters:
      - userID (int): The ID of the user to recalculate.

      Returns:
      None
    """ 
      self.model.partial_fit_users([userID], user_items)

# %%
loader = DataLoader(Path('user-data.csv'), Path('restaurant-menus.csv'), Path('restaurants.csv'))

# %%
user_data = loader.load_user_data()
resturant_data = loader.load_restaurants()
restaurant_menu = loader.load_restaurant_menu()

# %%
model = Model(user_data, restaurant_menu)
model.fitModel()

# %%
model.model.save('model.pkl')

# %%
# restaurants, scores1 = model.recommend_items(0) 
# results = [loader.get_item_info(item_id) for item_id in restaurants]
# u1 = pd.DataFrame(results)

# restaurants, scores = model.recommend_items(1) 
# u2 = pd.DataFrame([loader.get_item_info(item_id) for item_id in restaurants])

# #gets the new weight for testing
# new_items = csr_matrix(np.random.uniform(low = 0, high=500, size=user_data.shape[1]))
# coo_new = bm25_weight(new_items, K1=1000, B=0.75).tocsr()

# #updates the user factors 
# model.refresh_user(0, coo_new)
# model.fitModel()
# restaurants2, scores2 = model.recommend_items(0)  
# results = [loader.get_item_info(item_id) for item_id in restaurants2]

# u3 = pd.DataFrame(results)

# restaurants, scores= model.recommend_items(1) 
# u4 = pd.DataFrame([loader.get_item_info(item_id) for item_id in restaurants])

# u1
# u3

# u2
# u4


