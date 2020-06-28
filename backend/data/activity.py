import utils
import google
import time

import common


'''
Activity related queries.
'''


def activity(name, address):
    """
    Provided a name and an address, will determine the activity details.
    """

    place = common.get_place(name, address)

    if place:
        activity = place['google_details']['activity']
        print(activity)
    else:
        return None

    name = place['name']
    location = place['address']

    activity_arrays = [[0, 0] + sublist + [0, 0, 0, 0] if len(sublist) == 18 else sublist
                       for sublist in activity]

    avg_activity_per_hour = avg_hourly_activity(activity_arrays)

    return {
        'name': name,
        'location': location,
        'activity': package_activity(avg_activity_per_hour)
    }


def aggregate_activity(name, location, scope):

    matching_places = common.aggregate_places(
        name,
        'brand',
        location,
        scope,
        needs_google_details=True
    )

    if not matching_places:
        return None

    name = matching_places[0]['name']

    return {
        'name': name,
        'location': location,
        'activity': combine_avg_activity(matching_places)
    }


def category_activity(category, location, scope):

    matching_places = common.aggregate_places(
        category,
        'category',
        location,
        scope,
        needs_google_details=True
    )
    if not matching_places:
        return None

    return {
        'name': category,
        'location': location,
        'activity': combine_avg_activity(matching_places)
    }


def combine_avg_activity(list_places):

    list_activity = [place['google_details']['activity'] for place in list_places]
    activity_arrays = [[0, 0] + sublist + [0, 0, 0, 0] if len(sublist) == 18 else sublist
                       for sublist in utils.flatten(list_activity)]

    return package_activity(avg_hourly_activity(activity_arrays))


def avg_hourly_activity(activity):
    """Will dertemine the average activity of each hour over a week"""
    activity_by_hour = list(zip(*activity))
    return [round(sum(hour_activity) / len(hour_activity))
            if hour_activity and utils.contains_match(bool, hour_activity) else 0
            for hour_activity in activity_by_hour]


def package_activity(avg_activity_per_hour):

    hours = ["{}AM".format(x) for x in range(4, 12)]
    hours.append("12PM")
    hours.extend(["{}PM".format(x) for x in range(1, 12)])
    hours.append("12AM")
    hours.extend(["{}AM".format(x) for x in range(1, 4)])

    return dict(zip(hours, avg_activity_per_hour))


if __name__ == "__main__":
    import pprint

    def test_avg_hourly_activity():
        place = list(utils.DB_TERMINAL_PLACES.aggregate([
            {'$match': {
                '$and': [
                    {'google_details.activity': {'$ne': []}},
                    {'google_details.activity': {'$exists': True}}
                ]
            }},
            {
                '$sample': {'size': 1}
            }
        ]))[0]

        print(place['google_details']['activity'])
        print(avg_hourly_activity(place['google_details']['activity']))

    def test_activity():
        print(activity("Starbucks", "3900 Cross Creek Rd"))

    def test_aggregate_activity():
        print(aggregate_activity("Starbucks", "Los Angeles, CA, USA", "City"), "\n")
        # print(aggregate_activity("Starbucks", "Los Angeles Count, CA, USA", "County"))

    def test_category_activity():
        # pprint.pprint(category_activity("Coffee Shop", "Los Angeles, CA", "CITY"))
        pprint.pprint(category_activity("Coffee Shop", "Los Angeles County, CA", "COUNTY"))

    test_activity()
    # test_aggregate_activity()
    # test_category_activity()
    # test_avg_hourly_activity()
