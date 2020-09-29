import sys
import os
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.extend([THIS_DIR, BASE_DIR])

import re
import time
import json
import datetime as dt
import pandas as pd
import dateutil.parser as tparser
import pytz
from billiard.pool import Pool
from functools import partial
from decouple import config

import utils
import mongo
from postgres import PostConnect
from graphql import gql
from fuzzywuzzy import process
from rss import feeds
from google import GoogleNewsScraper
from newsemailer import email_report


'''
Generates file of content the be delivered to users via email.
'''

NEWS_TERMS = ["retail news", "commercial real estate news", "closings", "openings"]
LINK_HOST = config('API_URI') + 'news/'
STORE_PATH = THIS_DIR + '/storage/'  # store will always be in this directory
SOURCES_PATH = THIS_DIR + '/sources/'  # search here first for sources
if not os.path.exists(STORE_PATH):
    os.mkdir(STORE_PATH)


class NewsManager():

    try:
        FILE_MAP = pd.read_csv(STORE_PATH + "map.csv").set_index('name')
    except FileNotFoundError:
        pd.DataFrame(columns=['name', 'path']).set_index('name').to_csv(STORE_PATH + "map.csv")
        FILE_MAP = pd.read_csv(STORE_PATH + "map.csv").set_index('name')

    DEFAULT_SCORER = {
        'Assault': -6,
        'business': 6,
        'close': 3.5,
        'closed': 3,
        'closing': 3,
        'closure': 3,
        'commercial': 4.5,
        'economy': 4.5,
        'estate': 6,
        'furlough': 4.5,
        'layoff': 4.5,
        'market': 3.3,
        'open': 3.5,
        'opened': 3,
        'opening': 3,
        'rapist': -30,              # to make things like Harvey weinsteins case a lot weaker
        'real': 3.5,
        'retail': 5.5,
        'sex': -30,
        'shut': 3,
        'shuttered': 3,
        'shut down': 3,
        'stock': 3,
        'unemployment': 4.2
    }

    def __init__(self, name, source_path=None, scorer=None,
                 regional_news=True, national_news=True):
        """
        Class will collect, store, and manage different runs to collect news content from source path.

        Parameters:
            name: string - name of the content generator. Will be used to find the status of a previous
                           run, or to associate all the files of this run. Please make descriptive and
                           record the time of which you wish to submit the report.
            source_path: string - path to the original source of this run. Consumed and discarded after
                                  first use. Do not provide if using a run with an existing name.
        """

        self.name = name
        self.unsubscribed = utils.DB_UNSUBSCRIBED.find_one(
            {'name': 'unsubscribed'})['unsubscribed']

        # determine generator path & source based on parameters
        if source_path:
            if name in self.FILE_MAP.index:
                raise FileExistsError('Generator with name: {} already exists. '
                                      'Rename generator or remove source_path'.format(self.name))

            date_list = dt.datetime.utcnow().replace(microsecond=0).ctime().split(' ')
            date = "{month}-{day}-{year}".format(
                month=date_list[1], day=date_list[2], year=date_list[-1]
            )
            self.path = self.name + '-' + date
            self.collection = self._get_news_collection(self.path)

            try:
                self.source = pd.read_csv(SOURCES_PATH + source_path)
            except FileNotFoundError:
                self.source = pd.read_csv(source_path)

            self.source = self._format_source(self.source)
            self._create_collection()
            self.add_to_map(self.name, self.path)  # only add after everything is complete
        else:
            if name not in self.FILE_MAP.index:
                raise FileNotFoundError('Generator with name: {} does not exist. '
                                        'Correct name or provide a source_path'.format(self.name))
            self.path = self.FILE_MAP.loc[self.name]['path']
            self.collection = self._get_news_collection(self.path)

        self.national_news = feeds.get_national_news() if national_news else None
        self.regional_news = regional_news

    def generate(self, batch_size=30):
        """
        Generate new news content from source list. Assumes source list has the following columnts:
        "City" (containing the city inforamtion) & content_generated (determining whether we have content or not)
        """

        while True:

            cities = list(self.collection.aggregate([
                {'$match': {
                    'content_generated': False
                }},
                {'$group': {
                    '_id': '$city',
                    'count': {'$sum': 1}
                }},
                {'$project': {
                    'city': '$_id',
                    '_id': 0
                }},
                {'$sample': {
                    'size': batch_size
                }}
            ]))

            if len(cities) == 0:
                print("Completed generating news.")
                return

            locations = [parse_city(city['city']) for city in cities]

            organized_news = self.get_many_news(locations)
            print(organized_news)

            for city, news in organized_news.items():
                city_update = self.collection.update_one({
                    'name': city,
                    'data_type': 'city',
                }, {
                    '$set': {
                        'news': news
                    },
                    '$setOnInsert': {
                        'name': city,
                        'data_type': 'city',
                    }
                }, upsert=True)
                print('{} updated with content. {} modified.'.format(
                    city, city_update.modified_count))

                people_update = self.collection.update_many({
                    'city': {'$regex': r'^' + city},
                    'data_type': 'contact'
                }, {
                    '$set': {
                        'content_generated': True,
                        'parsed_city': city
                    }
                })
                print('{} person/people updated with content.'.format(people_update.modified_count))

    def convert_links(self, old_link=False):

        app_db = PostConnect()

        query = {'data_type': 'city'}
        if not old_link:
            query.update({'links_processed': {'$exists': False}})
        cities = self.collection.find(query)

        for city in cities:
            if not city['news']:
                continue

            search_details = gql.search(
                review_tag='NEWS',
                location_tag={
                    'type': 'CITY',
                    'params': city['name'] + ', USA'
                }
            )
            new_news = []
            # Remove unsavory news.
            for article in city['news']:
                if 'costar.com' in article['link']:
                    continue
                new_news.append(article)
            city['news'] = new_news

            location_tag_id = search_details['locationTag']['id']
            if old_link:
                for article in city['news']:
                    article['link'] = article['old_link']
            news_data = json.dumps(city['news'], default=date_converter)
            values = []
            for article in city['news']:
                now = dt.datetime.utcnow()
                values.append({
                    'locationTag': location_tag_id,
                    'createdAt': now,
                    'updatedAt': now,
                    'firstArticle': json.dumps({
                        'title': article['title'],
                        'source': article['source'],
                        'published': tparser.parse(article['published']).isoformat()
                        if isinstance(article['published'], str)
                        else article['published'].isoformat(),
                        'link': article['link']
                    }),
                    'data': news_data
                })
            ids = app_db.insert_many('OpenNews', values)
            for index, _id in enumerate(ids):
                city['news'][index]['old_link'] = city['news'][index]['link']
                city['news'][index]['link'] = LINK_HOST + _id

            self.collection.update_one({
                '_id': city['_id'],
            }, {
                '$set': {
                    'news': city['news'],
                    'links_processed': True
                }
            })

            print('Links for {} ({}) have been converted.'.format(city['name'], city['_id']))

    def email(self, enforce_conversion=True, update=None):
        """
        Emails all the subscribed folks in the list with generated emails.
        """

        people = self.collection.find({
            'content_generated': True,
            'content_emailed': False,
            'email': {'$nin': self.unsubscribed}
        })

        for person in people:
            query = {'name': person['parsed_city'], 'data_type': 'city'}
            if enforce_conversion:
                query.update({'links_processed': True})
            content = self.collection.find_one(query)
            if not content or not content['news']:
                print("No content available for {}. Moving on.".format(
                    person['email'] + str(person['_id'])
                ))
                continue

            news_list = []
            for news in content['news']:
                temp_timezone = pytz.UTC.localize(
                    news['published']).astimezone(pytz.timezone("America/Los_Angeles"))
                news['published'] = temp_timezone.strftime("%a %b %d") + " (PT)"
                news['title'] = utils.format_punct(news['title'])
                news['description'] = utils.format_punct(news['description'])
                if not news['title'] or not news['description']:
                    continue
                news_list.append(news)

            email = person['email']
            email_report(
                to_email=email,
                header_text="{} News Report".format(
                    person['parsed_city']
                ),
                linear_entries=news_list[:3],
                grid_entries=news_list[3:7],
                update=update
            )
            self.collection.update_one({
                '_id': person['_id']
            }, {
                '$set': {
                    'content_emailed': True
                }
            })

            print("{}: News emailed to {}".format(self.name, email))

    def email_async(self, enforce_conversion=True, update=None):
        """
        Emails all the subscribed folks in the list with generated emails.
        """

        while True:

            people = list(self.collection.find({
                'content_generated': True,
                'content_emailed': False,
                'email': {'$nin': self.unsubscribed}
            }).limit(10))

            if not people:
                print("All emails completed!")
                break

            pool_exists = False

            try:
                email_pool, pool_exists = Pool(min(15, len(people))), True
                updated_people = email_pool.map(partial(
                    self.push_email,
                    enforce_conversion=enforce_conversion,
                    update=update
                ), people)
            except KeyError as key_e:
                print(f'Key Error: {key_e}')
                updated_people = []
            except Exception as e:
                print(f'Observed: \n{type(e)}: {e}')
                updated_people = []
            finally:
                if pool_exists:
                    email_pool.close()
                    email_pool.terminate()

            modified_count = 0
            for person in updated_people:
                modified_count += self.collection.update_one({
                    '_id': person['_id']
                }, {'$set': person}).modified_count
                print('Emailed {}({}) with a report!'.format(person['email'], person['_id']))
            print(f'\n{modified_count} contacts updated!\n')

            for person in people:

                self.collection.update_one({
                    '_id': person['_id']
                }, {
                    '$set': {
                        'content_emailed': True
                    }
                })

                print("{}: News emailed to {}".format(self.name, person['email']))

            print('Pausing for 5 seconds to allow for stopping of emails.')
            time.sleep(5)

    def push_email(self, person, enforce_conversion, update):

        query = {'name': person['parsed_city'], 'data_type': 'city'}
        if enforce_conversion:
            query.update({'links_processed': True})
        content = self.collection.find_one(query)
        if not content or not content['news']:
            print("No content available for {}. Moving on.".format(
                person['email'] + str(person['_id'])
            ))
            return None

        news_list = []
        for news in content['news']:
            temp_timezone = pytz.UTC.localize(
                news['published']).astimezone(pytz.timezone("America/Los_Angeles"))
            news['published'] = temp_timezone.strftime("%a %b %d") + " (PT)"
            news['title'] = utils.format_punct(news['title'])
            news['description'] = utils.format_punct(news['description'])
            if not news['title'] or not news['description']:
                continue
            news_list.append(news)

        email = person['email']
        email_report(
            to_email=email,
            header_text="{} News Report".format(
                person['parsed_city']
            ),
            linear_entries=news_list[:3],
            grid_entries=news_list[3:7],
            update=update
        )
        return True

    def get_many_news(self, locations):

        news_scraper = GoogleNewsScraper(self.name)

        location_queries = [[{
            'url': news_scraper.build_request('{city} {state} {term}'.format(
                city=location['city'],
                state=location['state'],
                term=term
            )),
            'meta': dict(location, **{
                'tag': '{city}, {state}'.format(
                    city=location['city'],
                    state=location['state']
                )
            })
        } for term in NEWS_TERMS] for location in locations if location]

        results = news_scraper.async_request(
            utils.flatten(location_queries),
            headers={"referer": "https://www.google.com/"},
            quality_proxy=True,
            timeout=10
        )

        if not results:
            results = []

        print('Got Google News')

        organized_news = {}
        for result in results:
            data, meta = result['data'], result['meta']
            if data:
                if meta['tag'] not in organized_news:
                    organized_news[meta['tag']] = [meta, []]
                organized_news[meta['tag']][1] += data

        regional_news = None
        try:
            my_pool = Pool(min(len(locations), 20))
            print('Getting Regional Relevance...')
            if self.regional_news:
                regional_news = utils.flatten(my_pool.map(
                    NewsManager.relevant_regional_news, locations))
            print('Getting National Relevance...')
            if self.national_news:
                national_news = utils.flatten(my_pool.map(
                    NewsManager.relevant_national_news, locations))
            print('Getting Google Relevance...')
            google_news = utils.flatten(my_pool.map(
                NewsManager.relevant_google_news, organized_news.items()))
            print('Relevance completed...')
        except Exception as e:
            print(e)
        finally:
            try:
                my_pool.close()
                my_pool.terminate()
            except Exception:
                pass

        final_news = {}
        for key in set(list(google_news.keys()) +
                       list(regional_news.keys() if self.regional_news else []) +
                       list(national_news.keys() if self.national_news else [])):
            final_news[key] = NewsManager.most_relevant(
                regional_news.get(key, []) if self.regional_news else [],
                national_news.get(key, []) if self.national_news else [],
                google_news.get(key, [])
            )

        return final_news

    @staticmethod
    def relevant_regional_news(location):
        try:
            news = feeds.get_news(location['zipcode'], scope='regional')
            return {'{city}, {state}'.format(
                city=location['city'],
                state=location['state']
            ): NewsManager.add_news_relevance(news, location)}
        except Exception as e:
            print(e)
            return {}

    @staticmethod
    def relevant_national_news(location):
        try:
            news = NewsManager.self.national_news.copy()
            return {'{city}, {state}'.format(
                city=location['city'],
                state=location['state']
            ): NewsManager.add_news_relevance(news, location)}
        except Exception:
            return {}

    @staticmethod
    def relevant_google_news(location_result):
        try:
            tag, (location, news) = location_result
            return {tag: NewsManager.add_news_relevance(news, location)}
        except Exception:
            return {}

    @staticmethod
    def most_relevant(*news_lists):
        """
        Provided one or more lists of news with titles and relevance, will return the 10 most relevant
        news sources among them.
        """
        existing_titles = set()
        most_relevant_news = []
        for news_list in news_lists:
            for news in news_list:
                if news['title'] and news['title'] not in existing_titles:
                    most_relevant_news.append(news)
                    existing_titles.add(news['title'])

        return sorted(most_relevant_news, key=lambda news: news['relevance'], reverse=True)[:30]

    @staticmethod
    def add_news_relevance(news_list, location, multiplier=1):
        pruned_news = utils.remove_old_items(
            news_list,
            time_key='published',
            date=dt.datetime.utcnow() - dt.timedelta(weeks=1)
        )
        for news in pruned_news:
            if news['title']:
                if news['description']:
                    text = news['title'] + " " + news["description"]
                else:
                    text = news['title']
                news_relevance = NewsManager.determine_relevance(text, location)
                news['relevance'] = news_relevance * multiplier
            else:
                news['relevance'] = 0
        # return sorted list of news with relevance
        return sorted(pruned_news, key=lambda news: news['relevance'], reverse=True)

    @staticmethod
    def determine_relevance(text, location):
        """Determine relevance of an article for a user"""
        # get the scorer for word relevance
        location_scorer = {
            str(location['zipcode']): 7,
            location['city']: 6,
            utils.state_code_to_name(location['state']): 2
        }
        this_scorer = NewsManager.DEFAULT_SCORER.copy()
        this_scorer.update(location_scorer)

        text_words = [word.strip(' ()}{-~.') for word in text.split(' ')][:70]
        # # weight word so lengthy articles aren't over weighted - commented out since
        # # just limited the number of words observed
        # number_words = len(text_words)
        # weight_word = lambda word: max(word * 100 / (100 + number_words), word * 0.6)
        weight_word = lambda word: word  # dummy in case we decide to structure weights

        relevance_score = 0
        for word in this_scorer.keys():
            matching_words = process.extractWithoutOrder(word, text_words, score_cutoff=70)
            for matching_word in matching_words:
                # add to relevance
                if len(matching_word[0]) < 3:
                    # remove potential filler matches
                    continue
                relevance_score = relevance_score + \
                    float(weight_word(matching_word[1])) / 10 * this_scorer[word]

        return round(relevance_score, 1)

    @staticmethod
    def add_to_map(name, path_id):
        NewsManager.FILE_MAP.loc[name] = path_id
        NewsManager._update_map()

    @staticmethod
    def _update_map():
        NewsManager.FILE_MAP.to_csv(STORE_PATH + 'map.csv')

    def _format_source(self, update_source):
        email_index = 'email'
        city_index = 'city'

        current_email_index = process.extractOne('email', update_source.columns)[0]
        current_city_index = process.extractOne('city', update_source.columns)[0]

        update_source.rename(columns={current_email_index: email_index,
                                      current_city_index: city_index},
                             inplace=True)

        update_source.drop_duplicates(email_index, keep='first', inplace=True)
        update_source = update_source[update_source[email_index].notna()]
        update_source = update_source[update_source[city_index].notna()]

        update_source.loc[:, email_index] = update_source.loc[:, email_index].apply(
            lambda email: email.lower() if isinstance(email, str) else None
        )
        update_source.loc[:, city_index] = update_source.loc[:,
                                                             city_index].apply(NewsManager.format_city)
        update_source = update_source[~update_source[email_index].isin(self.unsubscribed)]

        update_source["content_generated"] = False
        update_source["content_emailed"] = False
        update_source['data_type'] = 'contact'

        return update_source

    @staticmethod
    def format_city(city_string):
        city_components = city_string.split(", ")
        if len(city_components) == 1:
            return utils.adjust_case(city_components[0])
        else:
            city_components[0] = utils.adjust_case(city_components[0])
            return ", ".join(city_components)

    def _get_news_collection(self, name, db=utils.SYSTEM_MONGO):
        collection = "news.emails." + name
        return db.get_collection(collection)

    def _create_collection(self):
        self.collection.create_index(
            [('email', 1), ('data_type', 1)],
            unique=True,
            partialFilterExpression={
                'email': {'$exists': True},
                'data_type': {'$exists': True}
            }
        )
        self.collection.create_index([('data_type', 1)])
        self.collection.create_index([('data_type', 1), ('city', 1)])
        self.collection.create_index([('data_type', 1), ('parsed_city', 1)])
        self.collection.create_index([('activated', 1), ('data_type', 1)])
        self.collection.create_index([('activated', 1), ('data_type', 1), ('links_processed', 1)])
        self.collection.create_index([('name', 1), ('data_type', 1)])
        self.collection.create_index([('content_generated', 1)])
        self.collection.create_index([('content_emailed', 1), ('content_generated', 1)])
        if self.source is not None:
            try:
                self.collection.insert_many(self.source.to_dict(orient='records'), ordered=False)
            except Exception:
                pass

    def add_to_source(self, csv_path):
        """
        Adds csv of items to source.
        """
        try:
            source = pd.read_csv(SOURCES_PATH + csv_path)
        except FileNotFoundError:
            source = pd.read_csv(csv_path)

        source = self._format_source(source)
        try:
            self.collection.insert_many(source.to_dict(orient='records'), ordered=False)
            self._update_contact_cities()
        except mongo.BWE as bwe:
            if bwe.details['nInserted'] > 0:
                self._update_contact_cities()

    def _update_contact_cities(self):
        cities = list(self.collection.find({'data_type': 'city'}))
        count = 0
        modified_count = 0
        for city in cities:
            res = self.collection.update_many({
                'content_generated': False,
                'data_type': 'contact',
                'city': {'$regex': r'^' + city['name']}
            }, {
                '$set': {
                    'content_generated': True,
                    'parsed_city': city['name']
                }
            })

            modified_count += res.modified_count
            count += 1
            if count % 100 == 0:
                print('Total Modified So Far:', modified_count)

        return modified_count


