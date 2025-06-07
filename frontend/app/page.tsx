"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Heart, Baby, Users, Star, Sparkles, Eye } from "lucide-react"
import Image from "next/image"
import Navbar from "../app/(root)/components/navbar/navbar"
import Hero from "../app/(root)/components/hero/hero"
import FAQ from "../app/(root)/components/faq/faq-section"
import Footer from "../app/(root)/components/footer/footer"
import ButtonTop from "../app/(root)/components/bottom-to-top/buttonTop"
import { CategoryShowcase } from "../app/(root)/components/category-showcase/showcase"
import GenderCategories from "../app/(root)/components/category-homepage/gender-showcase"
import CategoryCom from "../app/(root)/components/category-homepage/category-showcase"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function HomePage() {
  const [showWebsite, setShowWebsite] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    // Set launch date to 15 days from now
    const launchDate = new Date()
    launchDate.setDate(launchDate.getDate() + 15)

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = launchDate.getTime() - now

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })

      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // If user wants to see the website, render the homepage
  if (showWebsite) {
    return (
      <>
        <Navbar />
        <Hero />
        <CategoryShowcase />
        <GenderCategories />
        <CategoryCom />
        <FAQ />
        <Footer />
        <ButtonTop />
      </>
    )
  }

  // Otherwise, show the coming soon page
  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-rose-100 to-pink-100 rounded-full opacity-60 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full opacity-40 animate-pulse delay-500"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none">
        <ShoppingBag className="absolute top-16 left-4 sm:top-20 sm:left-10 w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-bounce delay-300" />
        <Heart className="absolute top-32 right-4 sm:top-40 sm:right-20 w-4 h-4 sm:w-5 sm:h-5 text-rose-400 animate-bounce delay-700" />
        <Baby className="absolute bottom-32 left-4 sm:bottom-40 sm:left-20 w-5 h-5 sm:w-6 sm:h-6 text-blue-400 animate-bounce delay-1000" />
        <Star className="absolute top-48 left-1/4 sm:top-60 sm:left-1/3 w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse delay-500" />
        <Sparkles className="absolute bottom-48 right-1/4 sm:bottom-60 sm:right-1/3 w-4 h-4 sm:w-5 sm:h-5 text-purple-400 animate-pulse delay-1200" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo Section */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="relative group">
            <Image
              src="/clique-logo.png"
              alt="CLIQUE Logo"
              width={160}
              height={160}
              className="mx-auto transition-transform duration-500 group-hover:scale-110 sm:w-[200px] sm:h-[200px]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Main Heading */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-amber-800 to-gray-900 bg-clip-text text-transparent animate-fade-in-up delay-300 leading-tight">
            Something Amazing
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-light text-gray-700 animate-fade-in-up delay-500 leading-tight">
            Is Coming Soon
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up delay-700 px-2">
            Get ready for the ultimate fashion destination for <span className="font-semibold text-blue-600">Men</span>,{" "}
            <span className="font-semibold text-rose-600">Women</span>, and{" "}
            <span className="font-semibold text-amber-600">Babies</span>
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="mb-8 sm:mb-12 animate-fade-in-up delay-1000 w-full max-w-4xl">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Launching In</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((item, index) => (
              <div
                key={item.label}
                className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${1200 + index * 200}ms` }}
              >
                <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {item.value.toString().padStart(2, "0")}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600 uppercase tracking-wide">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Preview */}
        <div className="mb-8 sm:mb-12 animate-fade-in-up delay-1400">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
            {[
              { icon: Users, label: "Men", color: "text-blue-600 bg-blue-50" },
              { icon: Heart, label: "Women", color: "text-rose-600 bg-rose-50" },
              { icon: Baby, label: "Babies", color: "text-amber-600 bg-amber-50" },
            ].map((category, index) => (
              <div
                key={category.label}
                className={`flex flex-col items-center p-4 sm:p-6 rounded-xl sm:rounded-2xl ${category.color} hover:scale-110 transition-all duration-300 cursor-pointer group min-w-[80px] sm:min-w-[100px]`}
                style={{ animationDelay: `${1600 + index * 200}ms` }}
              >
                <category.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 group-hover:animate-bounce" />
                <span className="font-semibold text-xs sm:text-sm md:text-base">{category.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* See Website Button */}
        <div className="w-full max-w-md animate-fade-in-up delay-1800">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 px-2">
            Want to see what we're building?
          </h3>
          <Button
            onClick={() => setShowWebsite(true)}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 sm:py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-sm sm:text-base"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            See Website Preview
          </Button>
        </div>

        {/* Social Proof */}
        <div className="mt-8 sm:mt-12 animate-fade-in-up delay-2000">
          <p className="text-gray-500 text-xs sm:text-sm md:text-base px-2">
            Join thousands of fashion enthusiasts waiting for our launch
          </p>
          <div className="flex justify-center items-center mt-3 sm:mt-4 space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current animate-pulse"
                style={{ animationDelay: `${2200 + i * 100}ms` }}
              />
            ))}
            <span className="ml-2 text-gray-600 font-medium text-sm sm:text-base">Coming Soon</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
