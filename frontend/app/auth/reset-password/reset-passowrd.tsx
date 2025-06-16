// app/auth/reset-password/page.tsx

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { resetPasswordConfirm, resendForgotPasswordOtpRequest } from "../../../service/authApi" // Import the new resend function

export default function ResetPasswordForm() {
  const [email, setEmail] = useState<string>("")
  const [otp, setOtp] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false); // New state for resend button
  const [resendTimer, setResendTimer] = useState(0); // New state for resend countdown
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam)); // Decode the email
    }
  }, [searchParams]);

  // Timer for resend OTP functionality
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (resendTimer > 0) {
      timerId = setTimeout(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timerId);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      setIsSubmitting(false)
      return
    }

    if (!email || !otp || !newPassword) {
      setError("All fields are required.")
      setIsSubmitting(false)
      return;
    }

    try {
      const resetData = {
        email,
        otp,
        newPassword,
      }
      const response = await resetPasswordConfirm(resetData)
      setSuccessMessage(response.message || "Password reset successfully! You can now log in with your new password.")
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000); 

    } catch (err: any) {
      const errorMessage = err.message || "Failed to reset password. Please try again."
      setError(errorMessage)
      console.error("Reset password error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email) {
      setError("Please provide your email to resend OTP.");
      return;
    }
    setIsResendingOtp(true);
    setResendTimer(60); // Start 60-second countdown
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await resendForgotPasswordOtpRequest(email);
      setSuccessMessage(response.message || "A new OTP has been sent to your email.");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to resend OTP. Please try again.";
      setError(errorMessage);
      console.error("Resend OTP error:", err);
      setResendTimer(0); // Reset timer on error
    } finally {
      setIsResendingOtp(false);
    }
  };


  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
        <div className="text-center space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
          <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold tracking-[0.05em] sm:tracking-[0.1em] text-gray-900 leading-tight mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              RESET YOUR PASSWORD
            </h1>
            <p className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg text-gray-600 leading-relaxed px-2 sm:px-4 md:px-6 lg:px-8">
              Enter the OTP sent to your email and your new password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 md:space-y-10">
          <div className="flex justify-center">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl space-y-4">
              <Label htmlFor="email" className="sr-only">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 sm:h-12 md:h-14 lg:h-16 xl:h-[62px] px-0 py-3 sm:py-4 text-sm sm:text-base md:text-lg lg:text-xl border-0 border-b-2 border-gray-300 rounded-none bg-transparent focus:border-[#6F4E37] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base transition-colors"
                disabled={!!searchParams.get('email')}
              />

              <Label htmlFor="otp" className="sr-only">OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full h-10 sm:h-12 md:h-14 lg:h-16 xl:h-[62px] px-0 py-3 sm:py-4 text-sm sm:text-base md:text-lg lg:text-xl border-0 border-b-2 border-gray-300 rounded-none bg-transparent focus:border-[#6F4E37] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base transition-colors"
              />

              <Label htmlFor="new-password" className="sr-only">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full h-10 sm:h-12 md:h-14 lg:h-16 xl:h-[62px] px-0 py-3 sm:py-4 text-sm sm:text-base md:text-lg lg:text-xl border-0 border-b-2 border-gray-300 rounded-none bg-transparent focus:border-[#6F4E37] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base transition-colors"
              />

              <Label htmlFor="confirm-password" className="sr-only">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-10 sm:h-12 md:h-14 lg:h-16 xl:h-[62px] px-0 py-3 sm:py-4 text-sm sm:text-base md:text-lg lg:text-xl border-0 border-b-2 border-gray-300 rounded-none bg-transparent focus:border-[#6F4E37] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="rounded-md bg-green-50 p-3 text-center">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting || !email || !otp || !newPassword || !confirmPassword}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl h-10 sm:h-12 md:h-14 lg:h-16 xl:h-[40px] bg-[#6F4E37] hover:bg-[#5d4230] disabled:opacity-50 text-white font-semibold rounded-[4px] sm:rounded-[6px] uppercase tracking-[0.05em] sm:tracking-[0.1em] text-xs sm:text-xs md:text-sm lg:text-sm transition-colors duration-200 shadow-none border-0 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
            >
              {isSubmitting ? "RESETTING..." : "RESET PASSWORD"}
            </Button>
          </div>
          
          {/* Resend OTP Button */}
          <div className="flex justify-center mt-4">
            <Button
              type="button" // Important: type="button" to prevent form submission
              onClick={handleResendOtp}
              disabled={isResendingOtp || resendTimer > 0 || !email}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl h-10 sm:h-12 md:h-14 lg:h-16 xl:h-[40px] bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 font-semibold rounded-[4px] sm:rounded-[6px] uppercase tracking-[0.05em] sm:tracking-[0.1em] text-xs sm:text-xs md:text-sm lg:text-sm transition-colors duration-200 shadow-none border-0 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
            >
              {isResendingOtp ? "SENDING..." : resendTimer > 0 ? `RESEND OTP (${resendTimer}s)` : "RESEND OTP"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}