require('dotenv').config({ quiet: true });
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '127.0.0.1',
  port: Number(process.env.SMTP_PORT) || 1025,
});

const delayMs = Number(process.env.MAIL_DELAY_MS) || 0;

async function send({ to, subject, text }) {
  if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
  try {
    await transport.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
  } catch (error) {
    throw error;
  }
}

module.exports = { send };
