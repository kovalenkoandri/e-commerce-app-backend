require('dotenv').config();
const nodemailer = require('nodemailer');

const { SENDINBLUE, SENDER_EMAIL } = process.env;

const nodemailerConfig = {
  host: "smtp-relay.sendinblue.com",
  port: 587,
  secure: false,
  ignoreTLS: true,
  auth: {
    user: "SENDER_EMAIL",
    pass: SENDINBLUE,
  },
};

const transporter = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (toMail, verificationToken) => {
  const email = {
    to: toMail,
    from: "SENDER_EMAIL",
    subject: "Message title",
    text: "Plaintext version of the message",
    html: `<a target="_blank" href="http://localhost:4000/api/users/verify/${verificationToken}">Подтвердить email</a>`,
  };
  await transporter.sendMail(email);
};

module.exports = sendEmail;
