// app/auth/forgot-password/page.tsx

"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordRequest } from "../../../service/authApi" // Adjust path as needed
import { useRouter } from "next/navigation"

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
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);

    } catch (err: any) {
      const errorMessage = err.message || "Failed to send reset request. Please try again."
      setError(errorMessage)
      console.error("Forgot password error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
        <div className="text-center space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
          <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold tracking-[0.05em] sm:tracking-[0.1em] text-gray-900 leading-tight mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              FORGOT PASSWORD?
            </h1>
            <p className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg text-gray-600 leading-relaxed px-2 sm:px-4 md:px-6 lg:px-8">
              Enter the email address associated with your account, and we'll email you an OTP to reset your password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 md:space-y-10">
          <div className="flex justify-center">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl">
              <Label htmlFor="email" className="sr-only">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              disabled={!email || isSubmitting}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl h-10 sm:h-12 md:h-14 lg:h-16 xl:h-[40px] bg-[#6F4E37] hover:bg-[#5d4230] disabled:opacity-50 text-white font-semibold rounded-[4px] sm:rounded-[6px] uppercase tracking-[0.05em] sm:tracking-[0.1em] text-xs sm:text-xs md:text-sm lg:text-sm transition-colors duration-200 shadow-none border-0 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}