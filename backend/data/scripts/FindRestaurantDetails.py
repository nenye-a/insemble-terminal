from bs4 import BeautifulSoup
import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
from scrape.scraper import GenericScraper
import requests
import datetime as dt
import re
import ast
import random
import time
import matplotlib.pyplot as plt
from pprint import pprint

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"
HEADERS = {"user-agent": USER_AGENT, "referer": "https://www.google.com/"}
REGEX_18_HOURS = r'\[(?:\d+\,){17}\d+\]'
REGEX_24_HOURS = r'\[(?:\d+\,){23}\d+\]'
REGEX_ADDRESS = r'[\\\\+\w+\'?\s+]+\,[\\+\w+\'?\s+]+\,[\w+\s+]+\,[\w+\s+]+\, United States'
REGEX_LATLNG_1 = r'APP_INITIALIZATION_STATE\=\[\[\[\d+\.\d+\,\-?\d+\.\d+\,\-?\d+\.\d+\]'
REGEX_LATLNG_2 = r'\[\d+\.\d+\,\-?\d+\.\d+\,\-?\d+\.\d+\]'
AMPERSAND = '\\\\u0026'
GOOG_KEY = "your google api key"
LAT_VIEWPORT_MULTIPLIER = 0.000000509499922
LNG_VIEWPORT_MULTIPLIER = 0.00000072025608


def get_google_activity(name, address):
    # returns the google activity graph for a search of an establishment
    url = build_google_activity_request(name, address)
    return parse_google_activity(requests.get(url, headers=HEADERS))


def build_google_activity_request(name, address):
    # builds the google activity request params

    formatted_input = format_search(name, address)
    url = 'https://www.google.com/search?q=' + formatted_input
    return url


def parse_google_activity(response):
    # returns the google activity graph for a search of an establishment, based on google maps response

    html_text = response.text
    # find the 18 or 24 hour activity distribution, depending on which is present
    data = [ast.literal_eval(item) for item in re.findall(REGEX_18_HOURS, html_text)]
    if len(data) == 0:
        data = [ast.literal_eval(item) for item in re.findall(REGEX_24_HOURS, html_text)]
    return data


def get_nearby(venue_type, lat, lng):
    # returns a set of nearby venue addresses
    url, headers = build_nearby_request(venue_type, lat, lng)
    return parse_nearby(requests.get(url, headers=headers))


def build_nearby_request(venue_type, lat, lng, zoom=17):
    # returns params for which to scrape nearby
    venue_type = venue_type.replace(" ", "+")
    url = 'https://www.google.com/maps/search/{}/@{},{},{}z'.format(venue_type, lat, lng, zoom)
    return url, HEADERS


def parse_nearby(response):
    # returns a set of nearby venue addresses, based on google maps nearby search response\
    return {item.replace(AMPERSAND, "&") for item in set(re.findall(REGEX_ADDRESS, response.text))}


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
    lat, lng, goog_size_var = scraper.request(build_lat_lng_request(region), quality_proxy=True, res_parser=parse_lat_lng)
    viewport = get_viewport(lat, lng, goog_size_var)

    # choose random points in the viewport to run nearby requests on until reaching the desired number of results
    while len(results) < num_results:
        # choose random coordinates in viewport
        r_lat, r_lng = get_random_latlng(viewport[0], viewport[1])
        for term in search_terms:
            # TODO: scrape asynchronously
            results.update(scraper.request(build_nearby_request(term, r_lat, r_lng), quality_proxy=True,
                                           res_parser=parse_nearby))
            #results.update(get_nearby(term, r_lat, r_lng))
            if len(results) > num_results:
                return results
            print("queried {} results".format(len(results)))
    return results


def find_restaurant_details(name, address):
    # returns the opentable details for a restaurant search
    url = build_restaurant_details_request(name, address)
    resp = requests.get(url, headers=HEADERS)
    return parse_opentable_result(resp)


def build_restaurant_details_request(name, address):
    lat, lng = get_lat_lng(format_search(name, address))
    date = today_formatted()
    formatted_name = name.replace(" ", "+")
    return 'https://www.opentable.com/s/?currentview=list&size=100&sort=PreSorted&term=' + formatted_name + \
        '&source=dtp-form&covers=2&dateTime=' + date + '&latitude=' + str(lat) + '&longitude=' + str(lng)


