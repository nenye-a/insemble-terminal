import utils
import google
import pandas as pd
import datetime as dt
from locations import divide_region


TIME_ZONE_OFFSET = -dt.timedelta(hours=7)


def staged_finder(region, term, zoom=15, batch_size=100):
    """
    Stage search approach to getting all items in a region. Will run a query at a
    course zoom to get a set of points that it should be calling. Based on that query
    it will then go through 2 more levels of calls to determine the calls that it 
    should be making
    """
    lat, lng, viewport = google.get_lat_lng(region, viewport=True)
    nw, se = viewport
    center = lat, lng
    run_identifier = {
        'center': utils.to_geojson(center),
        'viewport': {
            'nw': utils.to_geojson(nw),
            'se': utils.to_geojson(se)
        },
        'zoom': zoom
    }
    log_identifier = dict(run_identifier, **{'method': 'stage_finder'})
    has_document = utils.DB_STAGING.find_one(run_identifier)
    if not has_document:
        stage_dict = {'stage': 1}
        coords = [dict(run_identifier, **stage_dict, **{'query_point': utils.to_geojson(query_point)})
                  for query_point in divide_region(center, viewport, zoom)]
        try:
            log_identifier['1st_stage_points'] = len(coords)
            log_identifier['created_at'] = dt.datetime.now(tz=dt.timezone(TIME_ZONE_OFFSET))
            utils.DB_LOG.insert_one(log_identifier)
            utils.DB_STAGING.insert_many(coords, ordered=False)
        except utils.BWE:
            print('Center, viewport, zoom, combo already in database, please check.')
            raise

    return


def print_zoom_region(region, zoom):
    lat, lng, viewport = google.get_lat_lng(region, viewport=True)
    nw, se = viewport
    center = lat, lng
    coords = []
    points = divide_region(center, viewport, zoom)
    # Use the following script to simply print out the regions.
    for item in points:
        coords.append({
            'latitude': item[0],
            'longitude': item[1]
        })
    pd.DataFrame(coords).to_csv('datapoints.csv')


if __name__ == "__main__":
    # print_zoom_region("Los Angeles", 15)
    staged_finder("Los Angeles", "restaurants", batch_size=100)
