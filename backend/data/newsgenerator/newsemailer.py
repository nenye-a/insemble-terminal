import sys
import os
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.extend([THIS_DIR, BASE_DIR])

import email_builder
from emailer import send_email


def email_report(to_email, header_text, linear_entries, grid_entries=None,
                 custom_graph_url=None, statistics=[], update=None):

    # graph_url = trend_analyzer.generate_operating_graph()['plot_url']
    # graph_url = graph_url + '.png' if '.png' not in graph_url else graph_url  # add .png to links if not in the link
    graph_url = None

    graph_urls = [graph_url]

    if custom_graph_url:
        if '.png' not in custom_graph_url:
            custom_graph_url = custom_graph_url + '.png'
        graph_urls.insert(0, custom_graph_url)

    email_html = email_builder.generate_email_report_html(
        header_text=header_text,
        linear_entries=linear_entries,
        grid_entries=grid_entries,
        graph_urls=graph_urls,
        stats=statistics,
        update=update
    )
    send_email('news@insemblegroup.com', to_email, header_text, email_html)


if __name__ == "__main__":

    def test_email():
        email_report(
            to_email="support@insemblegroup.com",
            header_text="Test Email",
            linear_entries=[],
            grid_entries=None,
            custom_graph_url=None,
            statistics=[]
        )

    test_email()
