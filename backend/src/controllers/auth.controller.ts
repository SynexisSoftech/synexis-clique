import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto'; // Used for generating alphanumeric OTPs for password reset
import UserModel, { IUser } from '../models/user.model'; // Assuming IUser has photoURL and role
import { OtpPurpose } from '../models/OtpVerification';
import * as OtpService from '../services/otp.service';
import * as TokenService from '../services/token.service'; // Assumes TokenService generates accessToken and refreshToken
import { uploadImageToCloudinary } from '../services/cloudinary.service'; // For handling image uploads
import { AuthRequest } from '../middleware/auth.middleware';

// --- Configuration Constants ---
// Number of salt rounds for hashing user passwords. Higher is more secure, but slower.
const SALT_ROUNDS_PASSWORD = 12;
// Number of salt rounds for hashing password reset OTPs stored on the user model.
const SALT_ROUNDS_OTP_BCRYPT = 10;

// Helper function to generate username from firstName and lastName
const generateUsername = (firstName: string, lastName: string): string => {
  const baseUsername = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  const timestamp = Date.now().toString().slice(-4);
  return `${baseUsername}${timestamp}`;
};

// --- User Signup Controller ---
/**
 * Handles the initial user signup request.
 * It checks for existing users, handles profile picture uploads,
 * hashes the password, and sends an OTP for email verification.
 * Does NOT directly create the user in the database; it prepares temporary data.
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  // Destructure required fields from the request body.
  // photoBase64 for direct image file uploads, photoUrlInput for providing a URL.
  const { username, firstName, lastName, email, password, photoBase64, photoUrlInput } = req.body;
  let photoURL: string | undefined; // This will store the final URL of the user's profile picture.

  try {
    // 1. Check if a user with this email already exists and is verified.
    // If so, a new signup attempt is not allowed for security and data integrity.
    let existingUser = await UserModel.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      res.status(409).json({ message: 'User with this email already exists and is verified.' });
      return; // Stop execution if user is already verified.
    }
    // If an existing user is found but not verified, the flow proceeds to send a new OTP,
    // allowing them to complete the verification process.

    // 2. Auto-generate username if not provided
    let finalUsername = username;
    if (!finalUsername || finalUsername.trim() === '') {
      finalUsername = generateUsername(firstName, lastName);
      console.log(`[Signup] Auto-generated username: ${finalUsername}`);
    }

    // 2. Handle Profile Picture Upload Logic
    if (photoBase64) {
      // If a base64 encoded image string is provided, upload it to Cloudinary.
      // 'user_profiles' is the folder in Cloudinary where images will be stored.
      photoURL = await uploadImageToCloudinary(photoBase64, 'user_profiles');
      console.log(`[Signup] Photo uploaded to Cloudinary: ${photoURL}`);
    } else if (photoUrlInput) {
      // If a direct URL is provided, use it.
      // In a more robust application, you might want to:
      // a) Validate the URL format thoroughly.
      // b) Fetch the image from the URL and re-upload it to your Cloudinary account
      //    for better control, security, and consistent storage.
      photoURL = photoUrlInput;
      console.log(`[Signup] Using provided photo URL: ${photoURL}`);
    } else {
      // If no photo is provided, you can set a default image URL here,
      // or return an error if a photo is mandatory for signup.
      photoURL = undefined; // Or e.g., 'https://yourdomain.com/default-profile.png';
      console.log('[Signup] No photo provided. Using default or null.');
    }

    // Optional: Enforce photo requirement.
    if (!photoURL) {
      res.status(400).json({ message: 'Photo is required: Please provide an image file or a photo URL.' });
      return;
    }

    // 3. Hash the user's password for secure storage.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS_PASSWORD);
    console.log('[Signup] Password hashed successfully.');

    // 4. Generate and store an OTP for email verification.
    // This calls a service responsible for creating the OTP record in the DB
    // and sending the email.
    const otpResult = await OtpService.generateAndStoreOtp(email, OtpPurpose.SIGNUP_VERIFICATION);

    // Check if the OTP generation/sending process was successful.
    if (!otpResult.success) {
      // If not successful, return an error message to the client.
      console.error(`[Signup] OTP generation/storage failed: ${otpResult.message}`);
      res.status(500).json({ message: otpResult.message });
      return;
    }
    console.log(`[Signup] OTP sent to ${email} for verification.`);

    // 5. Respond to the client with a success message and temporary user data.
    // This temporary data will be used in the next step (OTP verification)
    // to create the actual user record.
    res.status(200).json({
      message: 'OTP sent to your email for verification. Please check your inbox.',
      tempUserData: { username: finalUsername, firstName, lastName, email, password: hashedPassword, photoURL } // Include photoURL here
    });
  } catch (err: any) {
    // Catch any unexpected errors during the signup process.
    console.error('Signup Error:', err);
    res.status(500).json({ message: `Signup failed: ${err.message || 'An unexpected error occurred. Please try again later.'}` });
  }
};

// --- Verify Signup OTP & Create User Controller ---
/**
 * Verifies the provided OTP for signup and, if valid, creates the new user account.
 * It uses the temporary user data passed from the initial signup request.
 */
