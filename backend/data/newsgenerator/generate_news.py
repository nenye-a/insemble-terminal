import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import requests
from graphql import gql
import utils

print(BASE_DIR)

search_data = gql.search(
    review_tag='NEWS',
    business_tag={
        'type': 'BUSINESS',
        'params': 'Starbucks'
    },
    location_tag={
        'type': 'CITY',
        'params': 'Houston, TX, USA'
    }
)

print(search_data)

news_data = gql.news(
    business_tag_id='ckbbyg3jg0003jf35zaw00ab0',
    location_tag_id='ckbcinjzl000193355ivzb37r',
    poll=True
)

print(news_data)
