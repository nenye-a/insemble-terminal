import sgMail from '@sendgrid/mail';
import fs from 'fs';
import ejs from 'ejs';

import {
  SENDGRID_API_KEY,
  CONTACT_PERSON,
  SUPPORT_EMAIL,
} from '../constants/constants';

sgMail.setApiKey(SENDGRID_API_KEY);

let emailVerificationTemplate = fs
  .readFileSync('src/emailTemplates/emailVerification.html')
  .toString();
let contactUs = fs.readFileSync('src/emailTemplates/contactUs.html').toString();
let feedback = fs.readFileSync('src/emailTemplates/feedback.html').toString();

async function sendVerificationEmail(
  receiver: { email: string; name: string },
  link: string,
) {
  let htmlContent = ejs.render(emailVerificationTemplate, {
    name: receiver.name,
    url: link,
  });
  let msg = {
    to: receiver.email,
    from: 'Insemble Terminal <no-reply@insemble.co>',
    subject: 'Verify your email with Insemble Terminal',
    text: `Please verify your email by clicking this link ${link}`,
    html: htmlContent,
  };
  await sgMail.send(msg);
}

async function sendForgotPasswordEmail(
  receiver: { email: string; name: string },
  link: string,
) {
  let htmlContent = ejs.render(emailVerificationTemplate, {
    name: receiver.name,
    url: link,
  });
  let msg = {
    to: receiver.email,
    from: 'Insemble Terminal <no-reply@insemble.co>',
    subject: 'Forgot password user Insemble Terminal',
    text: `We received a request to reset the password directed to this e-mail address. Please proceed by clicking this link : ${link}`,
    html: htmlContent,
  };
  await sgMail.send(msg);
}

async function sendContactUsEmail(
  sender: { email: string; name: string; company: string },
  message: string,
) {
  let htmlContent = ejs.render(contactUs, {
    name: sender.name,
    email: sender.email,
    company: sender.company,
    message,
  });
  let msg = {
    to: CONTACT_PERSON,
    from: 'Insemble Terminal <no-reply@insemble.co>',
    subject: `[Sales Lead] ${sender.name}`,
    text: `${sender.email} made a contact with us.`,
    html: htmlContent,
  };
  await sgMail.send(msg);
}

async function sendFeedbackEmail(
  sender: { email: string; name: string },
  feedbackContent: { title: string; detail: string; feed: string },
) {
  let htmlContent = ejs.render(feedback, {
    name: sender.name,
    email: sender.email,
    title: feedbackContent.title,
    detail: feedbackContent.detail,
    feed: feedbackContent.feed,
  });
  let msg = {
    to: SUPPORT_EMAIL,
    from: 'Insemble Terminal <no-reply@insemble.co>',
    subject: `[Feedback] ${sender.name}`,
    text: `${sender.email} made a Feedback.`,
    html: htmlContent,
  };
  await sgMail.send(msg);
}

export {
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendContactUsEmail,
  sendFeedbackEmail,
};
