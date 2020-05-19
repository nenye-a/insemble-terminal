
import re
import ast
import time
import utils
import matplotlib.pyplot as plt
from decouple import config

from scrape.scraper import GenericScraper
from parsers import google_detail_parser

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"
HEADERS = {"referer": "https://www.google.com/"}
REGEX_18_HOURS = r'\[(?:\d+\,){17}\d+\]'
REGEX_24_HOURS = r'\[(?:\d+\,){23}\d+\]'
#TODO: fix regex to get Chick-fil-a in regex_address
REGEX_ADDRESS = r'[\\\\+\w+\'?\s+]+\,[\\+\w+\'?\s+]+\,[\w+\s+]+\,\s+\w{2}\s+\d{5}'
REGEX_LATLNG_1 = r'APP_INITIALIZATION_STATE\=\[\[\[\d+\.\d+\,\-?\d+\.\d+\,\-?\d+\.\d+\]'
REGEX_LATLNG_2 = r'\[\d+\.\d+\,\-?\d+\.\d+\,\-?\d+\.\d+\]'
AMPERSAND = '\\\\u0026'
GOOG_KEY = config("GOOG_KEY")
LAT_VIEWPORT_MULTIPLIER = 0.000000509499922
LNG_VIEWPORT_MULTIPLIER = 0.00000072025608
DEFALT_SCRAPER = GenericScraper('DEFAULT SCRAPER')


# Helper Functions

def get_nearby(venue_type, lat, lng):
    nearby_scraper = GoogleNearby('GOOGLE NEARBY')
    return nearby_scraper.get_nearby(venue_type, lat, lng)


def get_many_nearby(nearby_search_list):
    nearby_scraper = GoogleNearby('GOOGLE NEARBY')
    return nearby_scraper.get_many_nearby(nearby_search_list)


def get_lat_lng(query, include_sizevar=False):
    geocoder = GeoCode('GECODER')
    return geocoder.get_lat_lng(query, include_sizevar)


def get_many_lat_lng(queries, include_sizevar=False):
    geocoder = GeoCode('GECODER')
    return geocoder.get_many_lat_lng(queries, include_sizevar)


def get_google_details(name, address, projection=None):
    detailer = GoogleDetails('GOOGLE DETAILS')
    return detailer.get_details(name, address, projection=projection)


def get_many_google_details(places, projection=None):
    detailer = GoogleDetails('GOOGLE DETAILS')
    return detailer.many_google_details(places, projection=projection)


# Classes

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

    @staticmethod
    def default_parser(response):
        if response.status_code != 200:
            return None
        return {item.replace(AMPERSAND, "&") for item in set(re.findall(REGEX_ADDRESS, response.text))}

    @staticmethod
    def parse_zoom(response):
        if response.status_code != 200:
            return None
        return utils.get_one_int_from_str(re.search(r'zoom=\d+', response.text).group())

    def response_parse(self, response):
        return self.default_parser(response)

    def get_nearby(self, venue_type, lat, lng):
        url = self.build_request(venue_type, lat, lng, zoom=17)
        return self.request(
            url,
            quality_proxy=True,
            headers=HEADERS,
            timeout=5
        )

    def get_many_nearby(self, nearby_search_list):
        queries = [
            self.build_request(
                venue_type=term['venue_type'],
                lat=term['lat'],
                lng=term['lng']
            ) for term in nearby_search_list
        ]
        nearby = set()
        results = self.async_request(
            queries,
            quality_proxy=True,
            headers=HEADERS,
            timeout=5
        )
        for result in results:
            nearby.update(result)
        return list(nearby)


