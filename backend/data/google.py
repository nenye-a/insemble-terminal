from bs4 import BeautifulSoup
import requests
import datetime as dt
import re
import ast
import utils
import random
import time
import matplotlib.pyplot as plt
from pprint import pprint
from decouple import config

from scrape.scraper import GenericScraper
from parsers import google_detail_parser

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"
HEADERS = {"user-agent": USER_AGENT, "referer": "https://www.google.com/"}
REGEX_18_HOURS = r'\[(?:\d+\,){17}\d+\]'
REGEX_24_HOURS = r'\[(?:\d+\,){23}\d+\]'
REGEX_ADDRESS = r'[\\\\+\w+\'?\s+]+\,[\\+\w+\'?\s+]+\,[\w+\s+]+\,[\w+\s+]+\, United States'
REGEX_LATLNG_1 = r'APP_INITIALIZATION_STATE\=\[\[\[\d+\.\d+\,\-?\d+\.\d+\,\-?\d+\.\d+\]'
REGEX_LATLNG_2 = r'\[\d+\.\d+\,\-?\d+\.\d+\,\-?\d+\.\d+\]'
AMPERSAND = '\\\\u0026'
GOOG_KEY = config("GOOG_KEY")
LAT_VIEWPORT_MULTIPLIER = 0.000000509499922
LNG_VIEWPORT_MULTIPLIER = 0.00000072025608
DEFALT_SCRAPER = GenericScraper('Default Scraper')


# Helper Functions

def get_google_activity(name, address):
    activity_scraper = GoogleActivity('activity scraper')
    return activity_scraper.get_activity(name, address)


def get_nearby(venue_type, lat, lng):
    nearby_scraper = GoogleNearby('nearby scraper')
    return nearby_scraper.get_nearby(venue_type, lat, lng)


def get_lat_lng(query, include_sizevar=False):
    geocoder = GeoCode('geocoder')
    return geocoder.get_lat_lng(query, include_sizevar)


def get_details(name, address, projection=None):
    detailer = GoogleDetails('detailer')
    return detailer.get_details(name, address, projection=projection)


# Classes


class GoogleActivity(GenericScraper):

    @staticmethod
    def build_request(name, address):
        """
        Builds the activity request
        (formally build_google_activity_request)
        """
        formatted_input = utils.format_search(name, address)
        url = 'https://www.google.com/search?q=' + formatted_input
        return url

    def response_parse(self, response):
        """
        Parse response into a list of activity lists.
        (Formally parse_google_activity)
        """
        if response.status_code != 200:
            return None
        html_text = response.text
        # find the 18 or 24 hour activity distribution,depending on which is present
        data = [ast.literal_eval(item) for item in re.findall(REGEX_18_HOURS, html_text)]
        if len(data) == 0:
            data = [ast.literal_eval(item) for item in re.findall(REGEX_24_HOURS, html_text)]
        return data

    def get_activity(self, name, address):
        """
        Provided a name and address, will return a list
        of activity levels for retailer at that address
        """
        url = self.build_request(name, address)
        return self.request(
            url,
            quality_proxy=True,
            timeout=5
        )


class GoogleNearby(GenericScraper):

    @staticmethod
    def build_request(venue_type, lat, lng, zoom=17):
        """
        Returns params for which to scrape nearby
        (formally build_nearby_request)
        """
        venue_type = utils.encode_word(venue_type)
        url = 'https://www.google.com/maps/search/{}/@{},{},{}z'.format(
            venue_type,
            lat,
            lng,
            zoom
        )
        return url

    def response_parse(self, response):
        if response.status_code != 200:
            return None
        return {item.replace(AMPERSAND, "&") for item in set(re.findall(REGEX_ADDRESS, response.text))}

    def get_nearby(self, venue_type, lat, lng):
        url = GoogleNearby.build_request(venue_type, lat, lng, zoom=17)
        return self.request(
            url,
            quality_proxy=True,
            headers=HEADERS,
            timeout=5
        )


class GeoCode(GenericScraper):

    @staticmethod
    def build_request(query):
        query = utils.encode_word(query)
        url = 'https://www.google.com/maps/search/{}/'.format(query)
        return url

    def response_parse(self, response):
        if response.status_code != 200:
            return None
        first_parse = re.findall(REGEX_LATLNG_1, response.text)
        match = re.findall(REGEX_LATLNG_2, first_parse[0])
        [goog_size_var, lng, lat] = ast.literal_eval(match[0])
        return lat, lng, goog_size_var

    def get_lat_lng(self, query, include_sizevar=False):

        url = self.build_request(query)
        lat, lng, goog_size_var = self.request(
            url,
            headers=HEADERS,
            quality_proxy=True,
            timeout=5
        )
        if include_sizevar:
            return lat, lng, goog_size_var
        else:
            return lat, lng


