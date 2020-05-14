from bs4 import BeautifulSoup
import requests
import datetime as dt
from pprint import pprint


def parse_stores_google(response):
    """
    Parses http request response from google web search of restaurant or store

    :param response: Response, an http get request response for a google web search of an establishment
    :return: {
        name: "Spitz - Little Tokyo"
        num_stars: 4.4
        num_reviews: 662
        price: "$$"
        type: "Restaurant"
        description: "Low-key joint serves doner kebabs, fries & Turkish street eats, plus full bar at this chain outpost."
        operations: {'dine_in': False, 'takeout': True, 'delivery': True}
        address: "371 E 2nd St, Los Angeles, CA 90012"
        current_hours: Closes 9PM (hours that it closes on the day that it was pulled)
        menu_link: "spitzrestaurant.com"
        phone: "(213) 613-0101"
        online_ordering_platforms: ["spitzrestaurant.com", "trycaviar.com", "doordash.com", "postmates.com"]
        events: None (not implemented)
        activity_times: [0,0,0,0,0,27,54,51,22,0,16,36,59,70,66,0,0,0] (represents the activity histogram of traffic,
                                                                typically ranging from 6am to midnight in 30min budgets)
        other_platform_ratings: None (not implemented)
        top_review_comments: ["Good fries and nice ambiance for drinks and food after long day at work", "Good rotating selection of draught beers, greekish type flavors in the menu.","Tasty Doner Kebab 😍 Check out happy hour sometime from 3-7 week days."]
        self_description: "Spitz = Healthy & flavorful wraps, döners, salads and our famous fries. As well as a full bar including craft beer & sangria + Board games, Happy Hour and Game Night. We also specialize in catering office lunches, priding ourselves on offering the..."
        time_of_scrape: '04-17-2020_20:39:36'
    }

    """
    soup = BeautifulSoup(response.content, "html.parser")

    try:
        name = soup.find('div', class_="SPZz6b").find_all("span")[0].text
    except Exception:
        name = None

    try:
        num_stars = float(soup.find("div", class_="Ob2kfd").text.split()[0])
    except Exception:
        num_stars = None

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
        activity_times = get_hours(soup)
    except Exception:
        activity_times = None

    try:
        top_review_comments = [item.text for item in
                               soup.find_all("div", class_="RQ0Hvc a1VOGd")]
    except Exception:
        top_review_comments = None

    try:
        self_description = soup.find("div", class_="BAyyse").text
    except Exception:
        self_description = None

    store = {
        "url": response.url,
        "name": name,
        "num_stars": num_stars,
        "num_reviews": num_reviews,
        "price": price,
        "type": type,
        "description": description,
        "operations": operations,
        "address": address,
        "current_hours": current_hours,
        "menu_link": menu_link,
        "phone": phone,
        "online_ordering_platforms": online_ordering_platforms,
        "events": None,
        "activity_times": activity_times,  # FIXME: may fail due to current time/attendance overlap.
        # TODO also could get better by scraping opening/closing times and dividng total timeframe by the buckets seen
        "other_platform_ratings": None,
        "top_review_comments": top_review_comments,  # TODO: only returns 2 comments
        "self_description": self_description,
        "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
    }

    return store


def get_hours(soup):
    h = []
    for item in soup.find("div", class_="yPHXsc").contents:
        try:
            h.append(int(item.attrs['style'].split(":")[1][:2]))
        except Exception:
            h.append(0)
    return h


