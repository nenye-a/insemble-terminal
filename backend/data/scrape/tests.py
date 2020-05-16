import random
from scraper import GenericScraper


# GENERIC SCRAPER TEST SUITE

GOOGLE_TEST_URL1 = 'https://www.google.com/search?q=spitz+-+little+tokyo+371+e+2nd+st+los+angeles&sourceid=chrome&ie=UTF-8'
GOOGLE_TEST_URL2 = 'https://www.google.com/search?q=mickey’s+italian+delicatessen+&+liquor+store+101+hermosa+ave++hermosa+beach++ca+90254&sourceid=chrome&ie=UTF-8'
YELP_TEST_URL1 = 'https://www.yelp.com/search?find_desc=spitz+-+little+tokyo&find_loc=371+e+2nd+st+los+angeles'
YELP_TEST_URL2 = 'https://www.yelp.com/search?find_desc=umami+burger&find_loc=525+broadway++santa+monica++ca+90401'


class ScraperTests():

    @staticmethod
    def request_test():
        my_scraper = GenericScraper('Test Scraper 1')
        result = my_scraper.request(
            GOOGLE_TEST_URL1,
            quality_proxy=True,
            res_parser='headers'
        )
        print(result)

    @staticmethod
    def async_request_test():
        my_scraper = GenericScraper('Test Scraper 1')
        test_url_list = [GOOGLE_TEST_URL1 for x in range(10)]
        test1 = my_scraper.async_request(test_url_list, quality_proxy=True)
        print(test1, '\n')

    @staticmethod
    def test_meta():
        my_scraper = GenericScraper()
        result = my_scraper.request(
            GOOGLE_TEST_URL1,
            quality_proxy=True,
            res_parser='text',
            meta=100,
            meta_function=lambda res, meta: res[:meta]
        )
        print(result)

    @staticmethod
    def test_meta_async():
        my_scraper = GenericScraper()

        test_url_list = [{'url': GOOGLE_TEST_URL1, 'meta': random.choice([
            2, 10, 30, 10, 9, 89
        ])} for x in range(10)]
        results = my_scraper.async_request(
            test_url_list,
            quality_proxy=True,
            res_parser='text',
            meta_function=ScraperTests.func
        )
        print(results)

    @staticmethod
    def func(res, meta):
        return res[:meta]


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
    # ScraperTests.test_meta()
    ScraperTests.test_meta_async()
