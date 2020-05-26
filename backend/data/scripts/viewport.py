import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import utils
import google
import pandas as pd
from locations import divide_region


def clean_name(name):
    return name.split('-')[0] + ' Metropolitan Area'


def update_msa():
    my_csv = pd.read_csv(THIS_DIR + '/MSAs.csv')
    my_csv['MSA'] = my_csv['MSA'].apply(clean_name)
    my_csv.to_csv(THIS_DIR + 'files/formattedMSA.csv')
    return my_csv


def get_viewports():
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
    pd.DataFrame(data).to_csv(THIS_DIR + 'files/MSAviewports2.csv')


def observe_divided_region():
    print(len(divide_region((28.132729, -82.4814605), ((28.591647, -83.130212), (27.673810, -81.832708)), 14)))


def upload_regions():
    viewports = pd.read_csv(THIS_DIR + 'files/CustomMSAviewports.csv').set_index('Metropolitan Area')
    points = []
    current_item = {'viewport': {}}
    for point in viewports.index:
        if 'center' in point:
            current_item['name'] = point.replace('center', '').strip()
            current_item['center'] = utils.to_geojson((viewports.loc[point, 'lat'], viewports.loc[point, 'lng']))
        elif 'north west' in point:
            current_item['viewport']['nw'] = utils.to_geojson((viewports.loc[point, 'lat'], viewports.loc[point, 'lng']))
        elif 'south east' in point:
            current_item['viewport']['se'] = utils.to_geojson((viewports.loc[point, 'lat'], viewports.loc[point, 'lng']))
            points.append(current_item.copy())

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

    utils.DB_REGIONS.insert_many(points, ordered=False)


def print_zoom_region(region, zoom):
    lat, lng, viewport = google.get_lat_lng(region, viewport=True)
    nw, se = viewport
    center = lat, lng
    coords = []
    points = divide_region(center, viewport, zoom)
    # points = divide_region((40.09134, -105.39051), ((40.09134, -105.39051), (39.30596, -104.52576)), zoom)
    for item in points:
        coords.append({
            'latitude': item[0],
            'longitude': item[1]
        })
    pd.DataFrame(coords).to_csv(region + str(zoom) + '_datapoints.csv')


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


if __name__ == "__main__":
    # get_viewports()
    # observe_divided_region()
    # upload_regions()
    add_msa_rank()
