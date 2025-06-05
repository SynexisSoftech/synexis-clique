// pages/auth/login.tsx or components/LoginForm.tsx
"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext"; // Ensure this path is correct

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Get everything we need from the AuthContext!
  const { login, error: authError, isLoading: isAuthLoading } = useAuth();

  // Local state to manage form-specific submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the login function from the context
      await login({ email, password });
      
      // The context will handle success and redirection automatically.
      // No need to do anything here!

    } catch (err) {
      // The context now handles the error message, but we catch it here
      // to know that the submission failed and stop the loading indicator.
      console.log("Login submission failed in component.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Image section (no changes) */}
      <div className="relative h-40 w-full sm:h-56 md:h-64 lg:h-auto lg:w-2/5">
        <Image
          src="/auth/login.png"
          alt="Login background"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
        />
      </div>

      {/* Login Form section */}
      <div className="flex w-full items-center justify-center bg-white px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:w-3/5 lg:px-12 lg:py-20">
        <div className="w-full max-w-sm space-y-8 sm:max-w-md lg:max-w-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-[0.2em] text-gray-900 sm:text-3xl lg:text-4xl">LOGIN</h1>
          </div>

          {/* Display the error from the AuthContext */}
          {authError && (
            <div className="rounded-md bg-red-50 p-4" role="alert">
              <p className="text-sm text-red-700">{authError}</p>
            </div>
          )}

          <form className="space-y-8 sm:space-y-10" onSubmit={handleSubmit}>
            {/* Email Field (no changes) */}
            <div className="space-y-3">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-700 sm:text-sm"
              >
                EMAIL
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-0 sm:py-4 sm:text-base"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field (no changes) */}
            <div className="space-y-3">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-700 sm:text-sm"
              >
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-0 sm:py-4 sm:text-base"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-6 sm:pt-8">
              <button
                type="submit"
                disabled={isSubmitting} // Use local form submission state
                aria-busy={isSubmitting}
                className="w-full rounded-md bg-[#6F4E37] px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#5d4230] focus:outline-none focus:ring-2 focus:ring-[#6F4E37] focus:ring-offset-2 sm:py-4 sm:text-base disabled:opacity-70"
              >
                {isSubmitting ? "LOGGING IN..." : "LOGIN"}
              </button>
            </div>

            {/* Links (no changes) */}
            <div className="space-y-6 pt-4 text-center sm:pt-6">
              <Link
                href="/auth/forgot-password"
                className="block text-xs uppercase tracking-[0.1em] text-gray-600 transition-colors hover:text-gray-800 sm:text-sm"
              >
                FORGOT PASSWORD?
              </Link>

              <p className="text-xs text-gray-600 sm:text-sm">
                Not Registered Yet?{" "}
                <Link
                  href="/auth/signup"
                  className="font-semibold uppercase tracking-[0.1em] text-gray-800 transition-colors hover:text-gray-900"
                >
                  SIGN UP
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}