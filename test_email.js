import nodemailer from "nodemailer";
import "dotenv/config"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_MY_EMAIL,
    pass: process.env.GMAIL_APP_PASS
  }
});

await transporter.sendMail({
  from: process.env.GMAIL_MY_EMAIL,
  to: "jeetkumarprasad69@gmail.com",
  subject: "Test Email",
  text: "Hello from backend!"
});
