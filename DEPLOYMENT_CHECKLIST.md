# 🚀 Deployment Checklist for Clique E-Commerce

## ✅ Pre-Deployment Security Checklist

### 🔐 Environment Variables Setup

#### Backend (.env file)
- [ ] **MONGODB_URI** - Production MongoDB connection string
- [ ] **ACCESS_TOKEN_SECRET** - Generate secure 32-byte hex string
- [ ] **REFRESH_TOKEN_SECRET** - Generate secure 32-byte hex string  
- [ ] **SESSION_SECRET** - Generate secure 32-byte hex string
- [ ] **CORS_ORIGIN** - Your production frontend URL
- [ ] **API_BASE_URL** - Your production API URL

#### eSewa Payment Gateway
- [ ] **ESEWA_SECRET_KEY** - Production eSewa secret key
- [ ] **ESEWA_PRODUCT_CODE** - Production eSewa product code
- [ ] **ESEWA_MERCHANT_ID** - Production eSewa merchant ID
- [ ] **ESEWA_SUCCESS_URL** - Production success URL
- [ ] **ESEWA_FAILURE_URL** - Production failure URL

#### Cloudinary Configuration
- [ ] **CLOUDINARY_CLOUD_NAME** - Your Cloudinary cloud name
- [ ] **CLOUDINARY_API_KEY** - Your Cloudinary API key
- [ ] **CLOUDINARY_API_SECRET** - Your Cloudinary API secret
- [ ] **CLOUDINARY_DEFAULT_AVATAR_URL** - Update with your cloud name

#### Email Configuration
- [ ] **EMAIL_HOST** - SMTP server host
- [ ] **EMAIL_PORT** - SMTP port (587 or 465)
- [ ] **EMAIL_SECURE** - true for 465, false for 587
- [ ] **EMAIL_USER** - SMTP username
- [ ] **EMAIL_PASS** - SMTP password or app password
- [ ] **EMAIL_FROM** - Sender email address

#### Monitoring
- [ ] **ADMIN_EMAIL** - Admin notification email
- [ ] **MONITORING_EMAIL** - System monitoring email
- [ ] **AUDIT_LOG_LEVEL** - Set to 'info' or 'warn' for production

### 🔒 Security Hardening

#### JWT Secrets Generation
```bash
# Generate secure secrets using Node.js
node -e "console.log('ACCESS_TOKEN_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

#### Environment Configuration
- [ ] Set `NODE_ENV=production`
- [ ] Remove all development/test environment variables
- [ ] Ensure no hardcoded secrets remain in code
- [ ] Verify CORS origin is set to production URL only

### 🌐 Frontend Configuration

#### Environment Variables (.env.local)
- [ ] **NEXT_PUBLIC_API_URL** - Production backend URL
- [ ] Remove all test/development variables
- [ ] Ensure no hardcoded URLs remain

### 🗄️ Database Security

#### MongoDB
- [ ] Use production MongoDB instance (Atlas, etc.)
- [ ] Enable authentication
- [ ] Configure IP whitelist
- [ ] Enable SSL/TLS connections
- [ ] Set up database backups

### 🔐 Payment Gateway Security

#### eSewa Production Setup
- [ ] Get production credentials from eSewa
- [ ] Configure production webhook URLs
- [ ] Set up IP whitelist for eSewa webhooks
- [ ] Test payment flow in production environment

### 📧 Email Service Security

#### SMTP Configuration
- [ ] Use production SMTP service (SendGrid, Mailgun, etc.)
- [ ] Enable 2FA on email account
- [ ] Use app-specific passwords
- [ ] Configure SPF/DKIM records

### 🛡️ Server Security

#### General Security
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure CORS properly

#### Environment Variables Protection
- [ ] Never commit .env files to version control
- [ ] Use environment variable management in deployment platform
- [ ] Rotate secrets regularly
- [ ] Monitor for secret exposure

### 📋 Deployment Steps

1. **Environment Setup**
   ```bash
   # Copy environment template
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env.local
   
   # Edit with production values
   nano backend/.env
   nano frontend/.env.local
   ```

2. **Build and Test**
   ```bash
   # Backend
   cd backend
   npm install
   npm run build
   npm test
   
   # Frontend
   cd frontend
   npm install
   npm run build
   ```

3. **Deploy**
   - Deploy backend to your hosting platform
   - Deploy frontend to your hosting platform
   - Configure environment variables in hosting platform

4. **Post-Deployment Verification**
   - [ ] Test user registration/login
   - [ ] Test payment flow
   - [ ] Test email functionality
   - [ ] Verify CORS is working
   - [ ] Check security headers
   - [ ] Monitor error logs

### 🚨 Critical Security Reminders

- **NEVER** commit .env files to version control
- **ALWAYS** use HTTPS in production
- **REGULARLY** rotate secrets and API keys
- **MONITOR** logs for security issues
- **BACKUP** database regularly
- **UPDATE** dependencies regularly

### 📞 Support

If you encounter issues during deployment:
1. Check the application logs
2. Verify all environment variables are set
3. Test each service individually
4. Contact the development team

---

**⚠️ IMPORTANT**: This checklist must be completed before going live. Missing any item could result in security vulnerabilities or application failures. 