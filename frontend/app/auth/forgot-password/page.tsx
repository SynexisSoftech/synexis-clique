"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordRequest } from "../../../service/authApi" // Adjust path as needed
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await forgotPasswordRequest(email)
      setSuccessMessage(response.message || "Password reset OTP sent to your email.")

      // --- Redirect to the reset password page ---
      // Pass the email as a query parameter so the reset form can pre-fill it.
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send reset request. Please try again."
      setError(errorMessage)
      console.error("Forgot password error:", err)
    } finally {
      setIsSubmitting(false)
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
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Forgot Password?</h1>
            <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
              Enter the email address associated with your account, and we'll email you an OTP to reset your password.
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
          <form onSubmit={handleSubmit} className="space-y-8">
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
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!email || isSubmitting}
              className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#6F4E37] to-[#5d4230] px-6 py-4 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#6F4E37]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className={`transition-opacity duration-200 ${isSubmitting ? "opacity-0" : "opacity-100"}`}>
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Reset Code
                </span>
              </span>
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                </div>
              )}
            </Button>

            {/* Additional Links */}
            <div className="text-center pt-6 border-t border-gray-100 space-y-4">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-[#6F4E37] hover:text-[#5d4230] transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>

              <p className="text-gray-600">
                {"Don't have an account? "}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-[#6F4E37] hover:text-[#5d4230] transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-gray-400 mt-2" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  <strong>Having trouble?</strong> Make sure to check your spam folder for the reset email. The OTP code
                  will expire in 15 minutes for security reasons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
