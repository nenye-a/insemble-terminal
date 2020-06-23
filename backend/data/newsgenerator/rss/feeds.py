import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
import feedparser
import mongo
import datetime
import pytz
import dateutil.parser as tparser
import pandas as pd
import utils
sys.path.pop()

'''
All RSS feeds, and related feed parsing functions.
'''

SYSTEM_MONGO = mongo.Connect()  # client, MongoDB connection
DB_FEEDS = SYSTEM_MONGO.get_collection(mongo.FEEDS)
DB_ZIPS = SYSTEM_MONGO.get_collection(mongo.ZIPS)


def get_news(zipcode, scope='Local', date=None) -> list:
    """
    Helper function to get the latest news from a location string.
    Provided a location, will return a list of news articles.

    Parameters:
        zipcode: int                example: 91002
        scope: string               available options: "local", "regional", "national"

    Return: [
        {
            title: string,
            description: string,
            link: string,
            image: string,
            source, string,
            published: stirng
        }
    ]
    """
    news_feeds = feeds(zipcode, scope)
    location_news = latest_news(news_feeds, date)

    print("**RSS Feeds: New feed news for {}: {}".format(zipcode, len(location_news)))

    return location_news


def get_national_news():
    """
    Helper function to get the national news.
    """

    national_news = latest_news(national_feeds())
    print("**RSS Feeds: New national news: {}".format(len(national_news)))

    return national_news


def feeds(zipcode, scope='Local'):
    """
    Provided a zipcode, will return all the feeds associated with the zip code. Will additionally return national
    or regional sources if requested. If 'Regional' is requested, both local and regional sources will be returned.
    If 'National' is requested, all sources local, regional, and National will be returned.

    Response:
        [
            {
                Feed: string,
                Link: string,
                City: string or None,
                Scope: string,
                Topic: [String],
                Tag: string,
                location: {
                    type: string,
                    coordinates: list[int]
                }
            }
        ]
    """

    database = mongo.Connect()
    zips_db = database.get_collection(mongo.ZIPS)
    feeds_db = database.get_collection(mongo.FEEDS)

    zipcode = zips_db.find_one({"ZipCode": int(zipcode)})
    if not zipcode:
        return []

    if scope.lower() == "regional":
        scope_or_query = [{"Scope": "Local"}, {"Scope": "Regional"}]
        query_distance = 150  # in miles
    else:
        scope_or_query = [{"Scope": "Local"}]
        query_distance = 20  # in miles

    feeds = feeds_db.find({
        "location": {
            "$near": {
                "$geometry": zipcode["location"],
                "$maxDistance": utils.miles_to_meters(query_distance)
            }
        },
        "$or": scope_or_query
    })

    or_query = []
    if scope.lower() == 'national':
        or_query.extend([{"Scope": "Regional"}, {"Scope": "National"}])

    scoped_feeds = DB_FEEDS.find({"$or": or_query}) if len(or_query) > 0 else None

    feeds = list(feeds) + list(scoped_feeds) if scoped_feeds else list(feeds)

    database.close()
    return feeds


def national_feeds():
    """
    Function to only receive the national feeds.
    """
    return list(DB_FEEDS.find({"Scope": "National"}))


def latest_news(feed_list, date=None):
    """
    Provided a list of feeds return all the news from that feed. If a time cutoff is provided,
    will only return news up to the date. Dates should be provided in ISO format.

    By default, will provide news from the past week.
    """

    if not date:
        date = datetime.datetime.utcnow() - datetime.timedelta(weeks=1)

    news = []
    for feed in feed_list:
        parsed_feed = feedparser.parse(feed['Link'])
        for entry in parsed_feed.entries:
            # TODO: fix it so that differing structure works out
            if 'published' not in entry or 'link' not in entry:
                continue

            published_datetime = tparser.parse(entry.published).astimezone(pytz.utc).replace(tzinfo=None)
            if published_datetime > date:

                # grab any images if there are any
                image = ""
                if 'links' in entry:
                    for link in entry.links:
                        if "image" in link['type']:
                            image = link['href']
                            break
                if image == "" and 'media_content' in entry:
                    image = entry.media_content[0]['url']

                news.append({
                    'title': entry.get('title', 'Untitled'),
                    'description': utils.remove_html_tags(entry.get('summary', 'No description')),
                    'link': entry.link,
                    'image': image,
                    'source': feed['Feed'],
                    'published': published_datetime.ctime()
                })

    return news


# Maintanence Methods:


def insert_feeds():
    feeds = pd.read_csv('rssnewsfeeds.csv').fillna(0).to_dict(orient='records')
    for feed in feeds:
        feed['Topic'] = [topic.strip() for topic in feed['Topic'].split(',')]
        lat = feed.pop('Latitude')
        lng = feed.pop('Longitude')
        feed['location'] = {
            "type": "Point",
            "coordinates": [lng, lat]
        } if lat != 0 else None
        if feed['City'] == 0:
            feed['City'] = None
    DB_FEEDS.insert_many(feeds, ordered=False)


def insert_zips():
    zips = pd.read_csv('zip-codes.csv').fillna(0).to_dict(orient='records')
    for zipcode in zips:
        lat = zipcode.pop('Latitude')
        lng = zipcode.pop('Longitude')
        zipcode['location'] = {
            "type": "Point",
            "coordinates": [lng, lat]
        } if lat != 0 else None
    DB_ZIPS.insert_many(zips, ordered=False)


if __name__ == "__main__":
    def test_feeds():
        news = latest_news(feeds(90012, 'regional'))
        print(len(news))
        # k = pd.DataFrame(news)
        # k.to_csv('news_90012.csv')

    def national_feeds_test():
        print(get_national_news())

    test_feeds()
    # national_feeds_test()