export const verifySignupOtpAndCreateUser = async (req: Request, res: Response): Promise<void> => {
  // Destructure required fields from the request body.
  // `tempUserData` contains the hashed password and photoURL from the signup step.
  const { email, otp, tempUserData } = req.body;
  const { username, firstName, lastName, password: hashedPasswordFromTemp, photoURL } = tempUserData; // Extract details from tempUserData

  try {
    // 1. Verify the OTP against the stored record.
    // This checks if the OTP is correct and not expired.
    const isOtpValid = await OtpService.verifyStoredOtp(email, otp, OtpPurpose.SIGNUP_VERIFICATION);
    if (!isOtpValid) {
      console.warn(`[Verify OTP] Invalid or expired OTP attempt for email: ${email}`);
      res.status(400).json({ message: 'Invalid or expired OTP. Please try again or resend OTP.' });
      return;
    }
    console.log(`[Verify OTP] OTP valid for ${email}.`);

    // 2. Check if the user is already verified (in case of multiple verification attempts).
    let user = await UserModel.findOne({ email });
    if (user && user.isVerified) {
      console.warn(`[Verify OTP] User ${email} already verified.`);
      res.status(409).json({ message: 'User already verified. Please log in.' });
      return;
    }

    // 3. Create or Update the User in the Database.
    if (user) {
      // If user exists but wasn't verified (e.g., they initiated signup, then waited),
      // update their details and mark as verified.
      console.log(`[Verify OTP] Updating existing unverified user: ${email}`);
      user.username = username;
      user.firstName = firstName;
      user.lastName = lastName;
      user.password = hashedPasswordFromTemp; // Use the hashed password from temp data
      user.photoURL = photoURL; // Set the photo URL
      user.isVerified = true; // Mark account as verified
      await user.save();
    } else {
      // If no user exists (typical for a first-time verification), create a new user record.
      console.log(`[Verify OTP] Creating new user: ${email}`);
      user = await UserModel.create({
        username,
        firstName,
        lastName,
        email,
        password: hashedPasswordFromTemp, // Use the hashed password from temp data
        photoURL, // Set the photo URL
        isVerified: true, // Mark account as verified
        // Default role is often 'user' if not specified in signup or model
        // If your User model has a default role, it will apply automatically.
        // If not, you might want to set it here: role: 'user',
      });
    }
    console.log(`[Verify OTP] User ${user.email} account successfully created/updated and verified.`);

    // 4. Generate Access and Refresh Tokens for the newly verified user.
    const { accessToken, refreshToken } = TokenService.generateTokens(user._id.toString());
    console.log(`[Verify OTP] Generated Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`[Verify OTP] Generated Refresh Token: ${refreshToken.substring(0, 20)}...`);

    // 5. Set the Refresh Token as an HttpOnly cookie.
    // HttpOnly: Prevents client-side JavaScript from accessing the cookie, enhancing security.
    // Secure: Ensures the cookie is only sent over HTTPS in production.
    // SameSite: 'strict' prevents the browser from sending this cookie with cross-site requests,
    //           providing protection against CSRF attacks.
    // MaxAge: Sets the expiry of the cookie (7 days in milliseconds).
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies only in production
      sameSite: 'strict', // Helps prevent CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // 6. Respond to the client with success message, access token, and user details.
    // Including photoURL and role for immediate client-side display.
    res.status(201).json({
      message: 'Account created and verified successfully! You are now logged in.',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role, // Include user's role
        photoURL: user.photoURL // Include user's profile picture URL
      }
    });
  } catch (err: any) {
    // Catch any unexpected errors during OTP verification or user creation.
    console.error('Verify OTP & Create User Error:', err);
    res.status(500).json({ message: `Verification failed: ${err.message || 'An unexpected error occurred. Please try again.'}` });
  }
};

// --- Resend Signup OTP Controller ---
/**
 * Allows a user to request a new signup OTP if the previous one expired or was not received.
 * It checks if the user is already verified to prevent unnecessary OTP generation.
 */
export const resendSignupOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body; // Only email is needed for this operation.

  try {
    // 1. Check if the user with this email is already verified.
    // If so, there's no need to resend a signup OTP.
    const user = await UserModel.findOne({ email });
    if (user && user.isVerified) {
      console.warn(`[Resend OTP] User ${email} is already verified. Cannot resend signup OTP.`);
      res.status(400).json({ message: 'This email is already verified. Please log in.' });
      return;
    }

    // 2. Generate and store a new OTP.
    // This will replace any old unverified OTPs for this email and purpose.
    const otpResult = await OtpService.generateAndStoreOtp(email, OtpPurpose.SIGNUP_VERIFICATION);
    if (!otpResult.success) {
      // If OTP generation/sending fails, return an error.
      console.error(`[Resend OTP] Failed to generate/store OTP for ${email}: ${otpResult.message}`);
      res.status(500).json({ message: otpResult.message });
      return;
    }
    console.log(`[Resend OTP] New OTP sent to ${email}.`);

    // 3. Respond with a success message.
    res.status(200).json({ message: 'A new OTP has been sent to your email. Please check your inbox.' });
  } catch (err: any) {
    // Catch any unexpected errors during the resend process.
    console.error('Resend Signup OTP Error:', err);
    res.status(500).json({ message: `Failed to resend OTP: ${err.message || 'An unexpected error occurred. Please try again.'}` });
  }
};

// --- User Login Controller ---
/**
 * Handles user login. It verifies email, password, and account verification status.
 * On successful login, it generates and sets authentication tokens.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body; // Destructure email and password from request body.

  try {
    // 1. Find the user by email.
    const user = await UserModel.findOne({ email });
    if (!user) {
      // Use a generic message to prevent email enumeration.
      console.warn(`[Login] Login attempt with non-existent email: ${email}`);
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    // 2. Check if the user's account is verified.
    if (!user.isVerified) {
      console.warn(`[Login] Login attempt for unverified account: ${email}`);
      res.status(403).json({ message: 'Account not verified. Please check your email for OTP or resend OTP.' });
      return;
    }
     if (user.isBlocked) {
      console.warn(`[Login] Login attempt for blocked account: ${email}`);
      res.status(403).json({ message: 'Sorry, your account is blocked at the moment. Please contact support for assistance.' });
      return;
    }

    // 3. Compare the provided password with the hashed password stored in the database.
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      // Use a generic message to prevent password guessing attacks.
      console.warn(`[Login] Login attempt with incorrect password for email: ${email}`);
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }
    console.log(`[Login] User ${user.email} authenticated successfully.`);

    // 4. Generate Access and Refresh Tokens.
    const { accessToken, refreshToken } = TokenService.generateTokens(user._id.toString());
    console.log(`[Login] Generated Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`[Login] Generated Refresh Token: ${refreshToken.substring(0, 20)}...`);


    // 5. Set the Refresh Token as an HttpOnly cookie.
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // 6. Respond to the client with success message, access token, and user details.
    // Include user's role and photoURL for immediate client-side display.
    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role, // Include user's role
        isBlocked: user.isBlocked,
        photoURL: user.photoURL // Include user's profile picture URL
      }
    });
  } catch (err: any) {
    // Catch any unexpected errors during the login process.
    console.error('Login Error:', err);
    res.status(500).json({ message: `Login failed: ${err.message || 'An unexpected error occurred. Please try again.'}` });
  }
};

