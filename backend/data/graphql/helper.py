'''
Helper functions for all things graphql.
'''

import gql
import time
import datetime as dt


def performance_table(performance_type, searches):
    '''
    Creates a performance table with all the searches
    compared. All searches must be of the same scope.

    Parameters:
        performance_type - type of result table (OVERALL, ADDRESS, CITY)
        searches - list of searches. A search in the following structure:
        {
            'business_tag': None or {
                'type': 'CATEGORY' | 'BUSINESS'
                'params': string
            },
            location_tag: None or {
                'type': 'ADDRESS'|'CITY'|'COUNTY'
                'params': string
            }
        }

    Return - string id of table
    '''

    if not searches:
        return None

    first_search = convert_search(gql.search(**searches[0]))
    table = gql.get_performance(performance_type, **first_search)
    if 'table' not in table:
        return None
    table_id = add_comparisons('PERFORMANCE', table['table']['id'], searches[1:])
    return table_id


def activity_graph(searches):
    """
    Creates an activity graph with the values of the searches provided.
    Will only add searches supported in this scope. Will return a string
    id of the table.

    Parameters:
        searches - list of searches. A search in the following structure:
        {
            'business_tag': None or {
                'type': 'CATEGORY' | 'BUSINESS'
                'params': string
            },
            location_tag: None or {
                'type': 'ADDRESS'|'CITY'|'COUNTY'
                'params': string
            }
        }

    Return - string id of table
    """

    if not searches:
        return None

    first_search = convert_search(gql.search(**searches[0]))
    table = gql.get_activity(**first_search)
    if 'table' not in table:
        return None
    table_id = add_comparisons('ACTIVITY', table['table']['id'], searches[1:])
    return table_id


def coverage_map(searches):
    """
    Creates an coverage map with the values of the searches provided.
    Will only add searches supported in this scope. Will return a string
    id of the table.

    Parameters:
        searches - list of searches. A search in the following structure:
        {
            'business_tag': None or {
                'type': 'CATEGORY' | 'BUSINESS'
                'params': string
            },
            location_tag: None or {
                'type': 'ADDRESS'|'CITY'|'COUNTY'
                'params': string
            }
        }

    Return - string id of table
    """

    if not searches:
        return None

    first_search = convert_search(gql.search(**searches[0]))
    table = gql.get_coverage(**first_search)
    if 'data' not in table:
        return None
    table_id = add_comparisons('MAP', table['id'], searches[1:])
    return table_id


def convert_search(raw_search):

    search = {
        'business_tag_id': raw_search['businessTag']['id']
        if raw_search['businessTag'] else None,

        'location_tag_id': raw_search['locationTag']['id']
        if raw_search['locationTag'] else None
    }
    return search


def add_comparisons(table_type, table_id, comparison_searches):

    for next_search in comparison_searches:
        if next_search:
            time.sleep(.1)
            try:
                compare_table = gql.update_comparison(
                    'ADD',
                    table_type.upper(),
                    table_id=table_id,
                    **next_search
                )
                if 'tableId' not in compare_table:
                    print(compare_table)
                table_id = compare_table['tableId']
            except Exception:
                print('Search: {} Failed to add, but continuing to create table.'.format(
                    next_search
                ))

    return table_id


def create_shared_report(*table_tuples, terminal_id=None, name=None, description=None):
    """
    Helper function to create a shared report based on a list of tables.
    Tables should come in a list of tuples, the first containing the type
    of table, and the 2nd either an id (of an existing table), or a dictionary
    of search parameters.



    Example Table Tuple -
        ("PERFORMANCE", "ckbsib3xl0039bq35tqiu47yj") or
        ("PERFORMANCE, {"searches":[... (searches - as defined by performance)],
                        "performance_type": "ADDRESS"})

    Supports Performance, Activity, Coverage, and Notes.
    Notes should provide dictionary params structured: {title: "", content: ""}

    Returns: Link to shared report & the terminal_id used
    """

    if not terminal_id:
        terminal_id_list = gql.create_terminal(
            name if name else 'Custom Report ' +
            str(dt.datetime.utcnow().replace(microsecond=0)).split(' ')[0],
            description
        )
        terminal_id = terminal_id_list[-1]['id']

    for table_tuple in table_tuples:

        table_type, params = table_tuple

        if isinstance(params, dict):
            if table_type == 'PERFORMANCE':
                table_id = performance_table(**params)
            elif table_type == 'ACTIVITY':
                table_id = activity_graph(**params)
            elif table_type == 'MAP':
                table_id = coverage_map(**params)
            elif table_type == 'NOTE':
                gql.create_note(terminal_id=terminal_id, **params)
                continue
            else:
                continue
        elif isinstance(params, str):
            table_id = params
        else:
            continue

        if table_id:
            # if table_type == 'MAP':
            #     table_type = 'COVERAGE'
            gql.pin_table(terminal_id, table_id, table_type)
        else:
            print('Failed to add table from {}'.format(table_tuple))

    shared_terminal = gql.share_terminal(terminal_id)
    print('Terminal shared @ {}\nHosted @ {}'.format(shared_terminal, terminal_id))
    return shared_terminal, terminal_id


if __name__ == "__main__":
    def report_generator():
        searches = [
            {
                'location_tag': {'type': 'CITY', 'params': 'Atlanta, GA, USA'},
                'business_tag': {'type': 'BUSINESS', 'params': 'Dunkin'}
            },
            {
                'location_tag': {'type': 'CITY', 'params': 'Atlanta, GA, USA'},
                'business_tag': {'type': 'BUSINESS', 'params': 'Starbucks'}
            },
            {
                'location_tag': {'type': 'CITY', 'params': 'Atlanta, GA, USA'},
                'business_tag': {'type': 'BUSINESS', 'params': 'Wingstop'}
            },
            {
                'location_tag': {'type': 'CITY', 'params': 'Atlanta, GA, USA'},
                'business_tag': {'type': 'BUSINESS', 'params': 'Papa John\'s'}
            }

        ]

        performance_search = ("PERFORMANCE", {"searches": searches, "performance_type": "ADDRESS"})
        activity_search = ("ACTIVITY", {"searches": searches})
        coverage_search = ("MAP", {"searches": searches})

        create_shared_report(performance_search, activity_search, coverage_search)

    report_generator()
