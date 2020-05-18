from bs4 import BeautifulSoup
import datetime as dt
import ast
import re
import utils

REGEX_18_HOURS = r'\[(?:\d+\,){17}\d+\]'
REGEX_24_HOURS = r'\[(?:\d+\,){23}\d+\]'


def google_detail_parser(response):
    """
    Parses http request response from google web search of restaurant or store.

    return: {
        name: "Spitz - Little Tokyo"
        num_stars: 4.4
        num_reviews: 662
        price: "$$"
        type: "Restaurant"
        description: "Low-key joint serves doner kebabs, fries & Turkish street
                        eats, plus full bar at this chain outpost."
        operations: {'dine_in': "No dine_in", 'takeout': "Takeout", 'delivery': "No delivery"}
        address: "371 E 2nd St, Los Angeles, CA 90012"
        current_hours: Closes 9PM (hours that it closes on the day that it was pulled)
        menu_link: "spitzrestaurant.com"
        phone: "(213) 613-0101"
        online_ordering_platforms: ["spitzrestaurant.com", "trycaviar.com",
                                    "doordash.com", "postmates.com"]
        events: None (not implemented)
        other_platform_ratings: None (not implemented)
        top_review_comments: ["Good fries and nice ambiance for drinks and food after long day at work",
                                "Good rotating selection of draught beers, greekish type flavors in the menu."]
        self_description: "Spitz = Healthy & flavorful wraps, döners, salads and our famous fries..."
        time_of_scrape: '04-17-2020_20:39:36'
    }

    """

    soup = BeautifulSoup(response.content, "html.parser")

    try:
        name = soup.find('div', class_="SPZz6b").find_all("span")[0].text
    except Exception:
        name = None

    try:
        rating = float(soup.find("div", class_="Ob2kfd").text.split()[0])
    except Exception:
        rating = None

    try:
        num_reviews = int(soup.find("div", class_="Ob2kfd").find("a").text.split()[0])
    except Exception:
        num_reviews = None

    try:
        price = soup.find("span", class_="YhemCb").text
    except BaseException:
        price = None

    try:
        type = soup.find_all("span", class_="YhemCb")[1].text
    except Exception:
        type = None

    try:
        description = soup.find("span", class_="ggV7z").text
    except Exception:
        description = None

    try:
        operations_options = soup.find_all("li", class_="asD7Oe")
        operations = {"dine_in": operations_options[0].attrs["aria-label"],
                      "takeout": operations_options[1].attrs["aria-label"],
                      "delivery": operations_options[2].attrs["aria-label"]}
    except Exception:
        operations = None

    try:
        address = soup.find("span", class_="LrzXr").text
    except Exception:
        address = None

    try:
        current_hours = soup.find("span", class_="TLou0b").text
    except Exception:
        current_hours = None

    try:
        menu_link = soup.find_all("div", class_="zloOqf")[4].find("a", class_="fl").attrs["href"]
    except Exception:
        menu_link = None

    try:
        phone = soup.find("span", class_="zgWrF").text
    except Exception:
        phone = None

    try:
        online_ordering_platforms = [item.text for item in soup.find_all("div", class_="zloOqf")[5].find_all("a")]
    except Exception:
        online_ordering_platforms = None

    try:
        top_review_comments = [item.text for item in
                               soup.find_all("div", class_="RQ0Hvc a1VOGd")]
    except Exception:
        top_review_comments = None

    try:
        self_description = soup.find("div", class_="BAyyse").text
    except Exception:
        self_description = None

    try:
        html_text = response.text
        # find the 18 or 24 hour activity distribution,depending on which is present
        data = [ast.literal_eval(item) for item in re.findall(REGEX_18_HOURS, html_text)]
        if len(data) == 0:
            data = [ast.literal_eval(item) for item in re.findall(REGEX_24_HOURS, html_text)]
        activity = data
    except Exception:
        activity = None

    store = {
        "url": response.url,
        "name": name,
        "rating": rating,
        "num_reviews": num_reviews,
        "price": price,
        "type": type,
        "description": description,
        "activity": activity,
        "operations": operations,
        "address": address,
        "current_hours": current_hours,
        "menu_link": menu_link,
        "phone": phone,
        "online_ordering_platforms": online_ordering_platforms,
        "events": None,
        "other_platform_ratings": None,
        "top_review_comments": top_review_comments,  # TODO: only returns 2 comments
        "self_description": self_description,
        "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
    }

    return store


def opentable_parser(response):
    """
    Parse open table result, formally known as
    (formally known as parse_opentable_result)

    Parameter:
        response: Response, an http get request response
                        for a opentable search of an establishment
    Return
        store = {
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
    if response.status_code != 200:
        return None

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
        "rating": utils.get_one_float_from_str(rating),
        "review_link": review_link,
        "num_reviews": utils.get_one_int_from_str(num_reviews),
        "price_tier": price_tier,
        "category": category,
        "neighborhood": neighborhood,
        "dist_from_query": dist_from_query,
        "bookings": utils.get_one_int_from_str(bookings),
        "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
    }

    return store
