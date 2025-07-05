// services/otp.service.ts
import bcrypt from 'bcrypt';
import OtpVerificationModel, { OtpPurpose } from '../models/OtpVerification';
import { sendActualEmail, sendRegistrationVerificationEmail, sendForgotPasswordOtpEmail } from './email.service';

const OTP_EXPIRY_MINUTES = 10;
const SALT_ROUNDS_OTP = 10;

export const generateAndStoreOtp = async (
    email: string,
    purpose: OtpPurpose,
    username?: string
): Promise<{ success: boolean; plainOtp?: string; message: string }> => {
    try {
        const plainOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        const hashedOtp = await bcrypt.hash(plainOtp, SALT_ROUNDS_OTP);

        await OtpVerificationModel.deleteMany({ email, purpose });
        await OtpVerificationModel.create({ email, otp: hashedOtp, purpose, expiresAt });

        // Use beautiful email templates based on purpose
        if (purpose === OtpPurpose.SIGNUP_VERIFICATION) {
            if (!username) {
                throw new Error('Username is required for registration verification email');
            }
            await sendRegistrationVerificationEmail(email, plainOtp, username);
        } else {
            // Fallback to generic email for other purposes
            const emailSubject = `Your ${purpose.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')} Code`;
            const emailBody = `Your verification code is: <strong>${plainOtp}</strong>. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;

            await sendActualEmail(email, emailSubject, `Your verification code is: ${plainOtp}`, emailBody);
        }

        console.log(`[OTP Service] OTP for ${email} (${purpose}): ${plainOtp} (Hashed: ${hashedOtp.substring(0,10)}...)`);

        return { success: true, plainOtp, message: 'OTP generated and stored.' };
    } catch (error: any) {
        console.error('[OTP Service] Error generating/storing/sending OTP:', error);
        return { success: false, message: `Failed to generate and send OTP: ${error.message}` };
    }
};

export const verifyStoredOtp = async (
    email: string,
    plainOtpAttempt: string,
    purpose: OtpPurpose
): Promise<boolean> => {
    try {
        const otpRecord = await OtpVerificationModel.findOne({
            email,
            purpose,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (!otpRecord) return false;

        const isMatch = await bcrypt.compare(plainOtpAttempt, otpRecord.otp);
        if (isMatch) {
            await OtpVerificationModel.deleteOne({ _id: otpRecord._id });
            return true;
        }
        return false;
    } catch (error) {
        console.error('[OTP Service] Error verifying OTP:', error);
        return false;
    }
};

export const sendPasswordResetOtpByEmail = async (email: string, plainOtp: string, username: string): Promise<void> => {
    try {
        // Use beautiful forgot password email template
        await sendForgotPasswordOtpEmail(email, plainOtp, username);
        console.log(`[OTP Service] Password Reset OTP for ${email} sent successfully`);
    } catch (error: any) {
        console.error('[OTP Service] Error sending password reset OTP email:', error.message);
        throw new Error('Failed to send password reset OTP email.');
    }
};