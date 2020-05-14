from scrapers import GenericScraper, GoogleVenueScraper, YelpVenueScraper

# GENERIC SCRAPER TEST SUITE

GOOGLE_TEST_URL1 = 'https://www.google.com/search?q=spitz+-+little+tokyo+371+e+2nd+st+los+angeles&sourceid=chrome&ie=UTF-8'
GOOGLE_TEST_URL2 = 'https://www.google.com/search?q=mickey’s+italian+delicatessen+&+liquor+store+101+hermosa+ave++hermosa+beach++ca+90254&sourceid=chrome&ie=UTF-8'
YELP_TEST_URL1 = 'https://www.yelp.com/search?find_desc=spitz+-+little+tokyo&find_loc=371+e+2nd+st+los+angeles'
YELP_TEST_URL2 = 'https://www.yelp.com/search?find_desc=umami+burger&find_loc=525+broadway++santa+monica++ca+90401'


class ScraperTests():

    @staticmethod
    def request_test():
        my_scraper = GenericScraper('Test Scraper 1')
        result = my_scraper.request('https://43b36a02.ngrok.io/api/test', quality_proxy=True)
        print(result)

    @staticmethod
    def async_request_test():
        my_scraper = GenericScraper('Test Scraper 1')
        test_url_list = ['https://43b36a02.ngrok.io/api/test' for x in range(10)]
        test1 = my_scraper.async_request(test_url_list, quality_proxy=True)
        print(test1, '\n')

    @staticmethod
    def google_request_test():

        google_scraper = GoogleVenueScraper('GOOG SCRAPER')
        result = google_scraper.request(GOOGLE_TEST_URL1, quality_proxy=False)
        # result = google_scraper.request(GoogleVenueScraper.generate_url('Spitz - Little Tokyo', '371 E 2nd Street Los Angeles'))
        print(result)

    @staticmethod
    def google_async_request_test():
        num_requests = 80

        google_scraper = GoogleVenueScraper('GOOG SCRAPER')
        test_url_list = [GOOGLE_TEST_URL1 for x in range(num_requests)]
        test1 = google_scraper.async_request(test_url_list, quality_proxy=True)
        num_results = len(test1)
        print(test1[0], '\n')
        print(test1[-1], '\n')
        print('Total Results Received: {}/{}'.format(num_results, num_requests))

    @staticmethod
    def yelp_request_test():

        yelp_scraper = YelpVenueScraper('YELP SCRAPER')
        result = yelp_scraper.request(YELP_TEST_URL2)
        # result = yelp_scraper.request(YelpVenueScraper.generate_url('Spitz - Little Tokyo', '371 E 2nd Street los angeles'))
        print(result)

    @staticmethod
    def yelp_async_request_test():
        num_requests = 80

        yelp_scraper = YelpVenueScraper('YELP SCRAPER')
        test_url_list = [YELP_TEST_URL1 for x in range(num_requests)]
        test1 = yelp_scraper.async_request(test_url_list, quality_proxy=True)
        num_results = len(test1)
        print(test1[0], '\n')
        print(test1[-1], '\n')
        print('Total Results Received: {}/{}'.format(num_results, num_requests))


def doc_distance(str1, str2):
    """Quickly determine the document distance between two strings."""

    words1 = dictify(str1.split(' '))
    words2 = dictify(str2.split(' '))

    all_words = set(list(words1.keys()) + list(words2.keys()))

    distance = 0
    for word in all_words:
        distance += abs(words1.get(word, 0) - words2.get(word, 0))

    return distance


def dictify(list_words):
    """Turn a list of words into a dictionary of each words to the number of occurances."""
    my_dict = {}
    for word in list_words:
        my_dict[word] = my_dict.get(word, 0) + 1

    return my_dict

# TEST


if __name__ == "__main__":

    # ScraperTests.request_test()
    # ScraperTests.async_request_test()
    ScraperTests.google_request_test()
    # ScraperTests.google_async_request_test()
    # ScraperTests.async_request_test()
    # ScraperTests.yelp_request_test()
    # ScraperTests.yelp_async_request_test()
