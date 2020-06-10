import utils
import time
import performancev2
import datetime as dt

TIME_ZONE_OFFSET = -dt.timedelta(hours=7)
TEMP_PLACES = "terminal.temp_places"
DB_TEMP = utils.SYSTEM_MONGO.get_collection(TEMP_PLACES)


# def initial_setup():
#     # ONLY RUN THIS ONCE
#     # NUM TIMES RUN: 1

#     utils.DB_TERMINAL_PLACES.aggregate([
#         {
#             '$set': {
#                 'brand_volume': -2,
#                 'local_retail_volume': -2,
#                 'local_category_volume': -2
#             }
#         },
#         {
#             "$merge": "temp_places"
#         }
#     ])

#     DB_TEMP.create_index([('brand_volume', 1)])
#     DB_TEMP.create_index([('local_retail_volume', 1)])
#     DB_TEMP.create_index([('local_category_volume', 1)])


def update_activity_averages(batch_size=100, wait=True, additional_query=None):

    query = {}
    additional_query and query.update(additional_query)

    size = {'size': batch_size}

    collecting = True

    while collecting:

        pipeline = []
        if query:
            pipeline.append({'$match': query})
        pipeline.append({'$sample': size})

        places = list(DB_TEMP.aggregate(pipeline))
        print("Speed")

        id_list = [place['_id'] for place in places]

        if len(places) == 0:
            if wait:
                print('ACTIVITY_UPDATE:      '
                      'No un-processed name_addresses observed, '
                      'waiting 10 seconds for new locations...')
                time.sleep(10)
                continue
            else:
                collecting = False

        for place in places:

            if 'location' not in place:
                continue

            # brand_volume = list(utils.DB_TERMINAL_PLACES.aggregate(
            #     performancev2.build_brand_query(place['name'])
            # ))[0]['avg_total_volume'] if 'name' in place else -1
            # brand_volume = -1

            local_retail_volume = list(utils.DB_TERMINAL_PLACES.aggregate(
                performancev2.build_proximity_query(place, performancev2.LOCAL_RETAIL_RADIUS)
            ))[0]['avg_total_volume']

            local_category_volume = list(utils.DB_TERMINAL_PLACES.aggregate(
                performancev2.build_proximity_query(
                    place,
                    performancev2.LOCAL_CATEGORY_RADIUS,
                    utils.adjust_case(place['type']))
            ))[0]['avg_total_volume'] if 'type' in place else -1

            utils.DB_TERMINAL_PLACES.update_one({'_id': place['_id']}, {
                '$set': {
                    # 'brand_volume': brand_volume,
                    'local_retail_volume': local_retail_volume,
                    'local_category_volume': local_category_volume
                }
            })

            print('ACTIVITY_UPDATE:      '
                  'Updated {} at {} ({}) with activity.'.format(
                      place['name'],
                      place['address'],
                      place['_id']
                  ))
        print('ACTIVITY_UPDATE: Batch complete, updated {count} places. '
              'searching for more locations. Last Update: {update_time}'.format(
                  count=len(places),
                  update_time=dt.datetime.now(tz=dt.timezone(TIME_ZONE_OFFSET))
              ))

        DB_TEMP.delete_many({
            '_id': {"$in": id_list}
        })


if __name__ == "__main__":
    update_activity_averages()
    # update_activity_averages(additional_query={
    #     '$or': [
    #         {
    #             'name': {"$regex": r'^' + 'Dunkin'},
    #             'city': {"$regex": r'^' + 'Los Angeles'},
    #         },
    #         {
    #             'name': {"$regex": r'^' + 'Starbucks'},
    #             'city': {"$regex": r'^' + 'Atlanta'},
    #         },
    #         {
    #             'name': {"$regex": r'^' + 'Dunkin'},
    #             'city': {"$regex": r'^' + 'Atlanta'},
    #         },
    #         {
    #             'name': {"$regex": r'^' + 'Wingstop'},
    #             'city': {"$regex": r'^' + 'Los Angeles'},
    #         },
    #         {
    #             'name': {"$regex": r'^' + 'Wingstop'},
    #             'city': {"$regex": r'^' + 'Atlanta'},
    #         },

    #     ],
    #     # 'name': {"$regex": r'^' + 'Dunkin'},
    #     # 'city': {"$regex": r'^' + 'Los Angeles'},
    # })
    # print(utils.DB_TERMINAL_PLACES.count_documents({"type": {"$ne": None}}))
