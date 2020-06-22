import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import utils
import pandas as pd
from postgres import PostConnect

database = PostConnect()

# database.list_tables(True)