class GoogleDetails(GenericScraper):

    BASE_URL = 'https://www.google.com/search?q={}&sourceid=chrome&ie=UTF-8'

    @staticmethod
    def build_request(name, address):

        name = utils.encode_word(name)
        address = utils.encode_word(address)
        url = GoogleDetails.BASE_URL.format(name + '+near+' + address)
        return url

    def get_details(self, name, address, projection=None):
        """

        Parameters:
            name: string
            address: string
            projection: string - example: 'name,num_stars,num_reviews'

        Return:
            returns an object that contains the projected fields. If no fields
            are projected, will return the entire details:

            name: string - establishment name (as detailed on google)
            rating: number - rating out of 5 ex. 5.5
            num_reviews: number - number of ratings of the establishment ex. 4.4
            price: string - ex. "$$"
            type: string
            description: string
            operations: {   - strings determining the actual details
                'dine_in': string,
                'takeout': string,
                'delivery': string
            }
            address: string - formated address , ex. "371 E 2nd St, Los Angeles, CA 90012"
            current_hours: string, ex. Closes 9PM (hours that it closes on the day that it was pulled)
            menu_link: string, ex. "spitzrestaurant.com"
            phone: string, ex. "(213) 613-0101"
            online_ordering_platforms: list[string] - ex. ["spitzrestaurant.com", "trycaviar.com", 
                                                         "doordash.com", "postmates.com"]
            top_review_comments: list[string] - ex. ["Good fries and nice ambiance for drinks 
                                                     and food after long day at work",
                                                    "Good rotating selection of draught beers, 
                                                     greekish type flavors in the menu."]
            self_description: string - ex. "Spitz = Healthy & flavorful wraps, döners, salads and our famous fries..."
            time_of_scrape: string - ex. '04-17-2020_20:39:36'

        """

        url = GoogleDetails.build_request(name, address)
        data = self.request(
            url,
            quality_proxy=True,
            timeout=5,
            meta={
                'name': name
            }
        )['data']
        projection_list = projection.strip().split(',') if projection else None
        if projection_list and data:
            data = {key: data[key] for key in projection_list}

        return data

    def response_parse(self, response):
        """
        Parses detail results into the required fields
        """

        if response.status_code != 200:
            return None
        return google_detail_parser(response)

    def use_meta(self, result, meta):
        print(result)
        if 'name' in meta and result:
            print(utils.fuzzy_match(meta['name'], result['name']))
            if not utils.fuzzy_match(meta['name'], result['name']):
                return None
        return result


def query_region_random(region, search_terms, num_results):
    # using a region (city, state, etc), this queries the region for the specified search terms at random
    # returning a set of establishments with their addresses as a string
    # TODO: break up into subfunctions to optimize for scraping
    # TODO: use mongo to geofence calls to avoid repeats
    # TODO: set limit to return if the num of results is never achieved

    # build scraper
    results = set()
    scraper = GenericScraper('query_region_random scraper')

    # get lat, lng, and viewport of the region that's being queried
    lat, lng, goog_size_var = get_lat_lng(region, include_sizevar=True)
    viewport = _get_viewport(lat, lng, goog_size_var)

    # choose random points in the viewport to run nearby requests on until reaching the desired number of results
    while len(results) < num_results:
        # choose random coordinates in viewport
        r_lat, r_lng = utils.get_random_latlng(viewport[0], viewport[1])
        for term in search_terms:
            # TODO: scrape asynchronously
            results.update(get_nearby(term, r_lat, r_lng))
            if len(results) > num_results:
                return results
            print("queried {} results".format(len(results)))
    return results


def _get_viewport(lat, lng, goog_size_var):
    """
    Get the viewport of a particular reigon given lat, lng, and size_var.
    goog_size_var is the variable that google adds to the initialization
    state when loading google maps for a particular region
    """
    nw = (lat + goog_size_var * LAT_VIEWPORT_MULTIPLIER, lng - goog_size_var * LNG_VIEWPORT_MULTIPLIER)
    se = (lat - goog_size_var * LAT_VIEWPORT_MULTIPLIER, lng + goog_size_var * LNG_VIEWPORT_MULTIPLIER)
    return nw, se


if __name__ == "__main__":

    def get_google_activity_test():
        name = "Atlanta Breakfast Club"
        address = "249 Ivan Allen Jr Blvd NW, Atlanta, GA 30313, United States"
        data = get_google_activity(name, address)
        print(data)
        fig, sbts = plt.subplots(len(data))
        for i in range(len(sbts)):
            sbts[i].bar(range(len(data[i])), data[i])
        plt.show()

    def get_google_details_test():
        name = "Atlanta Breakfast Club"
        address = "249 Ivan Allen Jr Blvd NW, Atlanta, GA 30313, United States"
        print(get_details(name, address))
        print(get_details(name, address, 'address'))
        print(get_details(name, address, 'address,name,rating'))

    def get_nearby_test():
        venue_type = 'restaurants'
        lat = 33.840617
        lng = -84.3715611
        print(get_nearby(venue_type, lat, lng))

    def get_lat_lng_test():
        name = "Souvla Hayes Valley SF"
        print(name, get_lat_lng(name))
        print(name, "size var option", get_lat_lng(name, True))

    def get_viewport_test():
        name = "255 East Paces Ferry Rd NE, Atlanta, GA 30305, United States"
        lat, lng, goog_size_var = get_lat_lng(name)
        nw, se = _get_viewport(lat, lng, goog_size_var)
        print(name, lat, lng, "nw:", nw, "se:", se)

    def get_random_latlng_test():
        nw = (33.84052626832547, -84.38138020826983)
        se = (33.83714933167453, -84.37660639173015)
        lat, lng = utils.get_random_latlng(nw, se)
        print("Lat", lat, se[0] <= lat <= nw[0])
        print("Lng", lng, nw[1] <= lng <= se[1])

    def query_region_random_test():
        region = "Culver City, CA"
        terms = ["stores", "restaurants"]
        num_results = 10
        print(query_region_random(region, terms, num_results))

    get_google_activity_test()
    # get_google_details_test()
