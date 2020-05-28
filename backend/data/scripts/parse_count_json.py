import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import json
import pprint
import utils
import pandas as pd

states = pd.read_csv(THIS_DIR + '/files/Statefps.csv').set_index('fp')
states = states.to_dict(orient='index')

# utils.DB_REGIONS.delete_many({'type': 'county'})

# names = set([item['name'] for item in utils.DB_REGIONS.find({'type': 'county'})])
with open(THIS_DIR + '/files/county_geojsons.geojson') as f:
    data = json.load(f)

for item in data['features']:
    item['crs'] = data['crs']
    state_fp = item['properties']['STATEFP']
    item['name'] = item['properties']['NAME'] + ' - ' + states[int(state_fp)]['code'] if state_fp else item['properties']['NAME']
    item['type'] = 'county'

# print(item['name'])
# print(len(data['features']))

try:
    # for item in data['features']:
    #     utils.DB_REGIONS.insert_one(item)
    #     print("Successfully inserted {} county".format(item['name']))
    utils.DB_REGIONS.insert_many(data['features'], ordered=False)
except utils.BWE as bwe:
    print(bwe.details['nInserted'])
