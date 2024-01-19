import nodemailer from "nodemailer";
import { User } from "../models/schema";
import CustomAPIError from "../error/custom-error";

export const sendEmails = async (userEmail: any) => {
  // fetching product details for sending product using email

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });
  try {
    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: userEmail,
      subject: "New job opening",
      text: "Hurry!!, New job Posted as per your interest. Do check that out !!",
    };

    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        console.log("lost");
        throw new CustomAPIError("Not successfully");
      } else {
        console.log("Email sent successfully");
        return;
      }
    });
  } catch (err) {
    console.log("Error");
  }
};
