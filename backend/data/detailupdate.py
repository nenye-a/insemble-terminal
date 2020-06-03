import datetime as dt
import google
import utils
import time


def google_detailer(batch_size=300, wait=True, additional_query=None):
    """
    Google detail collector.
    """

    query = {'google_details': {'$exists': False}, 'address': {'$exists': True}}
    additional_query and query.update(additional_query)

    size = {'size': batch_size}

    collecting = True

    while collecting:

        places = list(utils.DB_TERMINAL_PLACES.aggregate([
            {'$match': query},
            {'$sample': size}
        ]))

        if len(places) == 0:
            if wait:
                print('GOOGLE_COLLECTOR: No un-processed name_addresses observed, '
                      'waiting 10 seconds for new locations...')
                time.sleep(10)
                continue
            else:
                collecting = False

        google_details = google.get_many_google_details(places)

        for details in google_details:
            city = utils.extract_city(details['meta']['address'])
            place_type = utils.modify_word(details['data']['type'].split(" in ")[0])

            update_details = {'google_details': details['data']}
            if 'type' not in details['meta']:
                update_details['type'] = place_type
            if 'city' not in details['meta']:
                update_details['city'] = city

            place_query = {'_id': details['meta']['_id']}
            place_update = {'$set': update_details}

            # update and save revision of data.
            saved_update(place_query, place_update)

            print('GOOGLE_COLLECTOR: Updated {} at {} ({}) with google details.'.format(
                details['meta']['name'],
                details['meta']['address'],
                details['meta']['_id']
            ))
        print('GOOGLE_COLLECTOR: Batch complete, searching for more locations.')


def saved_update(query, update):
    """
    Updates an item in the TERMINAL_PLACES database, and saves the timestamped difference
    in the PLACES_HISTORY database.

    query: mongodb query to find item of update.
    update: mongodb update document.
    """

    table = utils.DB_TERMINAL_PLACES
    history = utils.DB_PLACES_HISTORY
    update_time = dt.datetime.now()

    previous = table.find_one_and_update(
        query,
        dict(update, **{'$inc': {'version': 1},
                        'last_update': update_time})
    )
    new = table.find_one(query)
    diff = utils.dictionary_diff(previous, new)
    diff.pop('version')

    if diff != {}:
        history_update = dict(diff, **{
            "revision": previous.pop('version', 0),
            "revised_time": update_time,
        })

        history.update_one({'place_id': previous['_id']}, {
            '$push': {
                'revisions': history_update
            },
            '$setOnInsert': {
                'place_id': previous['_id']
            }
        }, upsert=True)


if __name__ == "__main__":
    pass
