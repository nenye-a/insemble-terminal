import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import pandas as pd
from postgres import PostConnect

database = PostConnect()


def insert_names():
    places = pd.read_csv(BASE_DIR + '/scripts/files/activity_generated/sorted_names.csv').set_index('_id')
    place_names = [{"params": place, "type": "BUSINESS"} for place in places.index]

    database.insert_many('BusinessTag', place_names)


def insert_categories():
    categories = pd.read_csv(BASE_DIR + '/scripts/files/activity_generated/type_merged_with_ratio.csv').set_index('_id')
    categories = [{"params": category, "type": "CATEGORY"} for category in categories.index]

    database.insert_many('BusinessTag', categories)


def delete_categories():
    print(database.delete('BusinessTag', {}))


if __name__ == "__main__":

    # delete_categories()
    insert_names()
    insert_categories()
    # database.list_tables(True)