def parse_stores_yelp(response):
    """
    Parses http request response from yelp search of restaurant or store

    :param response: Response, an http get request response for a yelp search of an establishment
    :return: {
        name: "Spitz - Little Tokyo"
        phone: "(213) 613-0101"
        address: "371 E 2nd St"
        Neighborhood: "Little Tokyo"
        num_reviews: 662
        num_stars: 4.4
        price: "$$"
        type: "Restaurant"
        description: "Low-key joint serves doner kebabs, fries & Turkish street eats, plus full bar at this chain outpost."
        time_of_scrape: '04-17-2020_20:39:36'
    }

    """
    soup = BeautifulSoup(response.content, "html.parser")

    try:
        results = soup.find_all("li", class_="lemon--li__373c0__1r9wz border-color--default__373c0__3-ifU")

        for topmatch_header_idx in range(len(results)):
            if results[topmatch_header_idx].text == 'Top match' or results[topmatch_header_idx].text == 'All Results':
                break
        result = results[topmatch_header_idx + 1]

        name = result.find(
            "a", class_="lemon--a__373c0__IEZFH link__373c0__1G70M link-color--inherit__373c0__3dzpk link-size--inherit__373c0__1VFlE").text
    except Exception:
        name = None
        return None

    try:
        phone = result.find(
            "p",
            class_="lemon--p__373c0__3Qnnj text__373c0__2Kxyz text-color--black-extra-light__373c0__2OyzO text-align--right__373c0__1f0KI text-size--small__373c0__3NVWO").text
    except Exception:
        phone = None

    try:
        address = result.find("span", class_="lemon--span__373c0__3997G raw__373c0__3rcx7").text
    except Exception:
        address = None

    try:
        neighborhood = result.find_all(
            "p",
            class_="lemon--p__373c0__3Qnnj text__373c0__2Kxyz text-color--black-extra-light__373c0__2OyzO text-align--right__373c0__1f0KI text-size--small__373c0__3NVWO")[2].text
    except Exception:
        neighborhood = None

    try:
        num_reviews = int(
            result.find(
                "span",
                class_="lemon--span__373c0__3997G text__373c0__2Kxyz reviewCount__373c0__2r4xT text-color--black-extra-light__373c0__2OyzO text-align--left__373c0__2XGa-").text)
    except Exception:
        num_reviews = None

    try:
        num_stars = result.find(
            "div",
            class_="lemon--div__373c0__1mboc i-stars__373c0__1T6rz i-stars--regular-4__373c0__2YrSK border-color--default__373c0__3-ifU overflow--hidden__373c0__2y4YK").attrs["aria-label"]
        # FIXME: doesn't get results that aren't 4 stars. Figure out how to scrape, or drop
    except Exception:
        num_stars = None

    try:
        price = result.find(
            "span",
            class_="lemon--span__373c0__3997G text__373c0__2Kxyz priceRange__373c0__2DY87 text-color--black-extra-light__373c0__2OyzO text-align--left__373c0__2XGa- text-bullet--after__373c0__3fS1Z").text
    except BaseException:
        price = None

    try:
        type = [item.text for item in result.find_all(
            "a", class_="lemon--a__373c0__IEZFH link__373c0__1G70M link-color--inherit__373c0__3dzpk link-size--default__373c0__7tls6")]
    except Exception:
        type = None

    try:
        description = result.find(
            "p", class_="lemon--p__373c0__3Qnnj text__373c0__2Kxyz text-color--black-extra-light__373c0__2OyzO text-align--left__373c0__2XGa-").text
    except Exception:
        description = None

    store = {
        "url": response.url,
        "name": name,
        "phone": phone,
        "address": address,
        "neighborhood": neighborhood,
        "num_reviews": num_reviews,
        "num_stars": num_stars,
        "price": price,
        "type": type,
        "description": description,
        "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
    }

    return store


if __name__ == "__main__":
    def parse_stores_google_test():
        URL = 'https://www.google.com/search?q=spitz+-+little+tokyo+371+e+2nd+st+los+angeles&sourceid=chrome&ie=UTF-8'
        #URL = "https://www.google.com/search?q=anna's+taqueria+mass+ave&sourceid=chrome&ie=UTF-8"
        #URL = "https://www.google.com/search?q=kouraku+314+E+2nd+St,+Los+Angeles,&sourceid=chrome&ie=UTF-8"
        USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"
        headers = {"user-agent": USER_AGENT}
        response = requests.get(URL, headers=headers)

        pprint(parse_stores_google(response))

    def parse_stores_yelp_test():
        URL = 'https://www.yelp.com/search?find_desc=spitz+-+little+tokyo&find_loc=371+e+2nd+st+los+angeles'
        #URL = 'https://www.yelp.com/search?find_desc=curry+house&find_loc=123+Astronaut+E+S+Onizuka+St+Los+Angeles,+CA'
        #URL = "https://www.yelp.com/search?find_desc=Anna's+Taqueria&find_loc=84+Massachusetts+Ave,+Cambridge,+MA"

        response = requests.get(URL)

        pprint(parse_stores_yelp(response))

    parse_stores_yelp_test()
