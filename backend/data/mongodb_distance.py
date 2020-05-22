import utils
import pandas


def get_num_results(distance):
    query_point = {'type': 'Point', 'coordinates': [-118.176203, 33.977346]}
    return len(list(utils.DB_COORDINATES.find({
        'query_point': {
            '$near': {
                '$geometry': query_point,
                '$maxDistance': distance
            }
        }
    })))


pandas.DataFrame([{
    'meters': meters,
    'results': get_num_results(meters)
} for meters in range(150, 2000, 10)]).to_csv('test.csv')
