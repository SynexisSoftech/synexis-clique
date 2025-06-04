"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { verifySignupOtp } from "../../../service/authApi" // Adjust path as needed

// No need for TempUserData interface on the client-side anymore,
// as it's not passed via URL. The backend handles its retrieval.

export default function VerificationForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
const [tempUserData, setTempUserData] = useState<any>(null);
  const router = useRouter()
  const searchParams = useSearchParams()

  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)
  // New state to hold the verification token from the URL
  // const [verificationToken, setVerificationToken] = useState<string | null>(null)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    // const tokenParam = searchParams.get('verificationToken') // Retrieve the new token

    if (emailParam) {
      setVerificationEmail(emailParam)
    } else {
      setError("Verification data missing. Please try signing up again.")
      console.error("Email parameter missing for verification.")
      // Optionally redirect: router.replace('/auth/signup');
    }
const storedTempUserData = sessionStorage.getItem('tempUserDataForVerification');
  if (storedTempUserData) {
    setTempUserData(JSON.parse(storedTempUserData));
  } else {
    setError("Temporary user data missing. Please try signing up again.");
    console.error("tempUserData missing from session storage.");
  }
    // if (tokenParam) {
    //   setVerificationToken(tokenParam)
    // } else {
    //   setError("Verification token missing. Please try signing up again.")
    //   console.error("Verification token parameter missing.")
    //   // Optionally redirect: router.replace('/auth/signup');
    // }
  }, [searchParams, router])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && (/^[0-9]$/.test(value) || value === '')) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError(null)
  setSuccess(null)

  const fullOtp = otp.join("")

  if (fullOtp.length !== 6) {
    setError("Please enter a 6-digit OTP.")
    setIsLoading(false)
    return
  }

  // Ensure only email is present before proceeding if verificationToken is removed
  if (!verificationEmail) { // Simplified check
      setError("Verification data is not fully loaded. Please try again or refresh the page.");
      setIsLoading(false);
      return;
  }

  try {
    const verificationData = {
      email: verificationEmail,
      otp: fullOtp,
       tempUserData: tempUserData,
      // Remove this line:
      // verificationToken: verificationToken,
    }

    const response = await verifySignupOtp(verificationData)

    setSuccess(response.message || "Account verified successfully!")

    if (response.accessToken) {
      router.replace('/admin')
    }

  } catch (err: any) {
    console.error("Verification failed:", err)
    const errorMessage = err.message || err.toString() || "OTP verification failed. Please try again."
    setError(errorMessage)
  } finally {
    setIsLoading(false)
  }
}

// Simplify this condition:
if (!verificationEmail) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? <p className="text-red-600">{error}</p> : <p>Loading verification data...</p>}
    </div>
  )
}

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Main heading section */}
        <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-[0.05em] sm:tracking-[0.1em] text-gray-900 leading-tight">
            ENTER THE CODE WE JUST SENT YOU
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto px-2 sm:px-0">
            Please enter the 6-digit code sent to **{verificationEmail}** to verify your account
          </p>
        </div>

        {/* OTP input section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center px-2 sm:px-0">
            <div className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 text-center text-sm sm:text-base md:text-lg lg:text-xl font-semibold border-2 border-gray-300 rounded-[4px] sm:rounded-[6px] focus:border-[#6F4E37] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  maxLength={1}
                />
              ))}
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-3 text-center">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Verify button section */}
          <div className="flex justify-center px-4 sm:px-0">
            <Button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-10 sm:h-12 md:h-14 lg:h-16 bg-[#6F4E37] hover:bg-[#5d4230] text-white font-semibold rounded-[4px] sm:rounded-[6px] uppercase tracking-[0.05em] sm:tracking-[0.1em] text-xs sm:text-sm md:text-base lg:text-lg transition-colors duration-200 shadow-none border-0"
            >
              {isLoading ? "VERIFYING..." : "VERIFY"}
            </Button>
          </div>
        </form>

        {/* Resend code section */}
        <div className="text-center px-4 sm:px-0">
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600">
            Didn't receive the code?{" "}
            <Link
              href="/resend-signup-otp-page" // You might want a dedicated page for resend logic
              className="text-gray-800 hover:text-gray-900 font-semibold uppercase tracking-[0.05em] sm:tracking-[0.1em] transition-colors"
            >
              RESEND CODE
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}