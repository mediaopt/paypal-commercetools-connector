import * as nodemailer from 'nodemailer';
import { SmtpSettings } from '../types/index.types';
import { logger } from '../utils/logger.utils';

export const sendEmail = async (
  customerEmail: string,
  subject: string,
  paymentId: string,
  emailText: string
) => {
  const transport = getTransport();
  const from = process.env['SMTP_SENDER'];
  logger.info(`Sending mail related to ${paymentId} from ${from}}`); //payment id does not directly identify the customer, but provides enough information for investigation in case if any problem appears, PayPal stores email on their side so if the problem occurs due to wrong email format - it can be traced
  return await transport.sendMail({
    from,
    to: customerEmail,
    subject,
    text: emailText,
  });
};

const getTransport = () => {
  const smtpSettings = getSMTPSettings();
  return nodemailer.createTransport({
    host: smtpSettings.host,
    port: +smtpSettings.port,
    secure: smtpSettings.port == 465,
    auth: {
      user: smtpSettings.username,
      pass: smtpSettings.password,
    },
  });
};

const getSMTPSettings = () =>
  ({
    host: process.env['SMTP_HOST'] ?? '',
    password: process.env['SMTP_PASSWORD'] ?? '',
    port: process.env['SMTP_PORT'] ?? 587,
    username: process.env['SMTP_USERNAME'] ?? '',
    sender: process.env['SMTP_SENDER'] ?? '',
  } as SmtpSettings);
