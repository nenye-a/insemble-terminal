import os
import utils

from decouple import config
from yattag import Doc

'''
Builder for custom html attributes.
'''

# Getting the absoluate path of this directory to ensure that we can always find our sub files.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))


def generate_report_header(header_text=""):
    """Generate header text html for the report"""
    doc, tag, text = Doc().tagtext()
    with tag('h2'):
        text(header_text)

    return doc.getvalue()


def linear_news_entry(title="", description="", photo="#", link="#", post_date="", source=""):
    """
    Generate html text for a singular email entry. These will contain photos.

    Parameters:
        title: string               # title of news artile
        description: string         # title of news article
        photo: string               # link to photo
        link: string                # link to news article
        post_date: string           # date the the news article was posted
    """

    # photo_styling = "width: 100%; max-width: 600px; height: auto; margin: auto; display: block;"
    description = description[:127] + "..." if len(description) > 130 else description  # truncate long descriptions
    doc, tag, text = Doc().tagtext()

    with tag('tr'):
        with tag('td', style='padding-bottom: 20px;'):
            with tag('table', role='presentation', border='0', cellpadding='0', cellspacing='0', width='100%'):
                with tag('tbody'):
                    with tag('tr'):
                        # # Removeing photos.
                        # with tag('td', valign='middle', width='35%'):
                        #     with tag('img', src=photo, alt="", style=photo_styling):
                        #         text('')
                        with tag('td', valign='middle', width='65%'):
                            # with tag('div', klass='text-blog', style='text-align: left;padding-left:25px;'):
                            with tag('div', klass='text-blog', style='text-align: left;'):
                                with tag('p', klass='meta'):
                                    with tag('span', style="margin-right: 10px;"):
                                        text(post_date)
                                    if source != "":
                                        with tag('span', style=("padding-top: 2px; padding-left: 5px; background: lightgray;"
                                                                "padding-right: 5px; border-radius: 5px;padding-bottom: 2px;")):
                                            text(source)
                                with tag('a', href=link):
                                    with tag('h2'):
                                        text(title)
                                with tag('p', klass=''):
                                    text(description)
                                with tag('p'):
                                    with tag('a', href=link, klass="btn btn-small"):
                                        text('Read More')

    return doc.getvalue()


def double_news_entry(titles=("", ""), descriptions=("", ""), links=("#", "#"), post_dates=("", ""), sources=("", "")):
    """
    Generate html text for double email entry. This will not contain any photos. Each parameter is
    a tuple with the first item representing the first email and same for the second. IF no second
    item is provided, then entry will have an empty 2nd column.

    Parameters:
        title: tuple(string)                # title of news artile -> (string,) is okay
        description: tuple(string)          # title of news article
        photo: tuple(string)                # link to photo
        link: tuple(string)                 # link to news article
        post_date: tuple(string)            # date the the news article was posted

    """

    if len(titles) == 1 and len(descriptions) == 1 and len(links) == 1 and len(post_dates) == 1:
        two_items = False
    elif len(titles) == 2 and len(descriptions) == 2 and len(links) == 2 and len(post_dates) == 2:
        two_items = True
    else:
        raise Exception('Please ensure that you have the same number of elements for reach fields. '
                        'Please also remember that only two items are supported.')

    old_descriptions = descriptions
    descriptions = []
    for description in old_descriptions:
        description = description[:87] + "..." if len(description) > 90 else description  # truncate long descriptions
        descriptions.append(description)
    descriptions = tuple(descriptions)

    doc, tag, text = Doc().tagtext()

    with tag('tr'):
        with tag('td', style='padding-bottom: 20px;'):
            with tag('table', role='presentation', border='0', cellpadding='0', cellspacing='0', width='100%'):
                with tag('tbody'):
                    with tag('tr'):
                        with tag('td', valign='top', width='50%'):
                            with tag('div', klass='text-blog', style='text-align: left;padding-right:12px'):
                                with tag('p', klass='meta'):
                                    with tag('span', style="margin-right: 10px;"):
                                        text(post_dates[0])
                                    if sources[0] != "":
                                        with tag('span', style=("padding-top: 2px; padding-left: 5px; background: lightgray;"
                                                                "padding-right: 5px; border-radius: 5px;padding-bottom: 2px;")):
                                            text(sources[0])
                                with tag('a', href=links[0]):
                                    with tag('h2'):
                                        text(titles[0])
                                with tag('p', klass=''):
                                    text(descriptions[0])
                                with tag('p'):
                                    with tag('a', href=links[0], klass="btn btn-small"):
                                        text('Read More')

                        with tag('td', valign='top', width='50%'):
                            if two_items:
                                with tag('div', klass='text-blog', style='text-align: left;padding-left:12px'):
                                    with tag('p', klass='meta'):
                                        with tag('span', style="margin-right: 10px;"):
                                            text(post_dates[1])
                                        if sources[1] != "":
                                            with tag('span', style=("padding-top: 2px; padding-left: 5px; background: lightgray;"
                                                                    "padding-right: 5px; border-radius: 5px;padding-bottom: 2px;")):
                                                text(sources[1])
                                    with tag('a', href=links[1]):
                                        with tag('h2'):
                                            text(titles[1])
                                    with tag('p', klass=''):
                                        text(descriptions[1])
                                    with tag('p'):
                                        with tag('a', href=links[1], klass="btn btn-small"):
                                            text('Read More')
                            else:
                                text('')

    return doc.getvalue()


