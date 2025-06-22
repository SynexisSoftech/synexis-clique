/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Initiate user signup process
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - photoBase64
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
 *               photoBase64:
 *                 type: string
 *                 description: Base64 encoded profile image
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tempUserData:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     password:
 *                       type: string
 *                     photoURL:
 *                       type: string
 *       409:
 *         description: User with this email already exists and is verified
 *       500:
 *         description: Signup failed
 */

/**
 * @swagger
 * /auth/verify-signup-otp:
 *   post:
 *     summary: Verify OTP and complete user registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - tempUserData
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: ABC123
 *               tempUserData:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   password:
 *                     type: string
 *                   photoURL:
 *                     type: string
 *     responses:
 *       201:
 *         description: Account created and verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid or expired OTP
 *       409:
 *         description: User already verified
 *       500:
 *         description: Verification failed
 */

/**
 * @swagger
 * /auth/resend-signup-otp:
 *   post:
 *     summary: Resend signup verification OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: New OTP sent successfully
 *       400:
 *         description: Email already verified
 *       500:
 *         description: Failed to resend OTP
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not verified
 *       500:
 *         description: Login failed
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Initiate password reset process
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset OTP sent if account exists
 *       500:
 *         description: Forgot password request failed
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Complete password reset process
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: XYZ789
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePassword456!
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Password reset failed
 */

/**
 * @swagger
 * /auth/resend-forgot-password-otp:
 *   post:
 *     summary: Resend password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: New password reset OTP sent
 *       500:
 *         description: Failed to resend OTP
 */
import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import {
  signupValidationRules,
  verifyOtpAndCreateUserRules, // Use this for the verify step
  loginValidationRules,
  emailOnlyRules,
  resetPasswordRules,
  updateProfileRules,
  changePasswordRules,
  validate // The middleware function to process validation results
} from '../middleware/validate';
import { authActionLimiter, otpGenerationLimiter } from '../middleware/rateLimiter';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Signup Process
router.post(
    '/signup',
    otpGenerationLimiter, // Limit OTP generation aspect of signup
    signupValidationRules(),
    validate,
    AuthController.signup
);
router.post(
    '/verify-signup-otp', // Changed route name for clarity
    authActionLimiter,
    verifyOtpAndCreateUserRules(), // Correct validation rule
    validate,
    AuthController.verifySignupOtpAndCreateUser
);
router.post(
    '/resend-signup-otp',
    otpGenerationLimiter,
    emailOnlyRules(),
    validate,
    AuthController.resendSignupOtp
);

// Login
router.post(
    '/login',
    authActionLimiter,
    loginValidationRules(),
    validate,
    AuthController.login
);

// Password Reset Process
router.post(
    '/forgot-password',
    otpGenerationLimiter,
    emailOnlyRules(),
    validate,
    AuthController.forgotPassword
);
router.post(
    '/reset-password',
    authActionLimiter,
    resetPasswordRules(),
    validate,
    AuthController.resetPassword
);
router.post(
    '/resend-forgot-password-otp',
    otpGenerationLimiter,
    emailOnlyRules(),
    validate,
    AuthController.resendForgotPasswordOtp
);
// --- Get Authenticated User Details ---
// This route is protected. Only authenticated users can access it.
router.get(
    '/me',
    protect, // Apply the protect middleware here
    AuthController.getUserDetails
);

// --- Refresh Access Token ---
// This route uses the refresh token (typically from an HttpOnly cookie) to get a new access token.
// It's usually not protected by the JWT 'protect' middleware itself, as the access token might be expired.
router.post(
    '/refresh-token',
    AuthController.refreshTokenHandler
);

// --- Logout ---
// This route clears the refresh token cookie
router.post(
    '/logout',
    AuthController.logout
);

// --- Update Profile ---
// This route is protected and allows users to update their profile information
router.put(
    '/profile',
    protect,
    updateProfileRules(),
    validate,
    AuthController.updateProfile
);

// --- Change Password ---
// This route is protected and allows users to change their password
router.put(
    '/change-password',
    protect,
    changePasswordRules(),
    validate,
    AuthController.changePassword
);

export default router;
