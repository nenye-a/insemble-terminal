import sys
import os
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.extend([THIS_DIR, BASE_DIR])

import ssl
import email_builder
import json
import utils

from decouple import config

if (not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None)):
    ssl._create_default_https_context = ssl._create_unverified_context
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_KEY = config('SENDGRID_KEY')


def email_report(to_email, header_text, linear_entries, grid_entries=None, custom_graph_url=None, statistics=[]):

    # graph_url = trend_analyzer.generate_operating_graph()['plot_url']
    # graph_url = graph_url + '.png' if '.png' not in graph_url else graph_url  # add .png to links if not in the link
    graph_url = None

    graph_urls = [graph_url]

    if custom_graph_url:
        custom_graph_url = custom_graph_url + '.png' if '.png' not in custom_graph_url else custom_graph_url
        graph_urls.insert(0, custom_graph_url)

    email_html = email_builder.generate_email_report_html(
        header_text=header_text,
        linear_entries=linear_entries,
        grid_entries=grid_entries,
        graph_urls=graph_urls,
        stats=statistics
    )
    send_email('news@insemblegroup.com', to_email, header_text, email_html)


def send_email(from_email, to_emails, subject, html_text):
    """
    Sends the email from desired parties to desired subjects.

    Parameters:
        html_text: string                       # html of the text that should be sent to the user.
        from_email: string,                     # email from which to send email. Must end with @insemblegroup.com
        to_emails: list[string] or string       # recepient emails
        subject: string                         # subject line of the email

    """
    message = Mail(
        from_email=from_email,
        to_emails=to_emails,
        subject=subject,
        html_content=html_text)
    message.add_bcc('blasts@insemblegroup.com')
    try:
        sg = SendGridAPIClient(api_key=SENDGRID_KEY)
        sg.useragent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0'
        response = sg.send(message)
        print(response.status_code)
    except Exception:
        print('email failed to send.')
        raise  # re-raise the exception to be handled elsewhere


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
