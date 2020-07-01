import os
import ssl
from decouple import config

if (not os.environ.get('PYTHONHTTPSVERIFY', '') and
        getattr(ssl, '_create_unverified_context', None)):
    ssl._create_default_https_context = ssl._create_unverified_context
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_KEY = config('SENDGRID_KEY')


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
        if response.status_code % 200 < 10:
            return True
        else:
            return False
    except Exception as e:
        print('EMAILER: Failed to send email to {}. Error: "{}"'.format(
            to_emails, e
        ))
        return False


if __name__ == "__main__":

    def test_email(email):

        send_email(
            from_email='support@insemblegroup.com',
            to_emails=email,
            subject='Test Emailer',
            html_text="""
                <div>
                    <div>
                        <p>Hi!</p>
                        <p>Hello!</p>
                    </div>
                    <div>
                        <p>This is your friendly test email from your pals at Insemble!</p>
                    </div>
                </div>
            """
        )

    test_email('nenye@insemblegroup.com')