// --- Forgot Password (Send OTP) Controller ---
/**
 * Initiates the password reset process by sending an OTP to the user's registered email.
 * It generates an alphanumeric OTP and stores a hashed version on the user model.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body; // Only email is needed for this request.

  try {
    // 1. Find the user. Only proceed if user exists and is verified.
    // Use a generic success message to avoid revealing if an email exists in the system.
    const user = await UserModel.findOne({ email });
    if (!user || !user.isVerified) {
      console.warn(`[Forgot Password] Request for non-existent or unverified email: ${email}`);
      res.status(200).json({ message: 'If an account with this email exists and is verified, a password reset OTP has been sent.' });
      return;
    }
    console.log(`[Forgot Password] Processing request for email: ${email}`);

    // 2. Generate a plain alphanumeric OTP (e.g., 6 characters).
    const plainOtp = crypto.randomBytes(3).toString('hex').toUpperCase(); // Generates a 6-character hex string (e.g., A1B2C3)
    const hashedOtp = await bcrypt.hash(plainOtp, SALT_ROUNDS_OTP_BCRYPT); // Hash the OTP for storage
    const expires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // 3. Store the hashed OTP and its expiration time on the user model.
    user.passwordResetOTP = hashedOtp;
    user.passwordResetExpires = expires;
    await user.save();
    console.log(`[Forgot Password] Hashed OTP stored for ${email}.`);

    // 4. Send the plain OTP to the user's email via the OTP service.
    await OtpService.sendPasswordResetOtpByEmail(user.email, plainOtp);
    console.log(`[Forgot Password] Password reset OTP email triggered for ${email}.`);

    // 5. Respond with a generic success message.
    res.status(200).json({ message: 'If an account with this email exists and is verified, a password reset OTP has been sent.' });

  } catch (err: any) {
    // Catch any unexpected errors.
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: `Forgot password request failed: ${err.message || 'An unexpected error occurred. Please try again.'}` });
  }
};

// --- Reset Password (Verify OTP and Update) Controller ---
/**
 * Verifies the password reset OTP and updates the user's password if the OTP is valid and not expired.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body; // Required fields for password reset.

  try {
    // 1. Find the user and ensure the OTP is still valid (not expired).
    const user = await UserModel.findOne({
      email,
      passwordResetExpires: { $gt: new Date() } // Check if the expiration date is in the future
    });

    if (!user || !user.passwordResetOTP) {
      // If user not found, OTP expired, or OTP not set, return generic error.
      console.warn(`[Reset Password] Invalid or expired OTP, or email not found for ${email}.`);
      res.status(400).json({ message: 'Invalid or expired OTP, or email not found.' });
      return;
    }

    // 2. Compare the provided plain OTP with the hashed OTP stored on the user model.
    const isOtpMatch = await bcrypt.compare(otp, user.passwordResetOTP);
    if (!isOtpMatch) {
      console.warn(`[Reset Password] Incorrect OTP provided for ${email}.`);
      res.status(400).json({ message: 'Invalid OTP.' });
      return;
    }
    console.log(`[Reset Password] OTP matched for ${email}.`);

    // 3. Hash the new password and update the user's password.
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS_PASSWORD);
    // Clear the OTP fields after successful password reset to prevent reuse.
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    console.log(`[Reset Password] Password for ${email} has been successfully updated.`);

    // 4. Respond with a success message.
    res.status(200).json({ message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (err: any) {
    // Catch any unexpected errors.
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: `Password reset failed: ${err.message || 'An unexpected error occurred. Please try again.'}` });
  }
};

// --- Resend Forgot Password OTP Controller ---
/**
 * Allows a user to request a new password reset OTP if the previous one expired or was not received.
 * This function essentially duplicates the logic of `forgotPassword` for user convenience.
 */
