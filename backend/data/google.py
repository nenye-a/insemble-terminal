
import re
import ast
import time
import utils
import matplotlib.pyplot as plt
from decouple import config

from scrape.scraper import GenericScraper
from parsers import google_detail_parser, google_news_parser, google_company_parser

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"
HEADERS = {"referer": "https://www.google.com/"}
REGEX_18_HOURS = r'\[(?:\d+\,){17}\d+\]'
REGEX_24_HOURS = r'\[(?:\d+\,){23}\d+\]'
REGEX_ADDRESS = r'[\w\-\s\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+\,[\\+\w+\-\'?\s\#]+\,[\w+\s+]+\,\s+\w{2}\s+\d{5}'
REGEX_LATLNG_1 = r'APP_INITIALIZATION_STATE\=\[\[\[\d+\.\d+\,\-?\d+\.\d+\,\-?\d+\.\d+\]'
REGEX_LATLNG_2 = r'\[\d+\.\d+\,\-?\d+\.\d+\,\-?\d+\.\d+\]'
REGEX_LATLNG_3 = r'\[\d+\.\d\,[\-\d]+\.\d+\,[\-\d]+\.\d+\]'
REGEX_LATLNG_4 = r'[\-\d]+\.\d+\,[\-\d]+\.\d+'
REGEX_COORD_ADDRESS = r'[\-\d]+\.\d+\,[\-\d]+\.\d+\]\\\w\,[\\\"\w\:]+\,[\"\w\-\s\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+' \
                      r'\[[\\\"\w\s\'\-\:\,]+\]\\\w[\\\"\w\s\'\:\,\-\=\&\;\.\+\(\)\!\*\@\#\$\%\|]+'
GOOG_KEY = config("GOOG_KEY")
LAT_VIEWPORT_MULTIPLIER = 0.000000509499922
LNG_VIEWPORT_MULTIPLIER = 0.00000072025608
DEFAULT_SCRAPER = GenericScraper('DEFAULT SCRAPER')


# Helper Functions

def get_nearby(venue_type, lat, lng, zoom=17):
    nearby_scraper = GoogleNearby('GOOGLE NEARBY')
    return nearby_scraper.get_nearby(venue_type, lat, lng, zoom)


def get_many_nearby(nearby_search_list):
    """
    nearby_search_list should include tuples of (venue_type, lat, lng)
    or (venue_type, lat, lng, zoom)
    """
    nearby_scraper = GoogleNearby('GOOGLE NEARBY')
    return nearby_scraper.get_many_nearby(nearby_search_list)


def get_lat_lng(query, include_sizevar=False, viewport=False):
    geocoder = GeoCode('GECODER')
    return geocoder.get_lat_lng(
        query,
        include_sizevar=include_sizevar,
        viewport=viewport
    )


def get_many_lat_lng(queries, include_sizevar=False, place_dict=False, viewport=False):
    geocoder = GeoCode('GECODER')
    return geocoder.get_many_lat_lng(
        queries,
        include_sizevar=include_sizevar,
        place_dict=place_dict,
        viewport=viewport
    )


def get_google_details(name, address, projection=None):
    detailer = GoogleDetails('GOOGLE DETAILS')
    return detailer.get_details(name, address, projection=projection)


def get_many_google_details(places, projection=None):
    detailer = GoogleDetails('GOOGLE DETAILS')
    return detailer.many_google_details(places, projection=projection)

def get_company(name, projection=None):
    company_scraper = GoogleCompany('GOOGLE COMPANY')
    return company_scraper.get_details(name, projection=projection)

def get_news(query, num_retries=None):
    news_scraper = GoogleNewsScraper('NEWS SCRAPER')
    num_retries and news_scraper.set_retries(max_retries=num_retries)
    return news_scraper.get_news(query)


