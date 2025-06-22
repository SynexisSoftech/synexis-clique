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
 * Send order confirmation email
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

  const subject = `Order Confirmation - Order #${orderId}`;
  
  // Create HTML email template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4F46E5; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .item:last-child { border-bottom: none; }
        .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #4F46E5; }
        .shipping-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .delivery-notice { background: #E0F2FE; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0288D1; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for your purchase</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${customerName}</strong>,</p>
          
          <p>Your order has been successfully confirmed and payment has been received. We're excited to prepare your items for delivery!</p>
          
          <div class="order-details">
            <h3>📋 Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Order Date:</strong> ${orderDate.toLocaleDateString()}</p>
            
            <h4>🛍️ Items Ordered:</h4>
            ${orderItems.map(item => `
              <div class="item">
                <span>${item.productTitle} × ${item.quantity}</span>
                <span>NPR ${item.price.toLocaleString()}</span>
              </div>
            `).join('')}
            
            <div class="total">
              <div class="item">
                <span>Subtotal:</span>
                <span>NPR ${subtotal.toLocaleString()}</span>
              </div>
              <div class="item">
                <span>Shipping Charge:</span>
                <span>NPR ${shippingCharge.toLocaleString()}</span>
              </div>
              <div class="item">
                <span>Tax (13%):</span>
                <span>NPR ${tax.toLocaleString()}</span>
              </div>
              <div class="item" style="font-weight: bold; font-size: 18px; border-top: 2px solid #4F46E5; padding-top: 10px; margin-top: 10px;">
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
          
          <p>If you have any questions about your order, please don't hesitate to contact our customer support team.</p>
          
          <p>Thank you for choosing us!</p>
          
          <p>Best regards,<br>
          <strong>The Synexis Clique Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${customerEmail}</p>
          <p>© 2024 Synexis Clique. All rights reserved.</p>
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
Tax (13%): NPR ${tax.toLocaleString()}
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