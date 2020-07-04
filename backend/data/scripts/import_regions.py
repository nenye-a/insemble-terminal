import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import json
import utils
import mongo
import pandas as pd

states = pd.read_csv(THIS_DIR + '/files/Statefps.csv').set_index('fp')
states = states.to_dict(orient='index')

# utils.DB_REGIONS.delete_many({'type': 'county'})


def import_regions():
    # names = set([item['name'] for item in utils.DB_REGIONS.find({'type': 'county'})])
    with open(THIS_DIR + '/files/county_geojsons.geojson') as f:
        data = json.load(f)

    for item in data['features']:
        item['crs'] = data['crs']
        state_fp = item['properties']['STATEFP']
        item['name'] = item['properties']['NAME'] + ' - ' + \
            states[int(state_fp)]['code'] if state_fp else item['properties']['NAME']
        item['type'] = 'county'

    # print(item['name'])
    # print(len(data['features']))

    try:
        # for item in data['features']:
        #     utils.DB_REGIONS.insert_one(item)
        #     print("Successfully inserted {} county".format(item['name']))
        utils.DB_REGIONS.insert_many(data['features'], ordered=False)
    except mongo.BWE as bwe:
        print(bwe.details['nInserted'])


def clean_name(name):
    return name.split('-')[0] + ' Metropolitan Area'


def update_msa():
    my_csv = pd.read_csv(THIS_DIR + '/MSAs.csv')
    my_csv['MSA'] = my_csv['MSA'].apply(clean_name)
    my_csv.to_csv(THIS_DIR + '/files/formattedMSA.csv')
    return my_csv


def get_mas_viewports():
    msa_df = update_msa().set_index('MSA')
    msas = list(msa_df.index)
    details = google.get_many_lat_lng(msas, viewport=True)

    data = []
    for detail in details:
        lat, lng, (nw, se) = detail['data']
        data.append({
            'msa': detail['meta'] + " center",
            'lat': lat,
            'lng': lng
        })
        data.append({
            'msa': detail['meta'] + " north west",
            'lat': nw[0],
            'lng': nw[1]
        })
        data.append({
            'msa': detail['meta'] + " south east",
            'lat': se[0],
            'lng': se[1]
        })
    pd.DataFrame(data).to_csv(THIS_DIR + '/files/MSAviewports2.csv')


def upload_msas():
    viewports = pd.read_csv(
        THIS_DIR + '/files/CustomMSAviewports.csv').set_index('Metropolitan Area')
    points = []
    current_item = {'viewport': {}}
    for point in viewports.index:
        if 'center' in point:
            current_item['name'] = point.replace('center', '').strip()
            current_item['center'] = utils.to_geojson(
                (viewports.loc[point, 'lat'], viewports.loc[point, 'lng']))
        elif 'north west' in point:
            current_item['viewport']['nw'] = utils.to_geojson(
                (viewports.loc[point, 'lat'], viewports.loc[point, 'lng']))
        elif 'south east' in point:
            current_item['viewport']['se'] = utils.to_geojson(
                (viewports.loc[point, 'lat'], viewports.loc[point, 'lng']))
            points.append(dict(**current_item))
            current_item['viewport'] = {}

    for point in points:
        nw_coordinates = point["viewport"]["nw"]["coordinates"]
        se_coordinates = point["viewport"]["se"]["coordinates"]
        point['geometry'] = {
            "type": "Polygon",
            "coordinates": [
                [
                    nw_coordinates,
                    [nw_coordinates[0], se_coordinates[1]],
                    se_coordinates,
                    [se_coordinates[0], nw_coordinates[1]],
                    nw_coordinates
                ]
            ]
        }
        point["type"] = "msa"
        utils.DB_REGIONS.update_one({"name": point["name"]}, {"$set": point})

    # utils.DB_REGIONS.insert_many(points, ordered=False)


def add_msa_rank():

    ranked_msas = pd.read_csv(THIS_DIR + '/files/ranked_msas.csv').set_index('Name')
    print(ranked_msas.head())

    for name in ranked_msas.index:
        search_name = r"^" + name.split('-')[0][:4]
        update_results = utils.DB_REGIONS.update_one({
            'name': {"$regex": search_name, "$options": "i"}
        }, {
            '$set': {'rank': int(ranked_msas.loc[name, 'Rank'])}
        })
        print(update_results.modified_count)


def import_city_box():
    """
    Takes northwest and southeast coordinates and creates a
    cit-box region in the database.

    TODO: needs to be refactored to not just be funcitonal for los angeles.

    """

    LA = {
        'name': "Los Angeles, CA",
        'center': {
            'type': "Point",
            'coordinates': [-118.411732, 34.020479]
        },
        'viewport': {
            'nw': {
                'type': "Point",
                'coordinates': [-118.716606, 34.236143]
            },
            'se': {
                'type': "Point",
                'coordinates': [-118.106859, 33.804815]
            }
        },
        'geometry': {
            "type": "Polygon",
            "coordinates": [[
                [-118.716606, 34.236143],
                [-118.106859, 34.236143],
                [-118.106859, 33.804815],
                [-118.716606, 33.804815],
                [-118.716606, 34.236143]
            ]]
        },
        'type': "city-box",
        'searched': False
    }

    # TODO: needs to upload to database.


def add_state_to_county():

    print(utils.DB_REGIONS.update_many({
        'type': 'county',
        'state': {'$exists': False}
    }, [
        {'$set': {
            'state': {
                '$arrayElemAt': [
                    {
                        '$split': [
                            '$name', ' - '
                        ]
                    }, 1
                ]
            }
        }}
    ]).modified_count)
