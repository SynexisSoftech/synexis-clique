"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Upload,
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Camera,
  CheckCircle,
  AlertCircle,
  HomeIcon,
  UserPlus,
} from "lucide-react"
import { signupUser } from "../../../service/authApi" // Adjust path as needed
import { useRouter } from "next/navigation"

export default function SignupForm() {
  const [profileImage, setProfileImage] = useState<string | null>(null) // Stores Base64 string
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteImage = () => {
    setProfileImage(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string // Get email from form data
    const password = formData.get("password") as string
    const username = formData.get("username") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string

    const userData = {
      email,
      password,
      username,
      firstName,
      lastName,
      photoBase64: profileImage,
    }

    try {
      const response = await signupUser(userData) // Backend response structure: { message: "...", tempUserData: { ... } }

      setSuccessMessage(response.message || "OTP sent to your email. Please verify.")
      sessionStorage.setItem("tempUserDataForVerification", JSON.stringify(response.tempUserData)) // Store the tempUserData
      sessionStorage.setItem("verificationEmail", email) // Also store email explicitly if needed
      // Use the email directly from the form submission for the query parameter
      // The backend's signup response doesn't need to return 'email' at the top level.
      const queryParams = new URLSearchParams({
        email: email, // Use the email from the form for the URL
      }).toString()

      // Redirect to the OTP verification page
      router.push(`/auth/verify-signup?${queryParams}`)
    } catch (err: any) {
      // Handle validation errors from backend
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Format validation errors
        const errorMessages = err.response.data.errors.map((error: any) => {
          const field = Object.keys(error)[0];
          return `${field}: ${error[field]}`;
        }).join(', ');
        setError(errorMessages);
      } else {
        const errorMessage = err.response?.data?.message || err.message || "Signup failed. Please try again."
        setError(errorMessage)
      }
      console.error("Signup error:", err)
    } finally {
      setIsLoading(false)
    }
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
            alt="Signup background"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 0vw, 50vw"
          />
          <div className="absolute inset-0 z-20 flex items-end p-12">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Join Our Community</h2>
              <p className="text-lg opacity-90 drop-shadow">Create your account and start your journey with us</p>
            </div>
          </div>
        </div>

        {/* Signup Form section */}
        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 xl:w-2/5">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#6F4E37] to-[#5d4230] mb-6 shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-600">Join us and start your journey today</p>
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
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* First Name Field */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-3">
                  First Name
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors duration-200" />
                  </div>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Last Name Field */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-3">
                  Last Name
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors duration-200" />
                  </div>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                  Username (Optional)
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors duration-200" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username (or leave empty to auto-generate)"
                    className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-generate from your first and last name
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors duration-200" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="w-full pl-12 pr-12 py-4 text-gray-900 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 focus:outline-none placeholder:text-gray-400 group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Profile Photo Upload */}
              <div className="space-y-2">
                <Label className="block text-sm font-semibold text-gray-700 mb-3">Profile Photo (Optional)</Label>
                {profileImage ? (
                  <div className="relative">
                    <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-[#6F4E37]/20 bg-gray-50">
                      <Image
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile preview"
                        width={180}
                        height={180}
                        className="h-auto max-h-full w-auto max-w-full object-contain rounded-lg"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleDeleteImage}
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 p-0 text-white shadow-lg hover:bg-red-600 transition-colors duration-200"
                      aria-label="Delete image"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex h-48 w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 transition-all duration-300 hover:border-[#6F4E37]/50 hover:bg-[#6F4E37]/5">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#6F4E37]/10 mb-4">
                          <Camera className="h-6 w-6 text-[#6F4E37]" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Upload Profile Photo (Optional)</p>
                        <p className="text-xs text-gray-500">Drag and drop or click to browse</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="rounded-lg bg-[#6F4E37] px-6 py-2 text-sm font-medium text-white hover:bg-[#5d4230] transition-colors duration-200 shadow-sm"
                        disabled={isLoading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>

              {/* Signup Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#6F4E37] to-[#5d4230] px-6 py-4 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#6F4E37]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className={`transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}>
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </span>
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  </div>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-6 border-t border-gray-100">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-[#6F4E37] hover:text-[#5d4230] transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>

            {/* Terms Notice */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="text-[#6F4E37] hover:text-[#5d4230] font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#6F4E37] hover:text-[#5d4230] font-medium">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
