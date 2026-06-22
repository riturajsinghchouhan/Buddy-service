import nodemailer from 'nodemailer';
import { env } from '../../../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.emailHost,
  port: env.emailPort,
  secure: env.emailPort === 465,
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const fromName = env.emailFromName || 'Appzeto';
    const fromAddress = env.emailFrom || env.emailUser || 'noreply@example.com';
    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
