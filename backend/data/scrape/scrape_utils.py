import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import logging
import requests
import random
import time
import UserAgents

from utils import DB_PROXY_LOG
from decouple import config
from datetime import datetime
from bs4 import BeautifulSoup
from itertools import cycle

DB_PROXY_LOG.create_index([('proxy', 1)], unique=True)

SCRAPEHUB_KEY = config('SCRAPEHUB_KEY')
PAID_PROXY = 'http://{}:@proxy.crawlera.com:8010/'.format(SCRAPEHUB_KEY)
PROXY_URL = 'https://free-proxy-list.net/'
USER_AGENT_URL = 'https://developers.whatismybrowser.com/useragents/explore/software_name/chrome/'
FAIL_TAG = 'FAILED'
USER_AGENT_LIST = UserAgents.User_Agents
LAST_PROXY_REQUEST_TIME = None
CURRENT_PROXIES = []


def pull_proxies(https=False, us_only=False):
    """
    Return a list of proxies that can be used during scraping runs. Will return a new set of proxies
    every 10 minutes.
    """

    global LAST_PROXY_REQUEST_TIME, CURRENT_PROXIES
    time_since_query = datetime.now() - LAST_PROXY_REQUEST_TIME if LAST_PROXY_REQUEST_TIME else None
    if time_since_query and time_since_query.seconds < 600:
        return CURRENT_PROXIES
    else:
        def element_filter(element):
            if not element or element[4].text == 'transparent':  # check if anonymous (free-proxy-list.net)
                return False
            if https and element[6].text != 'yes':  # check if http (refer to table on free-proxy-list.net)
                return False
            if us_only and element[3].text != 'United States':
                return False
            return True

        response = requests.get(PROXY_URL)
        soup = BeautifulSoup(response.text, 'lxml')
        table = soup.find('table', id='proxylisttable')
        list_tr = table.find_all('tr')
        list_td = [elem.find_all('td') for elem in list_tr]
        list_td = list(filter(element_filter, list_td))
        list_ip_ports = [(elem[0].text, elem[1].text) for elem in list_td]
        list_proxies = ['http://' + ':'.join(elem) for elem in list_ip_ports]
        CURRENT_PROXIES = list_proxies
        LAST_PROXY_REQUEST_TIME = datetime.now()
        return list_proxies


def pull_user_agents(num_pages=1):

    list_user_agent = []
    for page_num in range(1, num_pages + 1):
        response = requests.get(USER_AGENT_URL + str(page_num))
        soup = BeautifulSoup(response.text, 'lxml')
        table = soup.find('table', class_="table table-striped table-hover table-bordered table-useragents")
        list_tr = table.find_all('tr')
        list_td = [elem.find_all('td') for elem in list_tr]
        list_td = list(filter(None, list_td))
        list_user_agent.extend([elem[0].text for elem in list_td if elem[3].text == 'Computer'])
        if page_num != num_pages:
            time.sleep(5)

    print(list_user_agent)


def get_proxy_cycle_iter():
    proxies = pull_proxies()
    return cycle(proxies)


def get_proxy(paid=False, https=False, us_only=False, fail_token=None, tried_proxies=[]):

    # rate limiting the proxies
    target_interval_seconds = random.choice([5, 3, 8])  # randomly choose the desired time interval for each proxy

    if paid:
        proxy = PAID_PROXY
    else:
        fail_tag = get_fail_tag(fail_token)
        proxies = pull_proxies(https=https, us_only=us_only)

        for tried_proxy in tried_proxies:
            try:
                proxies.remove(tried_proxy)
            except BaseException:
                continue

        proxy = random.choice(proxies)
        proxy_query = {'proxy': proxy, fail_tag: {'$exists': False}} if fail_tag else {'proxy': proxy}

        proxy_record = DB_PROXY_LOG.find_one(proxy_query)

        if proxy_record:
            recorded_proxy_time = datetime.fromisoformat(proxy_record['last_call'])
            time_delta = max(target_interval_seconds - (datetime.utcnow() - recorded_proxy_time).seconds, 0)
            time.sleep(time_delta)
        else:
            tried_proxies.append(proxy)
            return get_proxy(paid, https=https, us_only=us_only, fail_token=fail_token, tried_proxies=tried_proxies)

        DB_PROXY_LOG.update_one({'proxy': proxy}, {'$set': {
            'last_call': datetime.utcnow().replace(microsecond=0).isoformat(),
            'proxy': proxy
        }}, upsert=True)

    if https:
        return {'https': proxy}
    else:
        return {'http': proxy}


def linspace(start, stop, n):
    if n == 1:
        yield stop
        return
    h = (stop - start) / (n - 1)
    for i in range(n):
        yield start + h * i


def get_logger(name):

    logger = logging.getLogger(name)
    formatter = logging.Formatter('%(name)s - %(levelname)s: %(message)s')

    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    level = logging.INFO
    logger.setLevel(level)

    return logger


def trash_proxy(proxy, fail_token):

    print('Trashing Proxy {} for {}'.format(proxy, fail_token))
    if isinstance(proxy, dict):
        proxy = proxy['https'] if 'https' in proxy else proxy['http']

    if proxy == PAID_PROXY:
        return

    fail_tag = get_fail_tag(fail_token)
    DB_PROXY_LOG.update({'proxy': proxy}, {'$set': {fail_tag: fail_tag}})


def get_fail_tag(fail_token):

    return FAIL_TAG + '_' + fail_token if fail_token else None
