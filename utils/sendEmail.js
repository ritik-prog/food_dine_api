const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: process.env.FROM_EMAIL,
    to: options.email,
    subject: options.subject,
    message: options.message,
  };

  const info = await transporter.sendMail(message);
  console.log(info.messageId);
};

module.exports = sendMail;
