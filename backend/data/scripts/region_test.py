import FindRestaurantDetails as FRD
import activity as ACT
import utils
import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
from scrape.scrapers import GenericScraper


def scrape_save_region(region, terms, num_results, batchsize=300):

    count_results = 0
    # generate viewport to search within
    scraper = GenericScraper('scrape_save_region scraper')

    # get lat, lng, and viewport of the region that's being queried
    lat, lng, goog_size_var = scraper.request(FRD.build_lat_lng_request(region), quality_proxy=True,
                                              res_parser=FRD.parse_lat_lng)
    viewport = FRD.get_viewport(lat, lng, goog_size_var)
    print("Got NW: {}, SE: {} for {} region".format(viewport[0], viewport[1], region))

    while count_results < num_results:
        print("Starting batch. {} results of {}.".format(count_results, num_results))
        # TODO: figure out how to get rid of duplicates

        # get batch of latlngs to run requests on
        coords = {FRD.get_random_latlng(viewport[0], viewport[1]) for i in range(max(1, int(batchsize / len(terms) / 20)))}
        print("Building URLS")

        # build the urls for each term in identified random coordinates
        urls = set()
        for term in terms:
            urls.update({FRD.build_nearby_request(term, r_lat, r_lng) for r_lat, r_lng in coords})
        print("Collected {} urls to search based on search terms".format(len(urls)))

        # do asynchronous request on batch for each term specified to get addresses
        name_addresses = scraper.async_request(list(urls), quality_proxy=True, headers={
                                               "referer": "https://www.google.com/"}, res_parser=FRD.parse_nearby)
        address_set = set()
        [address_set.update(group) for group in name_addresses]
        print("Gathered {} addresses for URLs".format(len(address_set)))

        print("Querying opentable")
        # use addresses to do further async requests to get opentable results
        opentable_url_to_name_address = {FRD.build_restaurant_details_request(
            name_address.split(",")[0], name_address.replace(name_address.split(",")[0] + ", ", "")): name_address
            for name_address in address_set}
        print("Built opentable URLs")
        opentable_results = scraper.async_request(list(opentable_url_to_name_address.keys()), quality_proxy=True,
                                                  headers={"referer": "https://www.google.com/"},
                                                  res_parser=FRD.parse_track_opentable)
        print("Queried opentable for {} addresses".format(len(opentable_results)))

        # use addresses to do further async requests to get google activity results
        print("Querying Google")
        goog_url_to_name_address = {FRD.build_google_activity_request(name_address, ''): name_address for name_address in address_set}
        activities = scraper.async_request(list(goog_url_to_name_address.keys()), quality_proxy=True,
                                           headers={"referer": "https://www.google.com/"}, res_parser=ACT.parse_track)
        print("Queried google activity for {} addresses".format(len(activities)))

        print("Organizing into savable results")

        # package results into useable json
        uploadable_result = {name_address: {"name_address": name_address,
                                            "google_activity": None, "opentable_results": None} for name_address in address_set}

        for goog_activity in activities:
            week_activity = goog_activity['week_activity']
            try:
                goog_name_address = goog_url_to_name_address[goog_activity['url']]
                uploadable_result[goog_name_address]["google_activity"] = week_activity
            except Exception:
                print("Could not find google url in name to address:", goog_activity['url'])

        for tbl_result in opentable_results:
            store_info = tbl_result['store_info']
            try:
                table_name_address = opentable_url_to_name_address[tbl_result['url']]
                uploadable_result[table_name_address]["opentable_results"] = store_info
            except Exception:
                print("Could not find opentable url in name to address:", tbl_result['url'])
        print("Packaged results")

        # add the batch results to mongo
        utils.DB_CITY_TEST.insert_many(list(uploadable_result.values()))
        count_results += len(uploadable_result)
        print("Uploaded to DB")


if __name__ == "__main__":
    def scrape_save_region_test():
        region = "Atlanta, GA"
        terms = ["restaurants", "stores"]
        num_results = 3000
        batchsize = 50
        scrape_save_region(region, terms, num_results, batchsize)

    scrape_save_region_test()
