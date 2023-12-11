require("dotenv").config();
const nodemailer = require("nodemailer");

const { BREVO, SENDER_EMAIL, RECEIVER_EMAIL, SMTP } = process.env;

const nodemailerConfig = {
  host: SMTP,
  port: 587,
  secure: false,
  ignoreTLS: true,
  auth: {
    user: SENDER_EMAIL,
    pass: BREVO,
  },
};

const transporter = nodemailer.createTransport(nodemailerConfig);

const sendEmail = (cartData) => {
  const email = {
    to: [RECEIVER_EMAIL],
    from: SENDER_EMAIL,
    subject: `Замовлення ${cartData._id}`,
    html: `
      <div>
        <p>Телефон замовника: ${cartData.phone}</p>
        <p>Кількість: ${cartData.quantity}</p>
        <div>
          Товар:
          <ul>
            ${Object.entries(cartData.product)
              .map(([key, value]) => `<li>${key}: ${value}</li>`)
              .join("")}
          </ul>
        </div>
        <p>ID Замовлення: ${cartData._id}</p>
        <p>Створено: ${cartData.createdAt}</p>
        <p>Редаговано: ${cartData.updatedAt}</p>
        <p>Версія: ${cartData.__v}</p>
      </div>
    `,
  };
  transporter.sendMail(email);
};

module.exports = sendEmail;