def generate_graph_entry(graph_urls):
    """
    Generate graph entry for the email.

    Parameters:
        graph_url: url (or list[url]) to the graph that is expected to go into the email.
    """

    if not graph_urls:
        return ""
    if isinstance(graph_urls, str):
        # if not a list, turn into a list (to support single string elemetns)
        graph_urls = [graph_urls]

    doc, tag, text = Doc().tagtext()

    for graph_url in graph_urls:
        if graph_url is None:
            continue
        with tag('tr'):
            with tag('td', valign='midddle', width='100%'):
                with tag('div'):
                    with tag('a', href=graph_url):
                        doc.stag('img', style='height: 100%; width: 100%;', src=graph_url)

    return doc.getvalue()


def generate_stat_table(ratio1=None, ratio_text1=None, ratio2=None, ratio_text2=None, is_percentage1=True, is_percentage2=True):
    """
    Generate html that represents two stats side by side as a table row. Must be placed within
    a table body.,

    Parameters:
        ratio1: ratio that is expected to be placed in the html
        ratio_text1: text assocoated with ratio1
        ratio2: ratio that is expected to be placed in the html
        ratio_text2: text assocoated with ratio2
        is_percentage1: indicate that ratio1 is a percentage
        is_percentage2: indicate that ratio2 is a percentage
    """

    if not ratio1:
        return ''

    is_two = False
    ratio1 = str(round(ratio1, 2))
    if is_percentage1:
        ratio1 = ratio1 + "%"

    if ratio2:
        is_two = True
        ratio2 = str(round(ratio2, 2))
        if is_percentage2:
            ratio2 = ratio2 + "%"

    doc, tag, text = Doc().tagtext()

    with tag('tr'):
        with tag('td', style='padding-bottom: 20px;'):
            with tag('table', role='presentation', border='0', cellpadding='0', cellspacing='0', width='100%'):
                with tag('tbody'):
                    with tag('tr'):
                        with tag('td', valign='top', width='50%'):
                            with tag('div', style='text-align: center;'):
                                with tag('p', style="margin-block-start: 5px;margin-block-end: 0;margin: 0;font-size: 45px;"
                                         "color: #674EA7;padding-bottom: 0px;margin-inline-end: 0;"):
                                    text(ratio1)
                                with tag('p', style="margin-block-start: 0;color: #442c84;"):
                                    text(ratio_text1)
                        if is_two:
                            with tag('td', valign='top', width='50%'):
                                with tag('div', style='text-align: center;'):
                                    with tag('p', style="margin-block-start: 5px;margin-block-end: 0;margin: 0;font-size: 45px;"
                                             "color: #674EA7;padding-bottom: 0px;margin-inline-end: 0;"):
                                        text(ratio2)
                                    with tag('p', style="margin-block-start: 0;color: #442c84;"):
                                        text(ratio_text2)

    return doc.getvalue()


