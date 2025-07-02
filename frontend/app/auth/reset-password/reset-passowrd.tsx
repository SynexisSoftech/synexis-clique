"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { resetPasswordConfirm, resendForgotPasswordOtpRequest } from "../../../service/authApi"
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
  Check,
  X,
} from "lucide-react"
import Link from "next/link"

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp.trim())
}

const validatePassword = (password: string): {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
} => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const validChecks = Object.values(checks).filter(Boolean).length
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  
  if (validChecks >= 4 && checks.length) {
    strength = validChecks >= 5 ? 'strong' : 'medium'
  }

  return {
    isValid: validChecks >= 4 && checks.length,
    strength,
    checks,
  }
}

const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0
}

export default function ResetPasswordForm() {
  const [email, setEmail] = useState<string>("")
  const [otp, setOtp] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(""))

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
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

  // Real-time validation
  useEffect(() => {
    const errors: Record<string, string> = {}

    // Email validation
    if (touchedFields.email && email && !validateEmail(email)) {
      errors.email = "Please enter a valid email address"
    }

    // OTP validation
    if (touchedFields.otp && otp && !validateOTP(otp)) {
      errors.otp = "Please enter a valid 6-digit OTP"
    }

    // Password validation
    if (touchedFields.newPassword && newPassword && !passwordValidation.isValid) {
      errors.newPassword = "Password must meet all requirements"
    }

    // Confirm password validation
    if (touchedFields.confirmPassword && confirmPassword && !validateConfirmPassword(newPassword, confirmPassword)) {
      errors.confirmPassword = "Passwords do not match"
    }

    setValidationErrors(errors)
  }, [email, otp, newPassword, confirmPassword, passwordValidation, touchedFields])

  // Update password validation when password changes
  useEffect(() => {
    setPasswordValidation(validatePassword(newPassword))
  }, [newPassword])

  const handleFieldChange = (field: string, value: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }))
    
    switch (field) {
      case 'email':
        setEmail(value)
        break
      case 'otp':
        setOtp(value.replace(/\D/g, '').slice(0, 6)) // Only allow digits, max 6
        break
      case 'newPassword':
        setNewPassword(value)
        break
      case 'confirmPassword':
        setConfirmPassword(value)
        break
    }
    
    // Clear error when user starts typing
    setError(null)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Required field validation
    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!otp.trim()) {
      errors.otp = "OTP is required"
    } else if (!validateOTP(otp)) {
      errors.otp = "Please enter a valid 6-digit OTP"
    }

    if (!newPassword) {
      errors.newPassword = "Password is required"
    } else if (!passwordValidation.isValid) {
      errors.newPassword = "Password must meet all requirements"
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (!validateConfirmPassword(newPassword, confirmPassword)) {
      errors.confirmPassword = "Passwords do not match"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setError("Please fix the validation errors before submitting")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const resetData = {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
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
    if (!email.trim()) {
      setError("Please provide your email to resend OTP.")
      return
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsResendingOtp(true)
    setResendTimer(60)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await resendForgotPasswordOtpRequest(email.trim().toLowerCase())
      setSuccessMessage(response.message || "A new OTP has been sent to your email.")
    } catch (err: any) {
      const errorMessage = err.message || "Failed to resend OTP. Please try again."
      setError(errorMessage)
      console.error("Resend OTP error:", err)
      setResendTimer(0)
    } finally {
      setIsResendingOtp(false)
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordValidation.strength) {
      case 'strong': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'weak': return 'text-red-600'
      default: return 'text-gray-400'
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordValidation.strength) {
      case 'strong': return 'Strong'
      case 'medium': return 'Medium'
      case 'weak': return 'Weak'
      default: return 'Enter password'
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
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                  required
                  disabled={!!searchParams.get("email") || isSubmitting}
                  className={`w-full pl-12 pr-4 py-4 text-gray-900 bg-white border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                    validationErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#6F4E37]'
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {validationErrors.email}
                </p>
              )}
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
                  onChange={(e) => handleFieldChange('otp', e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, otp: true }))}
                  required
                  disabled={isSubmitting}
                  maxLength={6}
                  className={`w-full pl-12 pr-4 py-4 text-gray-900 bg-white border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-center tracking-widest font-mono text-lg ${
                    validationErrors.otp ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#6F4E37]'
                  }`}
                />
              </div>
              {validationErrors.otp && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {validationErrors.otp}
                </p>
              )}
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
                  onChange={(e) => handleFieldChange('newPassword', e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, newPassword: true }))}
                  required
                  disabled={isSubmitting}
                  className={`w-full pl-12 pr-12 py-4 text-gray-900 bg-white border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    validationErrors.newPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#6F4E37]'
                  }`}
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
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        passwordValidation.strength === 'strong' ? 'bg-green-500 w-full' :
                        passwordValidation.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                        passwordValidation.strength === 'weak' ? 'bg-red-500 w-1/3' : 'bg-gray-300 w-0'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              {touchedFields.newPassword && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-600 font-medium">Password requirements:</p>
                  <div className="space-y-1">
                    {[
                      { key: 'length', label: 'At least 8 characters', check: passwordValidation.checks.length },
                      { key: 'uppercase', label: 'One uppercase letter', check: passwordValidation.checks.uppercase },
                      { key: 'lowercase', label: 'One lowercase letter', check: passwordValidation.checks.lowercase },
                      { key: 'number', label: 'One number', check: passwordValidation.checks.number },
                      { key: 'special', label: 'One special character', check: passwordValidation.checks.special },
                    ].map(({ key, label, check }) => (
                      <div key={key} className="flex items-center gap-2">
                        {check ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`text-xs ${check ? 'text-green-600' : 'text-red-600'}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {validationErrors.newPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {validationErrors.newPassword}
                </p>
              )}
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
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, confirmPassword: true }))}
                  required
                  disabled={isSubmitting}
                  className={`w-full pl-12 pr-12 py-4 text-gray-900 bg-white border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#6F4E37]'
                  }`}
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
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {validateConfirmPassword(newPassword, confirmPassword) ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-600">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}

              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Reset Password Button */}
            <Button
              type="submit"
              disabled={isSubmitting || Object.keys(validationErrors).length > 0 || !email || !otp || !newPassword || !confirmPassword}
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
              type="button"
              onClick={handleResendOtp}
              disabled={isResendingOtp || resendTimer > 0 || !email || !validateEmail(email)}
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
