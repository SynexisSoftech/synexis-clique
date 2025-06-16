"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { resetPasswordConfirm, resendForgotPasswordOtpRequest } from "../../../service/authApi" // Import the new resend function
import {
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Key,
  Lock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"

export default function ResetPasswordForm() {
  const [email, setEmail] = useState<string>("")
  const [otp, setOtp] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false) // New state for resend button
  const [resendTimer, setResendTimer] = useState(0) // New state for resend countdown
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam)) // Decode the email
    }
  }, [searchParams])

  // Timer for resend OTP functionality
  useEffect(() => {
    let timerId: NodeJS.Timeout
    if (resendTimer > 0) {
      timerId = setTimeout(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearTimeout(timerId)
  }, [resendTimer])

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
      return
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
        router.push("/auth/login")
      }, 3000)
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
      setError("Please provide your email to resend OTP.")
      return
    }
    setIsResendingOtp(true)
    setResendTimer(60) // Start 60-second countdown
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await resendForgotPasswordOtpRequest(email)
      setSuccessMessage(response.message || "A new OTP has been sent to your email.")
    } catch (err: any) {
      const errorMessage = err.message || "Failed to resend OTP. Please try again."
      setError(errorMessage)
      console.error("Resend OTP error:", err)
      setResendTimer(0) // Reset timer on error
    } finally {
      setIsResendingOtp(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Back to Login Link */}
      <Link
        href="/auth/login"
        className="fixed top-6 left-6 z-10 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-700 shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Login</span>
      </Link>

      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#6F4E37] to-[#5d4230] mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Reset Your Password</h1>
            <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
              Enter the OTP sent to your email and create a new secure password.
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-medium leading-relaxed">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors duration-200" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!!searchParams.get("email") || isSubmitting}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* OTP Field */}
            <div className="space-y-2">
              <Label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-3">
                Verification Code (OTP)
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors duration-200" />
                </div>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={isSubmitting}
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-center tracking-widest font-mono text-lg"
                />
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-3">
                New Password
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors duration-200" />
                </div>
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-12 py-4 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-3">
                Confirm New Password
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors duration-200" />
                </div>
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-12 py-4 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Reset Password Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !email || !otp || !newPassword || !confirmPassword}
              className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#6F4E37] to-[#5d4230] px-6 py-4 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#6F4E37]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className={`transition-opacity duration-200 ${isSubmitting ? "opacity-0" : "opacity-100"}`}>
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Reset Password
                </span>
              </span>
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Resetting...</span>
                  </div>
                </div>
              )}
            </Button>

            {/* Resend OTP Button */}
            <Button
              type="button" // Important: type="button" to prevent form submission
              onClick={handleResendOtp}
              disabled={isResendingOtp || resendTimer > 0 || !email}
              className="w-full relative overflow-hidden rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 font-semibold shadow-sm transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              <span className={`transition-opacity duration-200 ${isResendingOtp ? "opacity-0" : "opacity-100"}`}>
                <span className="flex items-center justify-center gap-2">
                  {resendTimer > 0 ? (
                    <>
                      <Clock className="w-4 h-4" />
                      Resend OTP ({resendTimer}s)
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend OTP
                    </>
                  )}
                </span>
              </span>
              {isResendingOtp && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                </div>
              )}
            </Button>

            {/* Additional Links */}
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-[#6F4E37] hover:text-[#5d4230] transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700 leading-relaxed">
                  <strong>Security Notice:</strong> Your OTP will expire in 15 minutes. Make sure to use a strong
                  password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
