import utils
import time
import datetime as dt
import google
from performancev2 import (total_volume, avg_hourly_volume,
                           local_retail_volume, local_category_volume)


def get_place(name, address):
    """
    Get a place from the database that matches a name and
    address. If the place is not in the database, scrape 
    and return the details. Will return None if no place is
    available.
    """

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


def aggregate_places(name, name_type, location,
                     scope, needs_google_details=True):
    """
    Get all the places within a location that are related
    to a particular brand or category. If name is None, will
    just return all the locations within a specified area
    regardless of category or brand.

    Parameters
    ----------
        name: string - name of the brand or category
        name_type: 'brand' | 'category' | None
        location: string - address, city, or county of the 
                           area of which to include locations
                           from
        scope: 'CITY' | 'COUNTY' - scope of location.
    """

    key, name_query = None, {}
    if name_type.lower() == 'brand':
        key = 'name'
    elif name_type.lower() == 'category':
        key = 'type'

    if key and name:
        # look for places in our database using regexes
        # + search to match to items.
        name_query = {
            key: {
                "$regex": r"^" + utils.adjust_case(name),
                "$options": "i"}
        }

    if needs_google_details:
        # TODO: re-index the database.
        name_query.update({
            'google_details': {'$exists': True}
        })

    location_list = [word.strip() for word in location.split(',')]

    if scope.lower() == 'address':
        retries, backoff = 0, 1
        coordinates = None
        while not coordinates or retries > 2:
            try:
                coordinates = utils.to_geojson(google.get_lat_lng(location))
            except Exception:
                retries += 1
                print("Failed to obtain coordinates, trying again. "
                      "Retries: {} / 5".format(retries))
                time.sleep(1 + backoff)
                backoff += 1

        address_query = {
            'location': {'$near': {'$geometry': coordinates,
                                   '$maxDistance': utils.miles_to_meters(0.5)}},
        }
        address_query.update(name_query)
        matching_places = list(utils.DB_TERMINAL_PLACES.find(address_query))
    elif scope.lower() == 'city':
        city_query = {
            'city': {
                "$regex": r"^" + utils.adjust_case(location_list[0]),
                "$options": "i"},
            'state': location_list[1].upper()
        }
        city_query.update(name_query)
        matching_places = list(utils.DB_TERMINAL_PLACES.find(city_query))

    elif scope.lower() == 'county':
        region = utils.DB_REGIONS.find_one({
            'name': {
                "$regex": r"^" + utils.adjust_case(location_list[0]),
                "$options": "i"},
            'state': location_list[1].upper(),
            'type': 'county'
        })
        if not region:
            return None
        county_query = {
            'location': {'$geoWithin': {'$geometry': region['geometry']}},
        }
        county_query.update(name_query)
        matching_places = list(utils.DB_TERMINAL_PLACES.find(county_query))
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


if __name__ == "__main__":
    def test_get_details():
        # NOTE: Before firing this test, make sure to turn off update.
        name = "TGI Fridays"
        address = "4701 Firestone Blvd, South Gate, CA 90280"
        print(get_details(name, address))
