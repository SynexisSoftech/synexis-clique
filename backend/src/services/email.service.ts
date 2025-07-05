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

// Interface for order confirmation email data
export interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderItems: Array<{
    productTitle: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingCharge: number;
  tax: number;
  subtotal: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  transactionId: string;
  orderDate: Date;
}

/**
 * Send order confirmation email with improved design
 */
export const sendOrderConfirmationEmail = async (orderData: OrderConfirmationData): Promise<void> => {
  const { 
    orderId, 
    customerName, 
    customerEmail, 
    orderItems, 
    totalAmount, 
    shippingCharge, 
    tax, 
    subtotal, 
    shippingAddress, 
    transactionId, 
    orderDate 
  } = orderData;

  const subject = `🎉 Order Confirmed! - Order #${orderId}`;
  
  // Create beautiful HTML email template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 20px; 
          overflow: hidden; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #6F4E37 0%, #8B5A3C 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }
        .header h1 { 
          font-size: 2.5em; 
          margin-bottom: 10px; 
          position: relative;
          z-index: 1;
        }
        .header p { 
          font-size: 1.2em; 
          opacity: 0.9; 
          position: relative;
          z-index: 1;
        }
        .content { 
          padding: 40px 30px; 
          background: #fafafa;
        }
        .greeting {
          background: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          border-left: 5px solid #6F4E37;
        }
        .order-details { 
          background: white; 
          padding: 30px; 
          margin: 20px 0; 
          border-radius: 15px; 
          border: 2px solid #f0f0f0;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .order-details h3 {
          color: #6F4E37;
          font-size: 1.5em;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .order-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-size: 0.9em;
          color: #666;
          margin-bottom: 5px;
        }
        .info-value {
          font-weight: bold;
          color: #333;
        }
        .item { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          padding: 15px 0; 
          border-bottom: 1px solid #eee; 
        }
        .item:last-child { border-bottom: none; }
        .item-title {
          flex: 1;
          font-weight: 500;
        }
        .item-quantity {
          color: #666;
          font-size: 0.9em;
          margin-left: 10px;
        }
        .item-price {
          font-weight: bold;
          color: #6F4E37;
        }
        .total { 
          margin-top: 25px; 
          padding-top: 25px; 
          border-top: 2px solid #6F4E37; 
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        .total-final {
          font-weight: bold; 
          font-size: 1.3em; 
          color: #6F4E37;
          border-top: 2px solid #6F4E37;
          padding-top: 15px;
          margin-top: 15px;
        }
        .shipping-info { 
          background: white; 
          padding: 30px; 
          margin: 20px 0; 
          border-radius: 15px;
          border: 2px solid #e8f5e8;
        }
        .shipping-info h3 {
          color: #2d5a2d;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .delivery-notice { 
          background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); 
          padding: 25px; 
          border-radius: 15px; 
          margin: 20px 0; 
          border-left: 5px solid #28a745;
        }
        .delivery-notice h3 {
          color: #2d5a2d;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          color: #666; 
          font-size: 14px; 
          padding: 30px;
          background: #f8f9fa;
          border-radius: 15px;
        }
        .logo {
          font-size: 1.5em;
          font-weight: bold;
          color: #6F4E37;
          margin-bottom: 10px;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #6F4E37;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .container { margin: 10px; }
          .header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .order-info { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for your purchase</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>Your order has been successfully confirmed and payment has been received. We're excited to prepare your items for delivery!</p>
          </div>
          
          <div class="order-details">
            <h3>📋 Order Details</h3>
            <div class="order-info">
              <div class="info-item">
                <span class="info-label">Order ID</span>
                <span class="info-value">#${orderId}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Transaction ID</span>
                <span class="info-value">${transactionId}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Order Date</span>
                <span class="info-value">${orderDate.toLocaleDateString()}</span>
              </div>
            </div>
            
            <h4 style="color: #6F4E37; margin: 25px 0 15px 0;">🛍️ Items Ordered:</h4>
            ${orderItems.map(item => `
              <div class="item">
                <div>
                  <span class="item-title">${item.productTitle}</span>
                  <span class="item-quantity">× ${item.quantity}</span>
                </div>
                <span class="item-price">NPR ${item.price.toLocaleString()}</span>
              </div>
            `).join('')}
            
            <div class="total">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>NPR ${subtotal.toLocaleString()}</span>
              </div>
              <div class="total-row">
                <span>Shipping Charge:</span>
                <span>NPR ${shippingCharge.toLocaleString()}</span>
              </div>
              <div class="total-row">
                <span>VAT (13% included):</span>
                <span>NPR ${tax.toLocaleString()}</span>
              </div>
              <div class="total-row total-final">
                <span>Total Amount:</span>
                <span>NPR ${totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div class="shipping-info">
            <h3>📦 Shipping Information</h3>
            <p>
              <strong>${shippingAddress.firstName} ${shippingAddress.lastName}</strong><br>
              ${shippingAddress.address}<br>
              ${shippingAddress.city}, ${shippingAddress.province} ${shippingAddress.postalCode}<br>
              ${shippingAddress.country}
            </p>
          </div>
          
          <div class="delivery-notice">
            <h3>🚚 Delivery Information</h3>
            <p><strong>Expected Delivery:</strong> Within 3 business days</p>
            <p>We'll send you a tracking number once your order ships. You can also track your order status through your account dashboard.</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            If you have any questions about your order, please don't hesitate to contact our customer support team.
          </p>
          
          <p style="text-align: center; font-size: 1.1em; color: #6F4E37;">
            Thank you for choosing us!
          </p>
          
          <p style="text-align: center; margin-top: 20px;">
            Best regards,<br>
            <strong>The Synexis Clique Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <div class="logo">Synexis Clique</div>
          <p>This email was sent to ${customerEmail}</p>
          <p>© 2024 Synexis Clique. All rights reserved.</p>
          <div class="social-links">
            <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create plain text version
  const text = `
Order Confirmation - Order #${orderId}

Dear ${customerName},

Your order has been successfully confirmed and payment has been received. We're excited to prepare your items for delivery!

ORDER DETAILS:
Order ID: ${orderId}
Transaction ID: ${transactionId}
Order Date: ${orderDate.toLocaleDateString()}

ITEMS ORDERED:
${orderItems.map(item => `- ${item.productTitle} × ${item.quantity} - NPR ${item.price.toLocaleString()}`).join('\n')}

PRICE BREAKDOWN:
Subtotal: NPR ${subtotal.toLocaleString()}
Shipping Charge: NPR ${shippingCharge.toLocaleString()}
VAT (13% included): NPR ${tax.toLocaleString()}
Total Amount: NPR ${totalAmount.toLocaleString()}

SHIPPING INFORMATION:
${shippingAddress.firstName} ${shippingAddress.lastName}
${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.province} ${shippingAddress.postalCode}
${shippingAddress.country}

DELIVERY INFORMATION:
Expected Delivery: Within 3 business days
We'll send you a tracking number once your order ships.

If you have any questions about your order, please don't hesitate to contact our customer support team.

Thank you for choosing us!

Best regards,
The Synexis Clique Team

This email was sent to ${customerEmail}
© 2024 Synexis Clique. All rights reserved.
  `;

  try {
    await sendActualEmail(customerEmail, subject, text, html);
    console.log(`✅ Order confirmation email sent to ${customerEmail} for order ${orderId}`);
  } catch (error: any) {
    console.error(`❌ Failed to send order confirmation email to ${customerEmail}:`, error.message);
    // Don't throw error to avoid breaking the order process
  }
};

/**
 * Send beautiful registration verification email
 */
export const sendRegistrationVerificationEmail = async (email: string, otp: string, username: string): Promise<void> => {
  const subject = `🔐 Verify Your Email - Welcome to Synexis Clique!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .container { 
          max-width: 500px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 20px; 
          overflow: hidden; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #6F4E37 0%, #8B5A3C 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }
        .header h1 { 
          font-size: 2em; 
          margin-bottom: 10px; 
          position: relative;
          z-index: 1;
        }
        .header p { 
          font-size: 1.1em; 
          opacity: 0.9; 
          position: relative;
          z-index: 1;
        }
        .content { 
          padding: 40px 30px; 
          background: #fafafa;
        }
        .greeting {
          background: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          border-left: 5px solid #6F4E37;
          text-align: center;
        }
        .otp-container {
          background: white;
          padding: 30px;
          border-radius: 15px;
          margin: 20px 0;
          border: 2px solid #f0f0f0;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          text-align: center;
        }
        .otp-code {
          font-size: 3em;
          font-weight: bold;
          color: #6F4E37;
          letter-spacing: 10px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 20px;
          border-radius: 10px;
          border: 2px dashed #6F4E37;
        }
        .info-box {
          background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
          padding: 20px;
          border-radius: 15px;
          margin: 20px 0;
          border-left: 5px solid #28a745;
        }
        .info-box h3 {
          color: #2d5a2d;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          color: #666; 
          font-size: 14px; 
          padding: 30px;
          background: #f8f9fa;
          border-radius: 15px;
        }
        .logo {
          font-size: 1.5em;
          font-weight: bold;
          color: #6F4E37;
          margin-bottom: 10px;
        }
        @media (max-width: 600px) {
          .container { margin: 10px; }
          .header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .otp-code { font-size: 2em; letter-spacing: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Verify Your Email</h1>
          <p>Welcome to Synexis Clique!</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            <p>Hi <strong>${username}</strong>,</p>
            <p>Thank you for signing up with Synexis Clique! To complete your registration, please verify your email address.</p>
          </div>
          
          <div class="otp-container">
            <h3 style="color: #6F4E37; margin-bottom: 20px;">Your Verification Code</h3>
            <div class="otp-code">${otp}</div>
            <p style="color: #666; font-size: 0.9em;">Enter this 6-digit code to verify your email address</p>
          </div>
          
          <div class="info-box">
            <h3>⏰ Important Information</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 8px 0;">• This code will expire in 10 minutes</li>
              <li style="margin: 8px 0;">• If you didn't request this code, please ignore this email</li>
              <li style="margin: 8px 0;">• For security, never share this code with anyone</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin: 30px 0; color: #666;">
            If you're having trouble, you can also copy and paste this code into the verification form.
          </p>
          
          <p style="text-align: center; font-size: 1.1em; color: #6F4E37;">
            Welcome to the Synexis Clique family! 🎉
          </p>
        </div>
        
        <div class="footer">
          <div class="logo">Synexis Clique</div>
          <p>This email was sent to ${email}</p>
          <p>© 2024 Synexis Clique. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Email Verification - Welcome to Synexis Clique!

Hi ${username},

Thank you for signing up with Synexis Clique! To complete your registration, please verify your email address.

Your Verification Code: ${otp}

Enter this 6-digit code to verify your email address.

Important Information:
• This code will expire in 10 minutes
• If you didn't request this code, please ignore this email
• For security, never share this code with anyone

If you're having trouble, you can also copy and paste this code into the verification form.

Welcome to the Synexis Clique family! 🎉

Best regards,
The Synexis Clique Team

This email was sent to ${email}
© 2024 Synexis Clique. All rights reserved.
  `;

  try {
    await sendActualEmail(email, subject, text, html);
    console.log(`✅ Registration verification email sent to ${email}`);
  } catch (error: any) {
    console.error(`❌ Failed to send registration verification email to ${email}:`, error.message);
    throw error;
  }
};

/**
 * Send beautiful forgot password OTP email
 */
export const sendForgotPasswordOtpEmail = async (email: string, otp: string, username: string): Promise<void> => {
  const subject = `🔑 Reset Your Password - Synexis Clique`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .container { 
          max-width: 500px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 20px; 
          overflow: hidden; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }
        .header h1 { 
          font-size: 2em; 
          margin-bottom: 10px; 
          position: relative;
          z-index: 1;
        }
        .header p { 
          font-size: 1.1em; 
          opacity: 0.9; 
          position: relative;
          z-index: 1;
        }
        .content { 
          padding: 40px 30px; 
          background: #fafafa;
        }
        .greeting {
          background: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          border-left: 5px solid #dc3545;
          text-align: center;
        }
        .otp-container {
          background: white;
          padding: 30px;
          border-radius: 15px;
          margin: 20px 0;
          border: 2px solid #f0f0f0;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          text-align: center;
        }
        .otp-code {
          font-size: 3em;
          font-weight: bold;
          color: #dc3545;
          letter-spacing: 10px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
          background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
          padding: 20px;
          border-radius: 10px;
          border: 2px dashed #dc3545;
        }
        .security-box {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          padding: 20px;
          border-radius: 15px;
          margin: 20px 0;
          border-left: 5px solid #ffc107;
        }
        .security-box h3 {
          color: #856404;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .warning-box {
          background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
          padding: 20px;
          border-radius: 15px;
          margin: 20px 0;
          border-left: 5px solid #dc3545;
        }
        .warning-box h3 {
          color: #721c24;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          color: #666; 
          font-size: 14px; 
          padding: 30px;
          background: #f8f9fa;
          border-radius: 15px;
        }
        .logo {
          font-size: 1.5em;
          font-weight: bold;
          color: #6F4E37;
          margin-bottom: 10px;
        }
        @media (max-width: 600px) {
          .container { margin: 10px; }
          .header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .otp-code { font-size: 2em; letter-spacing: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Reset Your Password</h1>
          <p>Secure your account</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            <p>Hi <strong>${username}</strong>,</p>
            <p>We received a request to reset your password for your Synexis Clique account.</p>
          </div>
          
          <div class="otp-container">
            <h3 style="color: #dc3545; margin-bottom: 20px;">Your Password Reset Code</h3>
            <div class="otp-code">${otp}</div>
            <p style="color: #666; font-size: 0.9em;">Enter this 6-character code to reset your password</p>
          </div>
          
          <div class="security-box">
            <h3>⏰ Important Information</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 8px 0;">• This code will expire in 10 minutes</li>
              <li style="margin: 8px 0;">• You can only use this code once</li>
              <li style="margin: 8px 0;">• If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <div class="warning-box">
            <h3>🔒 Security Notice</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 8px 0;">• Never share this code with anyone</li>
              <li style="margin: 8px 0;">• Our team will never ask for this code</li>
              <li style="margin: 8px 0;">• If you're concerned about your account security, contact support immediately</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin: 30px 0; color: #666;">
            If you're having trouble, you can also copy and paste this code into the password reset form.
          </p>
          
          <p style="text-align: center; font-size: 1.1em; color: #dc3545;">
            Stay secure! 🔐
          </p>
        </div>
        
        <div class="footer">
          <div class="logo">Synexis Clique</div>
          <p>This email was sent to ${email}</p>
          <p>© 2024 Synexis Clique. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Password Reset - Synexis Clique

Hi ${username},

We received a request to reset your password for your Synexis Clique account.

Your Password Reset Code: ${otp}

Enter this 6-character code to reset your password.

Important Information:
• This code will expire in 10 minutes
• You can only use this code once
• If you didn't request this, please ignore this email

Security Notice:
• Never share this code with anyone
• Our team will never ask for this code
• If you're concerned about your account security, contact support immediately

If you're having trouble, you can also copy and paste this code into the password reset form.

Stay secure! 🔐

Best regards,
The Synexis Clique Team

This email was sent to ${email}
© 2024 Synexis Clique. All rights reserved.
  `;

  try {
    await sendActualEmail(email, subject, text, html);
    console.log(`✅ Forgot password OTP email sent to ${email}`);
  } catch (error: any) {
    console.error(`❌ Failed to send forgot password OTP email to ${email}:`, error.message);
    throw error;
  }
};