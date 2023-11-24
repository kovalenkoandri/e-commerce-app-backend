require('dotenv').config();
const nodemailer = require('nodemailer');

const { SENDINBLUE, SENDER_EMAIL } = process.env;

const nodemailerConfig = {
  host: "smtp-relay.sendinblue.com",
  port: 587,
  secure: false,
  ignoreTLS: true,
  auth: {
    user: SENDER_EMAIL,
    pass: SENDINBLUE,
  },
};

const transporter = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (cartData) => {
  const email = {
    to: SENDER_EMAIL,
    from: SENDER_EMAIL,
    subject: "Message title",
    text: "Plaintext version of the message",
    html: `<div>cartData ${cartData}</div>`,
  };
  await transporter.sendMail(email);
};

module.exports = sendEmail;