class GeoCode(GenericScraper):

    @staticmethod
    def build_request(query):
        query = query.replace(" ", "+")
        url = 'https://www.google.com/maps/search/{}/'.format(query)
        return url

    @staticmethod
    def default_parser(response):
        if response.status_code != 200:
            return None
        first_parse = re.findall(REGEX_LATLNG_1, response.text)
        match = re.findall(REGEX_LATLNG_2, first_parse[0])
        [goog_size_var, lng, lat] = ast.literal_eval(match[0])
        return lat, lng, goog_size_var

    def response_parse(self, response):
        return self.default_parser(response)

    def get_lat_lng(self, query, include_sizevar=False):

        url = self.build_request(query)
        try:
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
        except Exception as e:
            print("Error has occured in GeoCode: {} - request_url: {}".format(e, url))
            return None

    def get_many_lat_lng(self, query_list, inclde_sizevar=False):
        queries = [{
            'url': self.build_request(query),
            'meta': query,
        } for query in query_list]

        result = self.async_request(
            queries,
            quality_proxy=True,
            timeout=5
        )

        if not inclde_sizevar:
            for data in result:
                if data['data']:
                    data['data'] = data['data'][:2]
        return result


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
            activity: list[list[int]] - list of lists of hourly activity of the establishment
                        ex. [[0, 3, 14, 38, 72, 93, 91, 83, 78, 62, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 5, 18, 41, 59, 59, 50, 38, 22, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 2, 7, 16, 26, 35, 40, 37, 28, 16, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 1, 6, 17, 32, 44, 45, 35, 23, 12, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 2, 8, 17, 31, 44, 51, 47, 35, 21, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 1, 8, 25, 51, 70, 73, 64, 50, 31, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 5, 19, 47, 80, 100, 99, 88, 70, 45, 0, 0, 0, 0, 0, 0, 0, 0]]
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

        url = self.build_request(name, address)
        try:
            data = self.request(
                url,
                quality_proxy=True,
                timeout=5,
                meta={
                    'name': name
                }
            )
            if not data:
                return None
            data = data['data']
            projection_list = projection.strip().split(',') if projection else None
            if projection_list and data:
                data = {key: data[key] for key in projection_list}

            return data
        except Exception as e:
            print("Error has occured in GoogleDetails: {} - request_url: {}".format(e, url))
            return None

    def many_google_details(self, places, projection=None):
        """
        Provided a list of objects containing a name and address,
        will return their result tagged with the name and address.

        places : {
            'name': string, - name of place
            'address': string = address of place
        }
        """

        queries = []
        for place in places:
            url = self.build_request(place['name'], place['address'])
            place['request_url'] = url
            queries.append({'url': url, 'meta': place})

        result = self.async_request(
            queries,
            quality_proxy=True,
            timeout=5
        )

        projection_list = projection.strip().split(',') if projection else None
        if projection_list:
            for data in result:
                if data['data']:
                    data['data'] = {key: data['data'][key] for key in projection_list}
        return result

    @staticmethod
    def default_parser(response):
        if response.status_code != 200:
            return None
        return google_detail_parser(response)

    def response_parse(self, response):
        """
        Parses detail results into the required fields
        """
        return self.default_parser(response)

    def use_meta(self, result, meta):
        if 'name' in meta and result:
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
    viewport = get_viewport(lat, lng, goog_size_var)

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


def get_viewport(lat, lng, goog_size_var):
    """
    Get the viewport of a particular reigon given lat, lng, and size_var.
    goog_size_var is the variable that google adds to the initialization
    state when loading google maps for a particular region
    """
    # TODO: pull this into the lat, lng or add helper function
    nw = (lat + goog_size_var * LAT_VIEWPORT_MULTIPLIER, lng - goog_size_var * LNG_VIEWPORT_MULTIPLIER)
    se = (lat - goog_size_var * LAT_VIEWPORT_MULTIPLIER, lng + goog_size_var * LNG_VIEWPORT_MULTIPLIER)
    return nw, se


