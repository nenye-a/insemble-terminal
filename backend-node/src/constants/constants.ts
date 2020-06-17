import dotenv from 'dotenv';
dotenv.config();

let SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
let NODE_ENV = process.env.NODE_ENV || 'development';
let HOST = process.env.HOST || 'http://localhost:4000'; // NOTES: make sure to set HOST on the env for production
let FRONTEND_HOST = process.env.FRONTEND_HOST || 'http://localhost:4000'; // NOTES: make sure to set FRONTEND_HOST on the env for production
let API_URI = process.env.API_URI || 'http://localhost:8000';
let CONTACT_PERSON = process.env.CONTACT_PERSON || 'sales@insemblegroup.com';
let SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@insemblegroup.com';
const hostname =
  process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
const port = ((process.env.PORT as unknown) as number) || 4000;

export {
  HOST,
  NODE_ENV,
  FRONTEND_HOST,
  SENDGRID_API_KEY,
  API_URI,
  CONTACT_PERSON,
  SUPPORT_EMAIL,
  hostname,
  port,
};
