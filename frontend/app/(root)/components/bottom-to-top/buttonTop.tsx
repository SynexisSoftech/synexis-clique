"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export default function ButtonTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Calculate scroll progress and visibility
  const handleScroll = () => {
    const scrollTop = window.pageYOffset
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = (scrollTop / docHeight) * 100

    setScrollProgress(scrollPercent)
    setIsVisible(scrollTop > 300)
  }

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative group">
            {/* Progress ring */}
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-[#6F4E37]/20"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
                className="text-[#6F4E37] transition-all duration-300"
                strokeLinecap="round"
              />
            </svg>

            {/* Button */}
            <button
              onClick={scrollToTop}
              className="absolute inset-2 bg-white hover:bg-amber-50 text-[#6F4E37] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center group"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-[#6F4E37] text-white text-sm font-cormorant italic px-3 py-1 rounded-md whitespace-nowrap">
                Back to top
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#6F4E37]"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
