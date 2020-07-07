import utils
import accumulator


'''
Activity related queries.
'''


def activity(name, address):
    """
    Provided a name and an address, will determine the activity details.
    """

    place = accumulator.get_place(name, address)

    if place and place['google_details']['activity']:
        activity = place['google_details']['activity']
    else:
        return None

    name = place['name']
    location = place['address']

    activity = normalize(activity)

    return {
        'name': name,
        'location': location,
        'activity': parse_activity(activity)
    }


def aggregate_activity(name, location, scope):

    matching_places = accumulator.aggregate_places(
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

    matching_places = accumulator.aggregate_places(
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


def normalize(activity):

    if isinstance(activity[0][0], int):
        # TODO: Remove the need of naively dealing with length 18
        # lists once data collection is complete.
        return normalize_activity_old(activity)

    encoded_activity = utils.flatten(activity)
    return map(decode_activity, encoded_activity)


def normalize_flatten(list_acitivies):
    normalized_activity = utils.flatten(
        [list(normalize(activity)) for activity in list_acitivies]
    )

    return normalized_activity


def decode_activity(encoded_activity):
    """
    Provied a activity list structured [start_hour: string, [activity]]
    Will return a 24 hour list, with the first index corresponding to
    4AM.
    """

    first_hour = 4  # all lists baselined against 4 AM
    final_activity = [0 for i in range(24)]

    starting_hour, activity = encoded_activity
    first_index = starting_hour - first_hour
    item_indexes = range(first_index, first_index + len(activity))

    indexed_activity = zip(item_indexes, activity)

    for index, hour_activity in indexed_activity:
        try:
            # NOTE: following code is erroring in production, but not in development
            # adding print statements here upon exception for more accurate tracking
            # of the issue. Sentry posts it's own values, but does not quite show the
            # full story.
            final_activity[index] = hour_activity
        except Exception:
            print('Decode Activity threw an error:')
            print(f'Indexed Activity: {list(indexed_activity)}')
            print(f'Index & Hour Activity: {indexed_activity} | {hour_activity}')
            print(f'Final Activity: {final_activity}')
            print(f'Encoded Activity: {encoded_activity}')
            raise Exception

    return final_activity


def normalize_activity_old(activity):

    return [[0, 0] + sublist + [0, 0, 0, 0] if len(sublist) == 18 else sublist
            for sublist in activity]


def parse_activity(activity):
    return package_activity(avg_hourly_activity(activity))


def combine_avg_activity(list_places):

    list_activity = [place['google_details']['activity'] for place in list_places
                     if place['google_details']['activity']]
    activity = normalize_flatten(list_activity)

    return parse_activity(activity)


def avg_hourly_activity(activity):
    """Will dertemine the average activity of each hour over a week"""
    activity_by_hour = list(zip(*activity))
    return [round(sum(hour_activity) / len(hour_activity))
            if hour_activity and any(hour_activity) else 0
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
        # print(activity("ALDI", "401 Englar Rd, Westminster, MD 21157, USA"))

    def test_aggregate_activity():
        print(aggregate_activity("Starbucks", "Los Angeles, CA, USA", "City"), "\n")
        # print(aggregate_activity("Starbucks", "Los Angeles Count, CA, USA", "County"))

    def test_category_activity():
        pprint.pprint(category_activity("Coffee Shop", "Los Angeles, CA", "CITY"))
        # pprint.pprint(category_activity("Coffee Shop", "Los Angeles County, CA", "COUNTY"))

    def test_decode_activity():
        print(decode_activity([0, [11, 5, 0, 5, 0, 0, 5, 5, 5, 11, 23, 29, 35,
                                   35, 35, 41, 52, 70, 88, 100, 94, 82, 52, 29]]))
        print(decode_activity([4, [2, 2, 2, 2, 8, 22, 14, 2, 2, 17, 28,
                                   20, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]]))
        print(decode_activity([6, [0, 0, 0, 0, 0, 14, 26, 39, 50, 61,
                                   71, 78, 78, 69, 52, 35, 0, 0]]))

    def test_normalize_activity():
        print(list(normalize([
            [
                [0, [11, 5, 0, 5, 0, 0, 5, 5, 5, 11, 23, 29, 35,
                     35, 35, 41, 52, 70, 88, 100, 94, 82, 52, 29]],
                [4, [2, 2, 2, 2, 8, 22, 14, 2, 2, 17, 28,
                     20, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]]
            ],
            [
                [6, [0, 0, 0, 0, 0, 14, 26, 39, 50, 61,
                     71, 78, 78, 69, 52, 35, 0, 0]]
            ]
        ])))

    # test_activity()
    # test_decode_activity()
    # test_normalize_activity()
    # test_aggregate_activity()
    # test_category_activity()
    # test_avg_hourly_activity()
