import utils
import performance


'''
Activity related queries.
'''


def activity(name, address):
    """
    Provided a name and an address, will determine the activity details.
    """

    # NOTE: Currently checks database for result first. Might want to grab results
    # Adhoc, if the latest is required.
    place = utils.DB_TERMINAL_PLACES.find_one({
        '$text': {'$search': name},
        'name': {"$regex": r"^" + utils.adjust_case(name), "$options": "i"},
        'address': {"$regex": r'^' + utils.adjust_case(address[:10]), "$options": "i"},
        'google_details.activity': {'$ne': None}
    })

    if place:
        activity = place['google_details']['activity']
    elif not place:
        place = performance.get_details(name, address)
        if not place:
            return None
        # TODO: update details on database with the
        # ones searched here if we don't have
        activity = place['activity']

    name = place['name']
    location = place['address']

    avg_activity_per_hour = avg_hourly_activity(activity)

    return {
        'name': name,
        'location': location,
        'activity': package_activity(avg_activity_per_hour)
    }


def aggregate_activity(name, location, scope):
    location_list = [word.strip() for word in location.split(',')]
    if scope.lower() == 'city':
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            '$text': {'$search': name},
            'name': {"$regex": r"^" + utils.adjust_case(name[:10]), "$options": "i"},
            'city': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': {"$regex": r"^" + location_list[1].upper(), "$options": "i"},
            'google_details.activity': {'$ne': None}
        }))
    elif scope.lower() == 'county':
        region = utils.DB_REGIONS.find_one({
            'name': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': {"$regex": r"^" + location_list[1].upper(), "$options": "i"},
            'type': 'county'
        })
        if not region:
            return None
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            '$text': {'$search': name},
            'name': {"$regex": r"^" + utils.adjust_case(name[:10]), "$options": "i"},
            'location': {'$geoWithin': {'$geometry': region['geometry']}},
            'google_details.activity': {'$ne': None}
        }))
    else:
        return None

    if not matching_places:
        return None

    name = matching_places[0]['name']

    return {
        'name': name,
        'location': location,
        'activity': combine_avg_activity(matching_places)
    }


def combine_avg_activity(list_places):

    count_dict = {}
    avg_dict = {}
    for place in list_places:
        activity = place['google_details']['activity']
        packaged_data = package_activity(avg_hourly_activity(activity))
        if packaged_data:
            for hour in packaged_data:
                count_dict[hour] = count_dict.get(hour, 0) + 1
                avg_dict[hour] = (packaged_data[hour] + avg_dict.get(hour, 0) * (count_dict[hour] - 1)) / \
                    count_dict[hour]

    return utils.round_object(avg_dict)


def avg_hourly_activity(activity):
    """Will dertemine the average activity of each hour over a week"""
    activity_by_hour = list(zip(*activity))
    return [round(sum(hour_activity) / len(hour_activity)) if hour_activity else 0
            for hour_activity in activity_by_hour]


def package_activity(avg_activity_per_hour):

    if len(avg_activity_per_hour) == 18:
        hours = ["{}AM".format(x) for x in range(6, 12)]
        hours.append("12PM")
        hours.extend(["{}PM".format(x) for x in range(1, 12)])
    elif len(avg_activity_per_hour) == 24:
        hours = ["{}AM".format(x) for x in range(4, 12)]
        hours.append("12PM")
        hours.extend(["{}PM".format(x) for x in range(1, 12)])
        hours.append("12AM")
        hours.extend(["{}AM".format(x) for x in range(1, 4)])
    else:
        return None

    return dict(zip(hours, avg_activity_per_hour))


if __name__ == "__main__":
    def test_activity():
        print(activity("Starbucks", "3900 Cross Creek Rd"))

    def test_aggregate_activity():
        print(aggregate_activity("Starbucks", "Los Angeles, CA, USA", "City"), "\n")
        print(aggregate_activity("Starbucks", "Los Angeles Count, CA, USA", "County"))

    # test_activity()
    test_aggregate_activity()
