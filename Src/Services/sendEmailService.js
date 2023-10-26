import nodemailer from "nodemailer";

async function sendEmailService({
  to,
  subject,
  message,
  attachments = [],
} = {}) {
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 587, //587>>> false ,465>>true
    secure: false,
    service: "gmail",
    auth: {
      user: "abdoosama087@gmail.com",
      pass: "szngfldaoeodoevc",
    },
  });
  const emailInfo = await transporter.sendMail({
    from: '"Shopping 👻"<abdoosama087@gmail.com>',
    to: to ? to : "",
    subject: subject ? subject : "Hello",
    html: message ? message : "",
    attachments,
  });
}

export default sendEmailService;
