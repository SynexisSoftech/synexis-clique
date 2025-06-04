// services/email.service.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Configure your email transporter
// You can use different services like Gmail, SendGrid, Mailgun, etc.
// For Gmail, enable "Less secure app access" or use App Passwords if 2FA is on.
// For production, consider dedicated email service providers like SendGrid, Mailgun, AWS SES.

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,      // e.g., 'smtp.gmail.com' for Gmail
  port: parseInt(process.env.EMAIL_PORT || '587', 10), // e.g., 587 or 465
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,    // Your email address
    pass: process.env.EMAIL_PASS     // Your email password or app-specific password
  },
});

export const sendActualEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER, // Your sender email
      to,
      subject,
      text,
      html: html || text, // Use HTML if provided, otherwise plain text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // For ethereal.email testing
  } catch (error: any) {
    console.error('Error sending email:', error.message);
    // You might want to re-throw the error or handle it more gracefully
    throw new Error(`Failed to send email: ${error.message}`);
  }
};