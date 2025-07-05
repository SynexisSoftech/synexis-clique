# 🔧 Backend Setup Guide - Synexis Clique

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- eSewa developer account
- Email service (Gmail, SendGrid, etc.)

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
MONGODB_URI=mongodb://localhost:27017/synexis-clique

# =============================================================================
# JWT SECRETS
# =============================================================================
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here-make-it-long-and-random

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-or-email-password
EMAIL_FROM=your-email@gmail.com

# =============================================================================
# ESEWA PAYMENT GATEWAY CONFIGURATION
# =============================================================================
ESEWA_SECRET_KEY=your-esewa-secret-key
ESEWA_PRODUCT_CODE=your-esewa-product-code
ESEWA_MERCHANT_ID=your-esewa-merchant-id

# eSewa URLs
ESEWA_SUCCESS_URL=http://localhost:3000/success
ESEWA_FAILURE_URL=http://localhost:3000/failure
ESEWA_VERIFICATION_URL=https://esewa.com.np/epay/transrec

# =============================================================================
# CLOUDINARY CONFIGURATION
# =============================================================================
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
NODE_ENV=development
PORT=5000

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
ADMIN_EMAIL=admin@yourdomain.com
MONITORING_EMAIL=monitoring@yourdomain.com
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your-session-secret-key-here
```

### 3. Get eSewa Credentials

1. **Register for eSewa Developer Account**
   - Visit [eSewa Developer Portal](https://developer.esewa.com.np)
   - Create an account and apply for merchant credentials

2. **Get Test Credentials**
   - For development, eSewa provides test credentials
   - Contact eSewa support for production credentials

3. **Configure Webhook URLs**
   - Set your success and failure URLs in eSewa dashboard
   - Ensure URLs are accessible from eSewa servers

### 4. Email Service Setup

#### Option A: Gmail
1. Enable "Less secure app access" in your Google account
2. Or use App Passwords if 2FA is enabled
3. Use your Gmail credentials in the .env file

#### Option B: SendGrid (Recommended for Production)
1. Create a SendGrid account
2. Generate an API key
3. Update .env with SendGrid settings:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

### 5. Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and secret
3. Add them to your .env file

## 🔒 Security Features

### ✅ Implemented Security Measures

1. **JWT Authentication**
   - Access tokens with short expiry
   - Refresh tokens with longer expiry
   - Secure cookie storage

2. **eSewa Payment Security**
   - IP whitelist validation
   - Signature verification
   - Timestamp validation
   - Rate limiting

3. **Email Security**
   - Beautiful, branded email templates
   - OTP expiration
   - Secure password reset flow

4. **Data Protection**
   - Password hashing with bcrypt
   - Input validation and sanitization
   - CORS protection
   - Rate limiting

## 📧 Email Templates

### 🎨 Beautiful Email Designs

The system includes professionally designed email templates:

1. **Registration Verification**
   - Welcome message with brand colors
   - Large, easy-to-read OTP code
   - Security information
   - Mobile-responsive design

2. **Password Reset**
   - Security-focused design
   - Clear instructions
   - Warning about code sharing
   - Professional branding

3. **Order Confirmation**
   - Complete order details
   - Product information
   - Shipping details
   - Payment confirmation

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 🔍 Environment Validation

The application validates your environment configuration on startup:

```bash
# Check configuration status
npm run check-config
```

## 📊 Monitoring & Alerts

### Built-in Monitoring
- Payment failure alerts
- Stock depletion notifications
- Security event logging
- Admin dashboard integration

### Dead Letter Queue
- Failed payment retry mechanism
- Exponential backoff
- Manual retry capability
- Comprehensive logging

## 🛠️ Troubleshooting

### Common Issues

1. **eSewa Integration Issues**
   - Verify credentials in .env
   - Check IP whitelist configuration
   - Ensure webhook URLs are accessible

2. **Email Not Sending**
   - Verify email credentials
   - Check SMTP settings
   - Ensure port is not blocked

3. **Database Connection**
   - Verify MongoDB URI
   - Check network connectivity
   - Ensure database is running

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-signup-otp` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Payment Endpoints
- `POST /api/orders` - Create order
- `POST /api/orders/verify-payment` - Verify eSewa payment
- `GET /api/orders/my-orders` - Get user orders

### Admin Endpoints
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product

## 🔄 Updates & Maintenance

### Regular Tasks
1. **Rotate Secrets**
   - JWT secrets
   - API keys
   - Database passwords

2. **Monitor Logs**
   - Payment failures
   - Security events
   - System performance

3. **Update Dependencies**
   - Security patches
   - Feature updates
   - Bug fixes

## 📞 Support

For technical support or questions:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

---

**⚠️ Important Security Notes:**
- Never commit .env files to version control
- Use strong, unique passwords
- Regularly update dependencies
- Monitor for security vulnerabilities
- Backup your database regularly 