export const resendForgotPasswordOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body; // Only email is needed.

  try {
    // 1. Find the user. Only proceed if user exists and is verified.
    // Use a generic success message to avoid revealing if an email exists in the system.
    const user = await UserModel.findOne({ email });
    if (!user || !user.isVerified) {
      console.warn(`[Resend Forgot Password OTP] Request for non-existent or unverified email: ${email}`);
      res.status(200).json({ message: 'If an account with this email exists and is verified, a new password reset OTP has been sent.' });
      return;
    }
    console.log(`[Resend Forgot Password OTP] Processing request for email: ${email}`);

    // 2. Generate a new plain alphanumeric OTP.
    const plainOtp = crypto.randomBytes(3).toString('hex').toUpperCase();
    const hashedOtp = await bcrypt.hash(plainOtp, SALT_ROUNDS_OTP_BCRYPT);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // 3. Store the new hashed OTP and its expiration time on the user model.
    user.passwordResetOTP = hashedOtp;
    user.passwordResetExpires = expires;
    await user.save();
    console.log(`[Resend Forgot Password OTP] New hashed OTP stored for ${email}.`);

    // 4. Send the new plain OTP to the user's email.
    await OtpService.sendPasswordResetOtpByEmail(user.email, plainOtp);
    console.log(`[Resend Forgot Password OTP] New password reset OTP email triggered for ${email}.`);

    // 5. Respond with a generic success message.
    res.status(200).json({ message: 'If an account with this email exists and is verified, a new password reset OTP has been sent.' });
  } catch (err: any) {
    // Catch any unexpected errors.
    console.error('Resend Forgot Password OTP Error:', err);
    res.status(500).json({ message: `Failed to resend password reset OTP: ${err.message || 'An unexpected error occurred. Please try again.'}` });
  }
};

