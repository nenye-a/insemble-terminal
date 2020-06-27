import utils
import mongo
import datetime as dt
import google
from performancev2 import (total_volume, avg_hourly_volume,
                           local_retail_volume, local_category_volume)


def get_place(name, address):

    place = utils.DB_TERMINAL_PLACES.find_one({
        'name': {"$regex": r"^" + utils.adjust_case(name), "$options": "i"},
        'address': {"$regex": r'^' + utils.adjust_case(address[:10]), "$options": "i"},
        'google_details.activity': {'$ne': None}
    })

    if not place:
        return get_details(name, address)

    return place


def get_details(name, address):

    details = google.get_google_details(
        name, address
    )

    location = utils.to_geojson(google.get_lat_lng(address))

    if details:

        retail_type = None
        if utils.inbool(details, 'type'):
            retail_type = utils.adjust_case(details['type'].split(" in ")[0])

        place = {
            'name': utils.remove_name_ats(details['name']),
            'address': details['address'],
            'city': utils.extract_city(details['address']),
            'state': utils.extract_state(details['address']),
            'location': location,
            'type': retail_type,

            'activity_volume': total_volume(details['activity'])
            if details['activity'] else -1,

            'avg_activity': avg_hourly_volume(details['activity'])
            if details['activity'] else -1,

            'local_retail_volume': local_retail_volume(location)
            if location else -1,

            'local_category_volume': local_category_volume(location, retail_type)
            if location else -1,

            'num_nearby': len(get_nearby(location, 0.01)),

            'version': 0,
            'last_update': dt.datetime.utcnow(),
            'google_details': details
        }

        try:
            utils.DB_TERMINAL_PLACES.insert_one(place)
            print("Inserted {} ({}) into the database.".format(
                place['name'], place['address']
            ))
        except Exception:
            pass

        return place


def aggregate_places(name, location, scope):

    location_list = [word.strip() for word in location.split(',')]
    if scope.lower() == 'city':
        # look for places in our database using regexes + search to match to items.
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'name': {"$regex": r"^" + utils.adjust_case(name), "$options": "i"},
            'city': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': location_list[1].upper(),
            'google_details': {'$exists': True}
        }))
    elif scope.lower() == 'county':
        region = utils.DB_REGIONS.find_one({
            'name': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': location_list[1].upper(),
            'type': 'county'
        })
        if not region:
            return None
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'name': {"$regex": r"^" + utils.adjust_case(name), "$options": "i"},
            'location': {'$geoWithin': {'$geometry': region['geometry']}},
            'google_details': {'$exists': True}
        }))
    else:
        return None

    return matching_places


def get_nearby(geo_point, radius, retail_type=None, terminal_db=None):

    if not terminal_db:
        terminal_db = utils.DB_TERMINAL_PLACES

    query = {}
    if retail_type:
        query['type'] = retail_type
    query.update({
        'location': {
            '$near': {
                '$geometry': geo_point,
                '$maxDistance': utils.miles_to_meters(radius)
            }
        },
    })

    nearby_places = list(terminal_db.find(query))
    return nearby_places
