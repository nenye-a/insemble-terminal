import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import utils
import google
import pandas as pd
from locations import divide_region


def observe_divided_region():
    print(len(divide_region(
        (28.132729, -82.4814605),
        ((28.591647, -83.130212), (27.673810, -81.832708)), 14)))


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


if __name__ == "__main__":
    # get_viewports()
    # observe_divided_region()
    # upload_regions()
    # add_msa_rank()
    pass