// --- Get User Details Controller ---
/**
 * Retrieves details for the authenticated user.
 * Uses AuthRequest to access user details populated by the 'protect' middleware.
 */
export const getUserDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    // req.user is populated by the 'protect' middleware and contains the authenticated user's data (excluding password)
    if (!req.user) {
        // This check is more of a safeguard; 'protect' middleware should handle unauthenticated access.
        res.status(401).json({ message: 'Unauthorized: User data not available.' });
        return;
    }

    try {
        // The req.user object is already populated by the protect middleware
        // with user details (excluding password, passwordResetOTP, etc., as per the .select in 'protect').
        const user = req.user; // User details are directly available

        // Optional: You might want to explicitly check isVerified status here if it's critical
        // and not already handled by a global check in `protect` or if specific routes need stricter verification.
        if (!user.isVerified) {
            console.warn(`[Get User Details] Attempt to access unverified user: ${user.email}`);
            res.status(403).json({ message: 'User account is not verified.' });
            return;
        }
          if (user.isBlocked) {
      console.warn(`[Get User Details] Blocked user attempted to retrieve details: ${user.email}`);
      // Invalidate the refresh token cookie if the user is blocked and trying to access details
      res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', expires: new Date(0) });
      res.status(403).json({ message: 'Your account is blocked. Please contact support.' });
      return;
    }
        
        console.log(`[Get User Details] Successfully retrieved details for user: ${user.email}`);
        res.status(200).json({
            message: 'User details retrieved successfully.',
            user: {
                id: user._id.toString(), // Ensure ID is sent as string
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                photoURL: user.photoURL,
                isVerified: user.isVerified,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt, // Optionally include timestamps
                updatedAt: user.updatedAt
            }
        });
    } catch (err: any) {
        // This catch block would handle unexpected errors within this controller logic,
        // though most user fetching errors would be caught by the 'protect' middleware.
        console.error('Get User Details Error:', err);
        res.status(500).json({ message: `Failed to retrieve user details: ${err.message || 'An unexpected error occurred.'}` });
    }
};

// --- Refresh Token Controller ---
/**
 * Handles refresh token requests to issue a new access token.
 */
