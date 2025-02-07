import nodemailer from "nodemailer";// install to send Email 

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_EMAIL, // Your email
      pass: process.env.SMTP_PASSWORD, // Your email password or App Password
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: options.email,
    subject: options.subject,
    html: options.message, // Supports HTML
  };

  await transporter.sendMail(mailOptions);
};
