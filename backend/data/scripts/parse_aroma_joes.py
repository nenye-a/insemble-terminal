import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import re
import google
import utils
import datetime as dt

all_matcher = re.compile(
    r'"latitude":"([^"]+)","longitute":"([^"]+)","store_no":"([^"]+)","address":"([^"]+)","state_code":"([^"]+)","zip_code":"([^"]+)"')
matcher = re.compile(r'"address":"([^"]+)"')

# NOTE: Only works with test.html (html of aroma joe's website)


def get_aroma_joes_addresses():

    with open(THIS_DIR + "/files/test.html") as f:
        joes_string = f.read()
        matches = all_matcher.findall(joes_string)

    matches = [{
        'location': utils.to_geojson((round(float(match[0]), 6), round(float(match[1]), 6))),
        'address': match[3],
        'state': match[4],
        'zip_code': match[5]
    } for match in matches]

    return matches


def locations():

    locations = get_aroma_joes_addresses()

    parsed_locations = []
    for place in locations:
        address_components = place['address'].split(' - ')
        city_components = address_components[0].split(', ')
        address = " - ".join(address_components[1:])
        city = city_components[0].strip()

        parsed_locations.append({
            'name': "Aroma Joe's",
            'address': address,
            'city': city,
            'state': place['state'],
            'location': place['location'],
            'zip_code': place['zip_code']
        })

    all_locations = google.get_many_google_details(parsed_locations)

    new_locations = []
    for location in all_locations:
        if location['data']:
            data = location['data']
            meta = location['meta']
            place_input = {
                'name': "Aroma Joe's",
                'address': data['address'] if data['address'] else "{address}, {city}, {state} {zip}".format(
                    address=meta['address'], city=meta['city'], state=meta['state'], zip=meta['zip_code']),
                'state': meta['state'],
                'city': utils.adjust_case(meta['city']),
                'version': 0,
                'last_update': dt.datetime.now(),
                'location': meta['location'],
                'google_details': data
            }
            new_locations.append(place_input)

    h = utils.DB_TERMINAL_PLACES.insert_many(new_locations, ordered=False)
    print(h)


locations()
