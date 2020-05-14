from bs4 import BeautifulSoup
import requests
import datetime as dt
import re
import ast
import matplotlib.pyplot as plt
from pprint import pprint

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"
HEADERS = {"user-agent": USER_AGENT, "referer": "https://www.google.com/"}
REGEX_18_HOURS = r'\[\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\]'
REGEX_24_HOURS = r'\[\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\,\d+\]'
GOOG_KEY = "AIzaSyCJjsXi3DbmlB1soI9kHzANRqVkiWj3P2U"

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
        #TODO: check that the results are of the format 'Booked x times today'
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

def get_lat_lng(name, address):
    # TODO: hide keys and save searches

    formatted_input = format_search(name, address)
    url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key={}&input={}&inputtype={}&fields=formatted_address,geometry'.format(GOOG_KEY, formatted_input, "textquery")
    resp = requests.get(url)
    lat = resp.json()['candidates'][0]['geometry']['location']['lat']
    lng = resp.json()['candidates'][0]['geometry']['location']['lng']
    return lat, lng

def today_formatted():
    return dt.datetime.now().strftime("%Y-%m-%d")

def format_search(name, address):
    return name.replace(" ", "+") + "+" + address.replace(" ", "+")

def get_one_int_from_str(text):
    return int(re.search(r'\d+', text).group())

def get_one_float_from_str(text):
    return float(re.search(r'\d+\.\d+', text).group())

def find_restaurant_details(name, address):
    # returns the opentable details for a restaurant search

    lat, lng = get_lat_lng(name, address)
    date = today_formatted()
    formatted_name = name.replace(" ", "+")
    url = 'https://www.opentable.com/s/?currentview=list&size=100&sort=PreSorted&term=' + formatted_name + '&source=dtp-form&covers=2&dateTime=' + date + '&latitude=' + str(lat) + '&longitude=' + str(lng)

    resp = requests.get(url, headers=HEADERS)
    return parse_opentable_result(resp)

def get_google_activity(name, address):
    # returns the google activity graph for a search of an establishment

    formatted_input = format_search(name, address)
    url = 'https://www.google.com/search?q='+formatted_input
    html_text = requests.get(url, headers=HEADERS).text
    #find the 18 or 24 hour activity distribution, depending on which is present
    data = [ast.literal_eval(item) for item in re.findall(REGEX_18_HOURS, html_text)]
    if len(data) == 0:
        data = [ast.literal_eval(item) for item in re.findall(REGEX_24_HOURS, html_text)]
    return data

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

    get_google_activity_test()
    #pprint(find_restaurant_details("The Capital Grille", "255 East Paces Ferry Rd NE, Atlanta, GA 30305, United States"))