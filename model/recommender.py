from pathlib import Path
from typing import Tuple, List
import implicit

model = implicit.als.AlternatingLeastSquares(
    factors=50, iterations=10, regularization=0.01
)

model.recommend()