if __name__ == "__main__":

    TEST_LIST = [{'name': 'The UPS Store', 'address': '2897 N Druid Hills Rd NE, Atlanta, GA 30329'},
                 {'name': "O'Reilly Auto Parts", 'address': '3425 S Cobb Dr SE, Smyrna, GA 30080'},
                 {'name': 'Bush Antiques', 'address': '1440 Chattahoochee Ave NW, Atlanta, GA 30318'},
                 {'name': 'Chapel Beauty', 'address': '2626 Rainbow Way, Decatur, GA 30034'},
                 {'name': "Howard's Furniture Co INC", 'address': '3376 S Cobb Dr SE, Smyrna, GA 30080'},
                 {'name': 'Book Nook', 'address': '3073 N Druid Hills Rd NE, Decatur, GA 30033'},
                 {'name': 'Citi Trends', 'address': '3205 S Cobb Dr SE Ste A, Smyrna, GA 30080'},
                 {'name': 'Star Cafe', 'address': '2053 Marietta Blvd NW, Atlanta, GA 30318'},
                 {'name': 'Monterrey Of Smyrna', 'address': '3326 S Cobb Dr SE, Smyrna, GA 30080'},
                 {'name': 'Kroger', 'address': '4715 S Atlanta Rd SE, Smyrna, GA 30080'},
                 {'name': 'Rainbow Shops', 'address': '2685 Metropolitan Pkwy SW, Atlanta, GA 30315'},
                 {'name': "Nino's Italian Restaurant", 'address': '1931 Cheshire Bridge Rd NE, Atlanta, GA 30324'},
                 {'name': 'Sally Beauty Clearance Store', 'address': '3205 S Cobb Dr SE Ste E1, Smyrna, GA 30080'},
                 {'name': 'Vickery Hardware', 'address': '881 Concord Rd SE, Smyrna, GA 30082'},
                 {'name': 'Advance Auto Parts', 'address': '3330 S Cobb Dr SE, Smyrna, GA 30080'},
                 {'name': 'Top Spice Thai & Malaysian Cuisine', 'address': '3007 N Druid Hills Rd NE Space 70, Atlanta, GA 30329'},
                 {'name': 'Uph', 'address': '1140 Logan Cir NW, Atlanta, GA 30318'},
                 {'name': "Muss & Turner's", 'address': '1675 Cumberland Pkwy SE Suite 309, Smyrna, GA 30080'}]

    def get_google_details_test():
        name = "Atlanta Breakfast Club"
        address = "249 Ivan Allen Jr Blvd NW, Atlanta, GA 30313, United States"
        print(get_google_details(name, address))
        print(get_google_details(name, address, 'address'))
        print(get_google_details(name, address, 'address,name,rating,activity'))

    def get_nearby_test():
        venue_type = 'restaurants'
        lat = 33.840617
        lng = -84.3715611
        # print(get_nearby(venue_type, lat, lng))
        start = time.time()
        for venue_type, lat, lng in [(venue_type, lat, lng) for x in range(5)]:
            get_nearby(venue_type, lat, lng)
        finish = time.time()

        print("Nearby seconds: {} seconds".format(finish - start))

    def get_lat_lng_test():
        name = "Souvla Hayes Valley SF"
        print(name, get_lat_lng(name))
        print(name, "size var option", get_lat_lng(name, True))

    def get_many_lat_lng_test():
        my_list = [item["name"] + " " + item["address"] for item in TEST_LIST]
        goog_start = time.time()
        details = get_many_lat_lng(my_list)
        goog_time = time.time()
        print("{}\nGot the many details in {} seconds.".format(len(details), goog_time - goog_start))

    def get_viewport_test():
        name = "255 East Paces Ferry Rd NE, Atlanta, GA 30305, United States"
        lat, lng, goog_size_var = get_lat_lng(name)
        nw, se = get_viewport(lat, lng, goog_size_var)
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

    def get_many_google_details_test():
        goog_start = time.time()
        details = get_many_google_details(TEST_LIST + TEST_LIST)
        goog_time = time.time()
        print(details)
        print("{}\nGot the many details in {} seconds.".format(len(details), goog_time - goog_start))

    # get_google_activity_test()
    # get_many_lat_lng_test()
    # get_lat_lng_test()
    # get_nearby_test()
    # get_google_details_test()
    get_many_google_details_test()