def get_many_news(queries, num_retries=None):
    news_scraper = GoogleNewsScraper('NEWS SCRAPER')
    num_retries and news_scraper.set_retries(max_retries=num_retries)
    return news_scraper.get_many_news(queries)

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
        return {utils.format_punct(item) for item in set(re.findall(REGEX_ADDRESS, response.text))}

    @staticmethod
    def parse_zoom(response):
        if response.status_code != 200:
            return None
        return utils.get_one_int_from_str(re.search(r'zoom=\d+', response.text).group())

    @staticmethod
    def parse_nearest_latlng(response):
        """
        Returns a set of nearby (lat, lng) tuples that correspond to the nearby locations in this request
        """
        if response.status_code != 200:
            return None
        unprocessed_coords = re.findall(REGEX_LATLNG_3, response.text)
        return {(ast.literal_eval(coords)[2], ast.literal_eval(coords)[1]) for coords in set(unprocessed_coords)}

    @staticmethod
    def parse_address_latlng(response):
        """
        Returns a dictionary of {address: (lat, lng)} that correspond to the nearby addresses in this request
        """
        if response.status_code != 200:
            return None
        stew = response.text
        unparsed_section = re.findall(REGEX_COORD_ADDRESS, stew)
        coord_dict = {}
        for pair in unparsed_section:
            try:
                coord_dict[utils.format_punct(re.search(REGEX_ADDRESS, pair).group())
                           ] = ast.literal_eval(re.search(REGEX_LATLNG_4, pair).group())
            except AttributeError:
                continue

        return coord_dict

    def response_parse(self, response):
        return self.default_parser(response)

    def get_nearby(self, venue_type, lat, lng, zoom=17):
        url = self.build_request(venue_type, lat, lng, zoom)
        return self.request(
            url,
            quality_proxy=True,
            headers=HEADERS,
            timeout=5
        )

    def get_many_nearby(self, nearby_search_list):
        if isinstance(nearby_search_list[0], dict):
            queries = [
                self.build_request(
                    venue_type=term['venue_type'],
                    lat=term['lat'],
                    lng=term['lng'],
                    zoom=term['zoom'] if 'zoom' in term else 17
                ) for term in nearby_search_list
            ]
        else:
            queries = []
            for item in nearby_search_list:
                if len(item) == 4:
                    venue_type, lat, lng, zoom = item
                else:
                    venue_type, lat, lng = item
                    zoom = 17
                queries.append(self.build_request(venue_type, lat, lng, zoom))
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

    @ staticmethod
    def build_request(query):
        query = query.replace(" ", "+")
        url = 'https://www.google.com/maps/search/{}/'.format(query)
        return url

    @ staticmethod
    def default_parser(response):
        if response.status_code != 200:
            return None
        try:
            first_parse = re.findall(REGEX_LATLNG_1, response.text)
            match = re.findall(REGEX_LATLNG_2, first_parse[0])
            [goog_size_var, lng, lat] = ast.literal_eval(match[0])
            return lat, lng, goog_size_var
        except Exception:
            return None, None, None

    def response_parse(self, response):
        return self.default_parser(response)

    def get_lat_lng(self, query, include_sizevar=False, viewport=False):

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
            if viewport:
                if goog_size_var:
                    return lat, lng, get_viewport(lat, lng, goog_size_var)
                else:
                    return lat, lng, None
            else:
                return lat, lng
        except Exception as e:
            print("Error has occured in GeoCode: {} - request_url: {}".format(e, url))
            return None

    def get_many_lat_lng(self, query_list, include_sizevar=False, place_dict=False, viewport=False):
        if place_dict:
            if 'name' not in query_list[0] and 'address' not in query_list[0]:
                print('A Place consists of an address and a name. Please resubmit.')
                return None
        queries = [{
            'url': self.build_request(query) if not place_dict else self.build_request(
                query["name"] + " " + query["address"]
            ),
            'meta': query,
        } for query in query_list]

        result = self.async_request(
            queries,
            quality_proxy=True,
            timeout=5
        )

        if viewport:
            for data in result:
                if data['data']:
                    lat, lng, goog_size_var = data['data']
                    if goog_size_var:
                        data['data'] = lat, lng, get_viewport(lat, lng, goog_size_var)
                    else:
                        data['data'] = lat, lng, None
        elif not include_sizevar:
            for data in result:
                if data['data']:
                    data['data'] = data['data'][:2]

        return result


class GoogleDetails(GenericScraper):

    BASE_URL = 'https://www.google.com/search?hl=en&q={}&sourceid=chrome&ie=UTF-8'
    # BASE_URL = 'https://www.google.com/search?q={}&sourceid=chrome&ie=UTF-8'

    @ staticmethod
    def build_request(name, address):

        name = utils.encode_word(name)
        address = utils.encode_word(address)
        url = GoogleDetails.BASE_URL.format(name + '+near+' + address)
        print(url)
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

    @ staticmethod
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