def generate_news_entries_html(linear_entries=None, grid_entries=None):
    """
    Provided a list of news entries, will generate entries html that can then be provided to
    generate email_html. Supports both linear_entries or grid_entries

    Parameters:
        linear_entries: [
            {
                title: string,
                description: string,
                link: string,
                image: string,
                source, string,
                published: stirng
            }
        ]
        grid_entries: [                     # same as linear_entries. Images can be provided, but they will be ignored
                {
                title: string,
                description: string,
                link: string,
                source, string,
                published: stirng
            }
        ]
    """

    entries = ""

    if linear_entries:
        entries = entries + "".join([
            linear_news_entry(
                title=entry['title'],
                description=entry['description'],
                photo=entry['image'],
                link=entry['link'],
                post_date=entry['published'],
                source=entry['source']
            ) for entry in linear_entries
        ])

    if grid_entries:
        grid_rows = []
        entry_list = []
        for entry in grid_entries:
            entry_list.append(entry)
            if len(entry_list) == 2:
                grid_rows.append(entry_list.copy())
                entry_list.clear()
        if len(entry_list) > 0:
            grid_rows.append(entry_list)

        # print(grid_rows)
        entries = entries + "".join([
            double_news_entry(
                titles=parsed_row['titles'],
                descriptions=parsed_row['descriptions'],
                links=parsed_row['links'],
                post_dates=parsed_row['post_dates'],
                sources=parsed_row['sources']
            ) for parsed_row in [_grid_entry_parse(row) for row in grid_rows]
        ])

    return entries


def _grid_entry_parse(list_entries):
    """Will parase list of two entries into object of tuples"""
    if len(list_entries) == 2:
        entry1 = list_entries[0]
        entry2 = list_entries[1]
        return {
            'titles': (entry1['title'], entry2['title']),
            'descriptions': (entry1['description'], entry2['description']),
            'links': (entry1['link'], entry2['link']),
            'post_dates': (entry1['published'], entry2['published']),
            'sources': (entry1['source'], entry2['source'])
        }
    else:
        entry1 = list_entries[0]
        return {
            'titles': (entry1['title'],),
            'descriptions': (entry1['description'],),
            'links': (entry1['link'],),
            'post_dates': (entry1['published'],),
            'sources': (entry1['source'],)
        }


def generate_stat_html(list_ratios=None):
    if not list_ratios:
        return ""

    stat_html = ""
    stat_lists = utils.chunks(list_ratios, 2)

    for stat_list in stat_lists:
        stat_html += generate_stat_table(
            ratio1=stat_list[0]['stat'],
            ratio_text1=stat_list[0]['stat_text'],
            is_percentage1=stat_list[0]['is_percentage'] if 'is_percentage' in stat_list[0] else True,
            ratio2=stat_list[1]['stat'] if len(stat_list) > 1 else None,
            ratio_text2=stat_list[1]['stat_text'] if len(stat_list) > 1 else None,
            is_percentage2=stat_list[1]['is_percentage'] if len(stat_list) > 1 and 'is_percentage' in stat_list[1] else True
        )

    return stat_html


def generate_email_html(header_html, entries_html, graph_html, stat_html):
    """Provided requisite component emails, will return complete html, and store a generated file for debugging"""

    with open(THIS_DIR + '/templates/base.html', 'r') as base_html_file:
        base_html = ""
        for line in base_html_file:
            base_html = base_html + line.strip()
        base_html = base_html.replace('{% report_header %}', header_html)
        base_html = base_html.replace('{% email_entries %}', entries_html)
        base_html = base_html.replace('{% graph_entry %}', graph_html)
        base_html = base_html.replace('{% stat_entry %}', stat_html)

    with open(THIS_DIR + '/templates/generated.html', 'w') as generated_file:
        generated_file.write(base_html)

    return base_html


def generate_email_report_html(header_text, linear_entries=None, grid_entries=None, graph_urls=None, stats=[]):
    """
    Provided details to build news email, will generate all the html required to send.

    Parameters:
        header_text: string - header text for the emailer
        linear_entries: list[news dictionaries] - list of news that intended to be displayed linearly
        grid_entries: list[news dictionaries] - list of news that intended to be displayed in a table
        graph_url: url - link to graph that should be attached to email.
        stats: list[dictionary] - list of statistics : {
            'stat': int/float the actual statistic,
            'stat_text': string - the description text for the statistic,
            'is_percentage': string - whether or not the item is a precentage stat
        }

    """

    header_html = generate_report_header(header_text)
    entries_html = generate_news_entries_html(linear_entries, grid_entries)
    graph_html = generate_graph_entry(graph_urls)
    stat_html = generate_stat_html(stats)
    return generate_email_html(header_html, entries_html, graph_html, stat_html)


# TESTS:

if __name__ == "__main__":

    generate_email_report_html('Test Tile', graph_urls=['https://plotly.com/~insemble/3/.png', 'https://plotly.com/~insemble/3/.png'], stats=[
        {
            'stat': 90,
            'stat_text': 'test2',
        },
        {
            'stat': 90,
            'stat_text': 'test2',
        },
    ])

    # generate_graph_html()
    # print(generate_operation_graph_entry('https://plotly.com/~insemble/3/.png'))