def parse_city(location) -> dict:
    """
    Provided a city, will return dictionary containing the city, state, and zipcode.

    Parameter:
        location: string            example: "Los Angeles, CA 90048-5561 United States"

    Response:
        {
            city: string,           example: "Los Angeles"
            state: string,          example: "CA"
            zipcode: string,        example: "90048-5561"
        }

    """
    result = {}

    if not isinstance(location, str):
        return None

    try:
        if "," in location:
            location = location.split(",")
            remaining_details = location[1].strip().split(" ")
            result['city'] = location[0]  # the first item in the list is the city
            result['state'] = remaining_details[0]
            result['zipcode'] = remaining_details[1].split(
                "-")[0]  # remove any trailing zip code details
        else:
            # if not in regular format, just do this based off the zip code
            num_match = re.findall(r'\d{5}(?:[-\s]\d{4})?', location)
            if not num_match:
                print('Invalid Location: {}'.format(location))
                return None

            result["zipcode"] = int(num_match[0].split("-")[0])

            if 'city' not in location:
                zipcode = utils.DB_ZIPS.find_one({"ZipCode": int(result['zipcode'])})
                if zipcode:
                    result['city'] = zipcode['City']
                    result['state'] = zipcode['State']
        return result
    except IndexError as e:
        print(e)
        return None


def date_converter(o):
    if isinstance(o, dt.datetime):
        return o.isoformat()


if __name__ == "__main__":

    my_generator = NewsManager(
        'Official-9/9', national_news=False)
    # my_generator.generate()
    # my_generator.convert_links()
    # my_generator.email(enforce_conversion=False)
    my_generator.email(update='AirKitchen', enforce_conversion=False)

    # print(my_generator.collection.count_documents({
    #     'data_type': 'contact',
    #     'content_generated': True
    #     # 'links_processed': True,
    #     # 'data_type': 'city',
    # }))