class GoogleCompany(GenericScraper):

    BASE_URL = 'https://www.google.com/search?hl=en&q={}&sourceid=chrome&ie=UTF-8'

    @ staticmethod
    def build_request(name):

        name = utils.encode_word(name)
        url = GoogleCompany.BASE_URL.format(name)
        print(url)
        return url

    def get_details(self, name, projection=None):
        """

        Parameters:
            name: string
            projection: string - example: 'stock, headquarters, num_employees'

        Return:
            returns an object that contains the projected fields. If no fields
            are projected, will return the entire details:

            {
            "name": 'Yum! Brands',
            "category": 'Fast food company',
            "website": 'yum.com',
            "description": 'Yum! Brands, Inc., formerly Tricon Global Restaurants, Inc., is an American fast food corporation listed on the Fortune 1000. Yum! operates the brands KFC, Pizza Hut, Taco Bell, The Habit Burger Grill, and WingStreet worldwide, except in China, where the brands are operated by a separate company, Yum China.',
            "stock": ['YUM', '(NYSE)', '-1.08 (-1.19%)', 'May 29, 4:00 PM EDT - ', ''],
            "headquarters": 'Louisville, KY',
            "revenue": '5.597 billion USD (FY December 31, 2019)',
            "num_employees": '34,000 (FY December 31, 2019)',
            "parents": None
            "subsidiaries": ['KFC', 'Pizza Hut', 'Taco Bell', 'WingStreet', 'MORE'],
            "time_of_scrape": string - ex. '04-17-2020_20:39:36'
            }

        """

        url = self.build_request(name)
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
            print("Error has occured in GoogleCompany: {} - request_url: {}".format(e, url))
            return None

    @ staticmethod
    def default_parser(response):
        if response.status_code != 200:
            return None
        return google_company_parser(response)

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

class GoogleNewsScraper(GenericScraper):

    BASE_URL = "https://news.google.com/search?q={}"

    @staticmethod
    def build_request(query):

        query = query.replace(' ', '+')
        url = GoogleNewsScraper.BASE_URL.format(query)
        return url

    @staticmethod
    def default_parser(response):
        if response.status_code != 200:
            return None
        return google_news_parser(response)

    def response_parse(self, response):
        return self.default_parser(response)

    def get_news(self, query):

        url = self.build_request(query)
        try:
            result = self.request(
                url,
                headers=HEADERS,
                quality_proxy=True,
                timeout=5
            )
            return result
        except Exception as e:
            print("Error has occured in GoogleNews: {} - request_url: {}".format(e, url))
            return None

    def get_many_news(self, queries):
        queries = [{
            'url': self.build_request(query),
            'meta': query
        } for query in queries]
        results = self.async_request(
            queries,
            headers=HEADERS,
            quality_proxy=True,
            timeout=5
        )
        news = []
        for result in results:
            result['data'] and news.extend(result['data'])
        return news


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
        name = "Spitz little tokyo"
        address = "371 E 2nd st, los angeles"
        print(get_google_details(name, address))
        name = "Publix Super Market at Sugarloaf Crossing"
        address = "4850 Sugarloaf Pkwy, Lawrenceville, GA 30044"
        print(get_google_details(name, address))

    def get_nearby_test():
        venue_type = 'restaurants'
        lat = 33.840617
        lng = -84.3715611
        nearby = get_nearby(venue_type, lat, lng)
        print(nearby)
        print(len(nearby))

    def get_many_nearby_test():
        venue_type = 'restaurants'
        lat = 33.840617
        lng = -84.3715611
        nearby_list = [(venue_type, lat, lng) for x in range(10)]
        nearby = get_many_nearby(nearby_list)
        print(nearby)

    def get_lat_lng_test():
        name = "Souvla Hayes Valley SF"
        print(name, get_lat_lng(name, viewport=True))
        # print(name, "size var option", get_lat_lng(name, True))

    def get_many_lat_lng_test():
        # my_list = [item["name"] + " " + item["address"] for item in TEST_LIST]
        my_list = TEST_LIST
        goog_start = time.time()
        details = get_many_lat_lng(my_list, place_dict=True)
        goog_time = time.time()
        print(details)
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

    def get_news_test():
        news_query = "commercial real estate news"
        news = get_news(news_query)
        print(news)

    def get_many_news_test():
        news_queries = [
            "commercial real estate news",
            "real estate news",
            "awesome news",
            "hi news"
        ]
        my_queries = get_many_news(news_queries)
        print(my_queries)
        print(len(my_queries))

    # get_news_test()
    # get_many_news_test()
    # get_google_activity_test()
    # get_many_lat_lng_test()
    # get_lat_lng_test()
    # get_nearby_test()
    # get_many_nearby_test()
    get_google_details_test()
    # get_many_google_details_test()

    # url = 'https://www.google.com/maps/search/stores/@33.9559918,-118.5607461,17.39z'
    #
    # nearby_scrape = GoogleNearby('NEARBY')
    # import requests
    # response = requests.get(url, headers=HEADERS)
    # addresses = nearby_scrape.response_parse(response)
    # print("addresses", len(addresses), addresses)
    # address_latlng = nearby_scrape.parse_address_latlng(response)
    # print("addresses lat lng", len(address_latlng), address_latlng)
