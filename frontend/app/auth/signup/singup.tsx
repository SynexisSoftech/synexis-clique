"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { signupUser } from "../../../service/authApi" // Adjust path as needed
import { useRouter } from "next/navigation"

export default function SignupForm() {
  const [profileImage, setProfileImage] = useState<string | null>(null) // Stores Base64 string
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

    const userData = {
      email,
      password,
      username,
      photoBase64: profileImage,
    }

    try {
      const response = await signupUser(userData) // Backend response structure: { message: "...", tempUserData: { ... } }

      setSuccessMessage(response.message || "OTP sent to your email. Please verify.")
 sessionStorage.setItem('tempUserDataForVerification', JSON.stringify(response.tempUserData)); // Store the tempUserData
  sessionStorage.setItem('verificationEmail', email); // Also store email explicitly if needed
      // Use the email directly from the form submission for the query parameter
      // The backend's signup response doesn't need to return 'email' at the top level.
      const queryParams = new URLSearchParams({
        email: email, // Use the email from the form for the URL
      }).toString()

      // Redirect to the OTP verification page
      router.push(`/auth/verify-signup?${queryParams}`)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Signup failed. Please try again."
      setError(errorMessage)
      console.error("Signup error:", err)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Image section */}
      <div className="relative h-48 w-full sm:h-56 md:h-64 lg:h-auto lg:w-2/5">
        <Image src="/auth/login.png" alt="Login background" fill className="object-cover" priority />
      </div>

      {/* Signup Form section */}
      <div className="flex w-full items-center justify-center bg-white p-4 sm:p-6 md:p-8 lg:w-3/5 lg:p-12">
        <div className="w-full max-w-md space-y-6 py-6 sm:max-w-lg">
          <div className="text-center">
            <h1 className="mb-8 text-2xl font-bold tracking-[0.2em] text-gray-900 sm:text-3xl">SIGN UP</h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-700">
                EMAIL
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="h-12 w-full min-w-[160px] rounded-none border-0 border-b border-gray-300 bg-transparent px-0 py-3 text-sm placeholder:text-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-0 sm:h-14 lg:h-[62px]"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-700"
              >
                PASSWORD
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="h-12 w-full min-w-[160px] rounded-none border-0 border-b border-gray-300 bg-transparent px-0 py-3 text-sm placeholder:text-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-0 sm:h-14 lg:h-[62px]"
                required
              />
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-700"
              >
                USERNAME
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                className="h-12 w-full min-w-[160px] rounded-none border-0 border-b border-gray-300 bg-transparent px-0 py-3 text-sm placeholder:text-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-0 sm:h-14 lg:h-[62px]"
                required
              />
            </div>

            {/* Upload Profile Photo Section */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-700">
                PROFILE PHOTO
              </Label>
              {profileImage ? (
                <div className="relative h-[180px] w-full">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[6px] border border-[#6F4E37]">
                    <Image
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile preview"
                      width={150}
                      height={150}
                      className="h-auto max-h-full w-auto max-w-full object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleDeleteImage}
                    className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white p-0 text-gray-700 shadow-md hover:bg-gray-100"
                    aria-label="Delete image"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-[180px] w-full flex-col items-center justify-center gap-4 rounded-[6px] border-2 border-dashed border-[#6F4E37] px-4 py-6">
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 h-7 w-7 text-[#6F4E37]" />
                    <p className="text-sm font-medium uppercase tracking-[0.1em] text-gray-700">UPLOAD PROFILE PHOTO</p>
                    <p className="mt-1 text-xs text-gray-500">Drag and drop or click to upload</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="rounded-[6px] bg-[#6F4E37] px-6 py-2 text-xs font-medium uppercase tracking-[0.1em] text-white hover:bg-[#5d4230]"
                  >
                    UPLOAD
                  </Button>
                  <input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
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

            {/* Signup Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-[6px] border-0 bg-[#6F4E37] px-4 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-none transition-colors duration-200 hover:bg-[#5d4230] disabled:opacity-50 sm:h-14"
              >
                {isLoading ? "SIGNING UP..." : "SIGN UP"}
              </Button>
            </div>

            {/* Already have account link */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Already have an Account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold uppercase tracking-[0.1em] text-gray-800 transition-colors hover:text-gray-900"
                >
                  LOG IN
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}