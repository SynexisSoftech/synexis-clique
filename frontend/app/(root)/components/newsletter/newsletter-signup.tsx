"use client"

import { useState } from "react"
import { Mail, Gift, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true)
      setIsLoading(false)
      setEmail("")
    }, 1000)
  }

  if (isSubscribed) {
    return (
      <section className="py-16 bg-gradient-to-r from-brand-primary to-brand-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Thank You for Subscribing!</h2>
            <p className="text-lg opacity-90 mb-6">
              You'll be the first to know about our latest deals, new arrivals, and exclusive offers.
            </p>
            <button
              onClick={() => setIsSubscribed(false)}
              className="bg-white text-brand-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Subscribe Another Email
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-r from-brand-primary to-brand-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated with Latest Deals
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Subscribe to our newsletter and get exclusive access to early sales, new arrivals, and special offers.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center justify-center space-x-3">
              <Gift className="h-6 w-6 text-amber-300" />
              <span className="text-sm">Exclusive Offers</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <ArrowRight className="h-6 w-6 text-amber-300" />
              <span className="text-sm">Early Access</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Mail className="h-6 w-6 text-amber-300" />
              <span className="text-sm">Weekly Updates</span>
            </div>
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
                required
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-white text-brand-primary hover:bg-gray-100 font-semibold px-6"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
            <p className="text-xs opacity-75 mt-3">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </form>

          {/* Social Proof */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-sm opacity-75">
              Join <span className="font-semibold">10,000+</span> subscribers who get our best deals first!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 