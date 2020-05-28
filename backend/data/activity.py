import time
import google
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
        'name': {"$regex": r"^" + utils.modify_word(name), "$options": "i"},
        'address': {"$regex": r'^' + utils.modify_word(address[:8]), "$options": "i"},
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

    test_activity()
