"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link" // Import Link for client-side navigation
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getActiveHeroSlides, IHeroSlide } from "../../../../service/public/heroPublicservice" // Adjust import path

export default function Hero() {
  // State for API data, loading status, and errors
  const [slides, setSlides] = useState<IHeroSlide[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const slideCount = slides.length

  // Fetch data from the service when the component mounts
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true)
        const activeSlides = await getActiveHeroSlides()
        setSlides(activeSlides)
        setError(null) // Clear any previous errors
      } catch (err: any) {
        console.error("Hero component fetch error:", err)
        setError("Failed to load hero content. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, []) // Empty dependency array ensures this runs only once

  const nextSlide = useCallback(() => {
    if (slideCount === 0) return // Prevent errors if there are no slides
    setCurrentSlide((prev) => (prev === slideCount - 1 ? 0 : prev + 1))
  }, [slideCount])

  const prevSlide = useCallback(() => {
    if (slideCount === 0) return // Prevent errors if there are no slides
    setCurrentSlide((prev) => (prev === 0 ? slideCount - 1 : prev - 1))
  }, [slideCount])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Optional: Resume auto-play after a delay
    const timer = setTimeout(() => setIsAutoPlaying(true), 5000)
    return () => clearTimeout(timer)
  }

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (isAutoPlaying && slideCount > 1) {
      interval = setInterval(nextSlide, 5000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAutoPlaying, slideCount, nextSlide])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  // == Render States ==

  // 1. Loading State
  if (loading) {
    return (
      <div className="relative flex items-center justify-center w-full h-[500px] md:h-[600px] lg:h-[700px] bg-gray-200">
        <p className="text-gray-500">Loading Slides...</p>
      </div>
    )
  }

  // 2. Error State
  if (error) {
    return (
      <div className="relative flex items-center justify-center w-full h-[500px] md:h-[600px] lg:h-[700px] bg-red-100">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }
  
  // 3. No Slides State
  if (slideCount === 0) {
    return (
       <div className="relative flex items-center justify-center w-full h-[500px] md:h-[600px] lg:h-[700px] bg-gray-100">
        <p className="text-gray-600">No promotional content is available right now.</p>
      </div>
    )
  }

  // 4. Success State
  return (
    <div
      className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide._id} // Use the unique ID from the database
            className={cn(
              "absolute top-0 left-0 w-full h-full transition-opacity duration-1000",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0",
            )}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.imageUrl || "/placeholder.png"} // Use imageUrl from API
                alt={slide.title}
                fill
                priority={index === 0} // Prioritize loading the first slide image
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" /> {/* Slightly increased overlay for readability */}
              <div className="absolute bottom-16 md:bottom-20 lg:bottom-24 left-8 md:left-12 lg:left-16 z-20 text-white">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider mb-2">{slide.title}</h2>
                <p className="text-sm md:text-base lg:text-lg mb-4 opacity-90">{slide.subtitle}</p>
                <Button
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-black transition-colors"
                  asChild
                >
                  <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation and Indicators only if more than one slide */}
      {slideCount > 1 && (
        <>
          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/80",
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}