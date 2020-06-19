import utils
import re
from fuzzywuzzy import process

"""
Pre-processor for all the categories that come through the database.
"""

BAD_WORDS = utils.DB_MISC.find_one({"name": "bad_words"})["bad_words"]
NAMES = utils.DB_MISC.find_one({"name": "business_names"})["business_names"]
CATEGORIES = utils.DB_MISC.find_one({"name": "category_names"})["category_names"]


def preprocess(business_name):
    word_match = get_matching_name(business_name)
    if word_match:
        return utils.adjust_case(word_match)
    if is_bad_word(business_name):
        return None
    else:
        return utils.adjust_case(business_name)


def get_matching_name(word):
    word = utils.alpanumeric(word)
    matches = process.extractBests(word, NAMES, score_cutoff=80)
    if matches:
        word_length = len(word)
        best_word = "word".join([word for x in range(14)])
        for match in matches:
            if abs(len(match[0]) - word_length) < abs(len(best_word) - word_length):
                best_word = match[0]
        return best_word
    return None


def is_bad_word(word):
    match = process.extractOne(word, BAD_WORDS)
    if match[1] >= 83:
        return True
    return False


def populate_names():
    utils.DB_TERMINAL_PLACES.aggregate([
        {'$group': {
            "_id": "$name",
            "count": {
                "$sum": 1
            },
        }},
        {"$match": {
            "count": {"$gt": 10}
        }},
        {"$group": {
            "_id": None,
            "business_names": {
                "$addToSet": "$_id"
            }
        }},
        {"$project": {
            "_id": 0,
            "name": "business_names",
            "business_names": "$business_names"
        }},
        {"$merge": "misc"}
    ], allowDiskUse=True)


def populate_categories():
    utils.DB_TERMINAL_PLACES.aggregate([
        {'$group': {
            "_id": "$type",
            "count": {
                "$sum": 1
            },
        }},
        {"$match": {
            "count": {"$gt": 10}
        }},
        {"$group": {
            "_id": None,
            "category_names": {
                "$addToSet": "$_id"
            }
        }},
        {"$project": {
            "_id": 0,
            "name": "category_names",
            "category_names": "$category_names"
        }},
        {"$merge": "misc"}
    ], allowDiskUse=True)


def clean_names():
    copy = NAMES.copy()
    for name in NAMES:
        if len(name) < 3:
            copy.remove(name)
    num_modified = utils.DB_MISC.update_one({
        'name': 'business_names'
    }, {
        '$set': {
            'business_names': copy
        }
    })
    print(num_modified.modified_count)


if __name__ == "__main__":
    pass
    # clean_names()

    print(preprocess('Pap[]a Jo-hn\'s'))
    # # print(process.extractBests("Papa Johns", NAMES))
    # print(time.time() - start)
    # pass
