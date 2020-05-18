import google
import opentable
import utils

'''

Performance related queries.

'''


def performance(name, address):
    """

    Provided the name (business, category, or brand) and an address of a location,
    will recover the performance dictionary for that item.

    Parameters:
        name: string - name of the location
        address: string - address of the location

    Response: {
        name: string,
        address: string,
        salesVolumeIndex?: number,
        rating?: number,
        numReviews?: number,
        numLocations?: number,
    }

    """

    place_details = get_details(name, address)
    if place_details:
        sales_index = activity_score(place_details['activity'])

        return {
            'name': place_details['name'],
            'salesVolumeIndex': sales_index if sales_index != 0 else None,
            'rating': place_details['rating'],
            'numReviews': place_details['num_reviews'],
            'numLocations': None
        }
    else:
        return None


def get_details(name, address):
    projection = 'name,rating,num_reviews,activity'
    try:
        google_details = google.get_google_details(
            name, address, projection
        ) or {}

        return google_details
    except Exception:
        return None


def activity_score(week_activity):
    total_weight = 0.7
    avg_weight = 1 - total_weight
    total_volume_score = scale(total_volume(week_activity), 'total')
    avg_volume_score = scale(avg_hourly_volume(week_activity), 'avg')

    return round(total_weight * total_volume_score + avg_weight * avg_volume_score)


def scale(value, volume_type):
    """scale volume details"""
    if volume_type == 'total':
        return utils.translate(value, 0, 11000, 0, 100)
    if volume_type == 'avg':
        return utils.translate(value, 0, 75, 0, 100)


def total_volume(week_activity):
    """Find the total volume of activity"""
    fill_week(week_activity)
    week_volume = sum([sum(day_activity) for day_activity in week_activity])
    return week_volume


def avg_hourly_volume(week_activity):
    """Find the average hourly volume"""
    fill_week(week_activity)
    active_weeks = len([day for day in week_activity if day])

    avg_day_volume = float(sum([
        float(sum(day_activity)) / len([
            hour for hour in day_activity if hour != 0
        ]) if has_activity(day_activity) else 0 for day_activity in week_activity
    ])) / active_weeks if active_weeks != 0 else 0

    return avg_day_volume


def has_activity(my_list):
    for item in my_list:
        if item != 0:
            return True


def fill_week(week):
    while len(week) < 7:
        if len(week) % 2 == 0:
            week.append([])
        else:
            week.insert(0, [])


if __name__ == "__main__":
    def test_performance():
        name = "Atlanta Breakfast Club"
        address = "249 Ivan Allen Jr Blvd NW, Atlanta, GA 30313, United States"
        print(performance(name, address))

    test_performance()