def parse_opentable_result(response):
    """
    Parses http request response from opentable search of restaurant or store

    :param response: Response, an http get request response for a opentable search of an establishment
    :return: store = {
        "name": str name,
        "link": str link,
        "rating": float rating,
        "review_link": str review_link,
        "num_reviews": int num_reviews,
        "price_tier": str price_tier,
        "category": str category,
        "neighborhood": str neighborhood,
        "dist_from_query": str dist_from_query,
        "bookings": int bookings,
        "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
    }

    """
    soup = BeautifulSoup(response.content, "html.parser")

    try:
        top_result = soup.find_all('li', class_="result content-section-list-row cf with-times")[0]
    except Exception:
        print("Could not find restaurant on opentable")
        return None

    try:
        name = top_result.find('div', class_="rest-row-header-container").find("span", class_="rest-row-name-text").text
    except Exception:
        name = None

    try:
        link = top_result.find('div', class_="rest-row-header-container").find("a").attrs['href']
    except Exception:
        link = None

    try:
        # TODO: check that ratings are always out of 5 stars
        rating = top_result.find('div', class_="star-rating-score").attrs['aria-label']
    except Exception:
        rating = None

    try:
        review_link = top_result.find('a', class_="review-link").attrs['href']
    except Exception:
        review_link = None

    try:
        num_reviews = top_result.find('a', class_="review-link").find('span', class_="underline-hover").text
    except Exception:
        num_reviews = None

    try:
        price_tier = top_result.find('i', class_="pricing--the-price").text.replace(" ", "")
    except Exception:
        price_tier = None

    try:
        category = top_result.find('span', class_="rest-row-meta--cuisine rest-row-meta-text sfx1388addContent").text
    except Exception:
        category = None

    try:
        neighborhood = top_result.find_all('span', class_="rest-row-meta--location rest-row-meta-text sfx1388addContent")[0].text
    except Exception:
        neighborhood = None

    try:
        dist_from_query = top_result.find_all('span', class_="rest-row-meta--location rest-row-meta-text sfx1388addContent")[1].text
    except Exception:
        dist_from_query = None

    try:
        # TODO: check that the results are of the format 'Booked x times today'
        bookings = top_result.find('div', class_="booking").text
    except Exception:
        bookings = None

    store = {
        "name": name,
        "link": link,
        "rating": get_one_float_from_str(rating),
        "review_link": review_link,
        "num_reviews": get_one_int_from_str(num_reviews),
        "price_tier": price_tier,
        "category": category,
        "neighborhood": neighborhood,
        "dist_from_query": dist_from_query,
        "bookings": get_one_int_from_str(bookings),
        "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
    }

    return store

#### Util type functions ####


def today_formatted():
    return dt.datetime.now().strftime("%Y-%m-%d")


def format_search(name, address):
    return name.replace(" ", "+") + "+" + address.replace(" ", "+")


def get_one_int_from_str(text):
    return int(re.search(r'\d+', text).group())


def get_one_float_from_str(text):
    return float(re.search(r'\d+\.\d+', text).group())


def get_viewport(lat, lng, goog_size_var):
    # gets the viewport of a particular region given lat, lng, and size_var
    # goog_size_var is the variable that google adds to the initialization state when loading google maps for a particular region
    nw = (lat + goog_size_var * LAT_VIEWPORT_MULTIPLIER, lng - goog_size_var * LNG_VIEWPORT_MULTIPLIER)
    se = (lat - goog_size_var * LAT_VIEWPORT_MULTIPLIER, lng + goog_size_var * LNG_VIEWPORT_MULTIPLIER)
    return nw, se


def build_lat_lng_request(query):
    query = query.replace(" ", "+")
    url = 'https://www.google.com/maps/search/{}/'.format(query)
    return url


def parse_lat_lng(response):
    # gets the lat, lng, and the google size variable from a request to google maps for a particular place
    first_parse = re.findall(REGEX_LATLNG_1, response.text)
    match = re.findall(REGEX_LATLNG_2, first_parse[0])
    [goog_size_var, lng, lat] = ast.literal_eval(match[0])
    return lat, lng, goog_size_var


def get_lat_lng(query, include_sizevar=False):
    lat, lng, goog_size_var = parse_lat_lng(requests.get(build_lat_lng_request(query), headers=HEADERS))
    if include_sizevar:
        return lat, lng, goog_size_var
    else:
        return lat, lng


def get_random_latlng(nw, se):
    # nw: (33.84052626832547, -84.38138020826983) se: (33.83714933167453, -84.37660639173015)
    lat = se[0] + random.random() * (nw[0] - se[0])
    lng = se[1] - random.random() * (se[1] - nw[1])
    return lat, lng


if __name__ == "__main__":
    def parse_opentable_result_test():
        URL = 'https://www.opentable.com/s/?currentview=list&size=100&sort=PreSorted&term=Pasha+Restaurant+and+Bar&source=dtp-form&covers=2&dateTime=2020-05-07&latitude=33.828395&longitude=-84.365395'
        USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"
        headers = {"user-agent": USER_AGENT}
        response = requests.get(URL, headers=headers)

        pprint(parse_opentable_result(response))

    def get_google_activity_test():
        name = "Atlanta Breakfast Club"
        address = "249 Ivan Allen Jr Blvd NW, Atlanta, GA 30313, United States"
        data = get_google_activity(name, address)
        print(data)
        fig, sbts = plt.subplots(len(data))
        for i in range(len(sbts)):
            sbts[i].bar(range(len(data[i])), data[i])
        plt.show()

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
        nw, se = get_viewport(lat, lng, goog_size_var)
        print(name, lat, lng, "nw:", nw, "se:", se)

    def get_random_latlng_test():
        nw = (33.84052626832547, -84.38138020826983)
        se = (33.83714933167453, -84.37660639173015)
        lat, lng = get_random_latlng(nw, se)
        print("Lat", lat, se[0] <= lat <= nw[0])
        print("Lng", lng, nw[1] <= lng <= se[1])

    def query_region_random_test():
        region = "Culver City, CA"
        terms = ["stores", "restaurants"]
        num_results = 10
        print(query_region_random(region, terms, num_results))

    def find_restaurant_details_test():
        name = 'Le Colonial - Houston'
        address = '4444 Westheimer Rd, Houston, TX 77027, United States'
        print(find_restaurant_details(name, address))

    find_restaurant_details_test()
    #pprint(find_restaurant_details("The Capital Grille", "255 East Paces Ferry Rd NE, Atlanta, GA 30305, United States"))
