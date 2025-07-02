"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "../../context/AuthContext" // Ensure this path is correct
import { HomeIcon, Eye, EyeOff, CheckCircle, AlertCircle, Info } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // Get everything we need from the AuthContext!
  const { login, error: authError, isLoading: isAuthLoading, user, isAuthenticated } = useAuth()

  // Local state to manage form-specific submission loading and messages
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [backendResponse, setBackendResponse] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)

  // Redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setBackendResponse(null) // Clear previous messages

    try {
      // Call the login function from the context
      await login({ email, password })

      // Login successful - AuthContext will handle redirect
      setBackendResponse({
        type: "success",
        message: "Login successful! Redirecting...",
      })
    } catch (err: any) {
      // Handle all types of backend errors
      console.error("Login submission failed:", err)

      let errorMessage = "An unexpected error occurred. Please try again."
      let errorType: "error" | "info" = "error"

      // Handle specific security error codes
      if (err?.response?.status === 423) {
        // Account locked
        const lockRemaining = err.response?.data?.lockRemaining || 15;
        errorMessage = `Account temporarily locked. Please try again in ${lockRemaining} minutes.`;
        errorType = "info";
      } else if (err?.response?.status === 429) {
        // Rate limited
        errorMessage = "Too many login attempts. Please wait a moment before trying again.";
        errorType = "info";
      } else if (err?.response?.status === 403 && err?.response?.data?.error === 'CSRF_TOKEN_INVALID') {
        // CSRF violation
        errorMessage = "Security token expired. Please refresh the page and try again.";
        errorType = "info";
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err?.message) {
        errorMessage = err.message
      } else if (typeof err === "string") {
        errorMessage = err
      }

      setBackendResponse({
        type: errorType,
        message: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render the form if user is already authenticated
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#6F4E37] to-[#5d4230] mb-6 shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Logged In</h2>
          <p className="text-gray-600 mb-4">Redirecting to home page...</p>
          <div className="w-8 h-8 border-2 border-[#6F4E37]/30 border-t-[#6F4E37] rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  const renderMessage = (message: { type: "success" | "error" | "info"; message: string }) => {
    const icons = {
      success: CheckCircle,
      error: AlertCircle,
      info: Info,
    }

    const colors = {
      success: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: "text-green-400",
      },
      error: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: "text-red-400",
      },
      info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        icon: "text-blue-400",
      },
    }

    const Icon = icons[message.type]
    const colorScheme = colors[message.type]

    return (
      <div
        className={`mb-6 rounded-xl ${colorScheme.bg} border ${colorScheme.border} p-4 animate-in slide-in-from-top-2 duration-300`}
        role="alert"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${colorScheme.icon}`} />
          </div>
          <div className="ml-3">
            <p className={`text-sm ${colorScheme.text} font-medium leading-relaxed`}>{message.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Home Link */}
      <Link
        href="/"
        className="fixed top-6 right-6 z-10 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-700 shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105"
      >
        <HomeIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      <div className="flex min-h-screen">
        {/* Image section */}
        <div className="relative hidden lg:flex lg:w-1/2 xl:w-3/5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6F4E37]/20 to-[#6F4E37]/5 z-10" />
          <Image
            src="/auth/login.png"
            alt="Login background"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 0vw, 50vw"
          />
          <div className="absolute inset-0 z-20 flex items-end p-12">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Welcome Back</h2>
              <p className="text-lg opacity-90 drop-shadow">Sign in to continue your journey</p>
            </div>
          </div>
        </div>

        {/* Login Form section */}
        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 xl:w-2/5">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-12">
             
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {/* Backend Response Messages */}
            {backendResponse && renderMessage(backendResponse)}

            {/* Auth Context Error (fallback) */}
            {authError && !backendResponse && (
              <div
                className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 animate-in slide-in-from-top-2 duration-300"
                role="alert"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium leading-relaxed">{authError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-4 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300"
                    required
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-4 pr-12 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300"
                    required
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-[#6F4E37] hover:text-[#5d4230] transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting || isAuthLoading}
                aria-busy={isSubmitting || isAuthLoading}
                className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#6F4E37] to-[#5d4230] px-6 py-4 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#6F4E37]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span
                  className={`transition-opacity duration-200 ${isSubmitting || isAuthLoading ? "opacity-0" : "opacity-100"}`}
                >
                  Sign In
                </span>
                {(isSubmitting || isAuthLoading) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  </div>
                )}
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-6 border-t border-gray-100">
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
          </div>
        </div>
      </div>
    </div>
  )
}
