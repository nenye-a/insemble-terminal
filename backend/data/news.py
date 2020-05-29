import google
import utils
import time
from fuzzywuzzy import process

'''
News related queries.
'''

DEFAULT_SCORER = {
    'sales': 6,
    'performance': 5,
    'business': 4,
    'locations': 4,
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
    'opened': 5,
    'opening': 4,
    'retail': 5.5,
    'shut': 3,
    'shuttered': 3,
    'shut down': 3,
    'stock': 3,
    'unemployment': 4.2,
    'real': 3.5,
    # removing unsavory news (i.e. Harvey Weinstein's case)
    'assault': -6,
    'rapist': -30,
    'sex': -30,
}

NEWS_TERMS = ["retail news", "commercial real estate news", "closings", "openings"]


def news(business=None, location=None):

    if business and location:
        news = google.get_many_news([business + " " + location, business], num_retries=2)
    elif business:
        news = google.get_news(business)
    elif location:
        news_search_terms = [" ".join([location, news_term]) for news_term in
                             NEWS_TERMS] if location else NEWS_TERMS.copy()
        news = google.get_many_news(news_search_terms, num_retries=1)
    else:
        news = google.get_many_news(NEWS_TERMS, num_retries=1)

    news_with_relevance = add_news_relevance(news, business, location)
    relevant_news = most_relevant(news_with_relevance)
    return relevant_news


def add_news_relevance(news_list, business, location, multiplier=1):

    for news in news_list:
        text = news['title'] + " " + news["description"]
        news_relevance = determine_relevance(text, business, location)
        news['relevance'] = news_relevance * multiplier

    # return sorted list of news with relevance
    return sorted(news_list, key=lambda news: news['relevance'], reverse=True)


def determine_relevance(text, business, location):
    """Determine relevanve of an article for a user"""
    # get the scorer for word relevance
    location_scorer = {
        word.strip(): 3 for word in location.split(',')
    } if location else {}
    if business:
        location_scorer[business] = 8
    this_scorer = DEFAULT_SCORER.copy()
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
            relevance_score = relevance_score + float(weight_word(matching_word[1])) / 10 * this_scorer[word]

    return round(relevance_score, 1)


def most_relevant(*news_lists):
    """
    Provided one ore more lists of news with titles and relevance, will return the 10 most relevant
    news sources among them.
    """
    existing_titles = set()
    most_relevant_news = []
    for news_list in news_lists:
        for news in news_list:
            if news['title'] not in existing_titles:
                most_relevant_news.append(news)
                existing_titles.add(news['title'])

    return sorted(most_relevant_news, key=lambda news: news['relevance'], reverse=True)[:20]


if __name__ == "__main__":
    # print(news(business='Cheesecake Factory'))
    # print(news(business='Cheesecake Factory', location='Santa Monica'))
    print(news(location='Santa Monica'))