export const refreshTokenHandler = async (req: Request, res: Response): Promise<void> => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        console.warn('[Refresh Token] No refresh token provided in cookie.');
        res.status(401).json({ message: 'Access denied. No refresh token provided.' });
        return;
    }

    try {
        const decoded = TokenService.verifyRefreshToken(incomingRefreshToken); // This service method should handle JWT verification
        if (!decoded || !decoded.userId) {
            console.warn('[Refresh Token] Invalid or expired refresh token.');
            // Clear the potentially invalid refresh token cookie
            res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', expires: new Date(0) });
            res.status(403).json({ message: 'Invalid or expired refresh token. Please log in again.' });
            return;
        }

        const user = await UserModel.findById(decoded.userId);
        if (!user || !user.isVerified) { // Also check if user is verified
            console.warn(`[Refresh Token] User not found or not verified for ID: ${decoded.userId}`);
            res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', expires: new Date(0) });
            res.status(403).json({ message: 'User not found, not verified, or refresh token revoked. Please log in again.' });
            return;
        }

          // New: Check if the user is blocked during refresh token request
    if (user.isBlocked) {
      console.warn(`[Refresh Token] Blocked user attempted to refresh token: ${user.email}`);
      // Invalidate the refresh token cookie if the user is blocked
      res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', expires: new Date(0) });
      res.status(403).json({ message: 'Your account is blocked. Please log in again or contact support.' });
      return;
    }
        // Generate new pair of tokens
        const { accessToken, refreshToken: newRefreshToken } = TokenService.generateTokens(user._id.toString());
        console.log(`[Refresh Token] New access token generated for user: ${user.email}`);

        // Set the new refresh token in HttpOnly cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.status(200).json({
            message: 'Access token refreshed successfully.',
            accessToken
        });

    } catch (err: any) {
        console.error('Refresh Token Error:', err);
        // Clear cookie on specific JWT errors too
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' || err.message?.includes('Invalid') || err.message?.includes('expired')) {
            res.cookie('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', expires: new Date(0) });
        }
        res.status(500).json({ message: `Failed to refresh token: ${err.message || 'An unexpected error occurred.'}` });
    }
};

// --- Logout Controller ---
/**
 * Handles user logout by clearing the refresh token cookie.
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear the refresh token cookie
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0) // This immediately expires the cookie
    });

    console.log('[Logout] User logged out successfully');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('Logout Error:', err);
    res.status(500).json({ message: `Logout failed: ${err.message || 'An unexpected error occurred.'}` });
  }
};

// --- Update Profile Controller ---
/**
 * Updates user profile information (firstName, lastName, photoURL)
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized: User data not available.' });
    return;
  }

  const { firstName, lastName, photoBase64 } = req.body;

  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Update firstName if provided
    if (firstName && firstName.trim() !== '') {
      if (firstName.trim().length < 2 || firstName.trim().length > 50) {
        res.status(400).json({ message: 'First name must be between 2 and 50 characters.' });
        return;
      }
      user.firstName = firstName.trim();
    }

    // Update lastName if provided
    if (lastName && lastName.trim() !== '') {
      if (lastName.trim().length < 2 || lastName.trim().length > 50) {
        res.status(400).json({ message: 'Last name must be between 2 and 50 characters.' });
        return;
      }
      user.lastName = lastName.trim();
    }

    // Handle profile picture update
    if (photoBase64) {
      try {
        const photoURL = await uploadImageToCloudinary(photoBase64, 'user_profiles');
        user.photoURL = photoURL;
        console.log(`[Update Profile] Photo uploaded to Cloudinary: ${photoURL}`);
      } catch (uploadError: any) {
        console.error('[Update Profile] Photo upload failed:', uploadError);
        res.status(500).json({ message: 'Failed to upload profile picture. Please try again.' });
        return;
      }
    }

    await user.save();

    // Return updated user data (excluding sensitive fields)
    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked
      }
    });

  } catch (err: any) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: `Profile update failed: ${err.message || 'An unexpected error occurred.'}` });
  }
};

// --- Change Password Controller ---
/**
 * Changes user password after verifying the old password
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized: User data not available.' });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: 'New password must be at least 8 characters long.' });
      return;
    }

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(400).json({ message: 'Current password is incorrect.' });
      return;
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS_PASSWORD);
    user.password = hashedNewPassword;

    await user.save();

    console.log(`[Change Password] Password changed successfully for user: ${user.email}`);
    res.status(200).json({ message: 'Password changed successfully.' });

  } catch (err: any) {
    console.error('Change Password Error:', err);
    res.status(500).json({ message: `Password change failed: ${err.message || 'An unexpected error occurred.'}` });
  }
};