"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getActiveHeroSlides, type IHeroSlide } from "../../../../service/public/heroPublicservice"

export default function Hero() {
  // State for API data, loading status, and errors
  const [slides, setSlides] = useState<IHeroSlide[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const slideCount = slides.length

  // Ref for the slider container
  const sliderRef = useRef<HTMLDivElement>(null)

  // Fetch data from the service when the component mounts
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true)
        const activeSlides = await getActiveHeroSlides()
        setSlides(activeSlides)
        setError(null)
      } catch (err: any) {
        console.error("Hero component fetch error:", err)
        setError("Failed to load hero content. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  const nextSlide = useCallback(() => {
    if (slideCount === 0 || isTransitioning) return

    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev === slideCount - 1 ? 0 : prev + 1))

    // Reset transitioning state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 600)
  }, [slideCount, isTransitioning])

  const prevSlide = useCallback(() => {
    if (slideCount === 0 || isTransitioning) return

    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev === 0 ? slideCount - 1 : prev - 1))

    // Reset transitioning state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 600)
  }, [slideCount, isTransitioning])

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return

    setIsTransitioning(true)
    setCurrentSlide(index)
    setIsAutoPlaying(false)

    // Reset transitioning state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 600)

    // Resume auto-play after a delay
    const timer = setTimeout(() => setIsAutoPlaying(true), 5000)
    return () => clearTimeout(timer)
  }

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (isAutoPlaying && slideCount > 1 && !isTransitioning) {
      interval = setInterval(nextSlide, 6000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAutoPlaying, slideCount, nextSlide, isTransitioning])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  // == Render States ==

  // 1. Loading State
  if (loading) {
    return (
      <div className="relative flex items-center justify-center w-full h-[500px] md:h-[600px] lg:h-[700px] bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading Slides...</p>
        </div>
      </div>
    )
  }

  // 2. Error State
  if (error) {
    return (
      <div className="relative flex items-center justify-center w-full h-[500px] md:h-[600px] lg:h-[700px] bg-red-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  // 3. No Slides State
  if (slideCount === 0) {
    return (
      <div className="relative flex items-center justify-center w-full h-[500px] md:h-[600px] lg:h-[700px] bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
          <p className="text-gray-600">No promotional content is available right now.</p>
        </div>
      </div>
    )
  }

  // 4. Success State
  return (
    <div
      className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={sliderRef}
    >
      {/* Slides Container */}
      <div
        className="flex h-full transition-transform duration-600 ease-in-out"
        style={{
          width: `${slideCount * 100}%`,
          transform: `translateX(-${(100 / slideCount) * currentSlide}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide._id}
            className="relative w-full h-full flex-shrink-0"
            style={{ width: `${100 / slideCount}%` }}
          >
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={slide.imageUrl || "/placeholder.png"}
                alt={slide.title}
                fill
                priority={index === 0}
                className={cn("object-cover transition-transform duration-[8s]", currentSlide === index && "scale-105")}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/10" />

              <div
                className={cn(
                  "absolute bottom-16 md:bottom-20 lg:bottom-24 left-8 md:left-12 lg:left-16 z-20 text-white max-w-lg",
                  "transform transition-all duration-1000 ease-out",
                  currentSlide === index ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
                )}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider mb-3 md:mb-4">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-base lg:text-lg mb-5 md:mb-6 opacity-90">{slide.subtitle}</p>
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
            disabled={isTransitioning}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white",
              "p-3 rounded-full transition-all duration-300 backdrop-blur-sm",
              "transform hover:-translate-x-1",
              isTransitioning ? "opacity-50 cursor-not-allowed" : "opacity-70 hover:opacity-100",
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white",
              "p-3 rounded-full transition-all duration-300 backdrop-blur-sm",
              "transform hover:translate-x-1",
              isTransitioning ? "opacity-50 cursor-not-allowed" : "opacity-70 hover:opacity-100",
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  "flex items-center justify-center",
                  index === currentSlide ? "bg-white w-8 h-2" : "bg-white/40 w-2 h-2 hover:bg-white/70",
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide ? "true" : "false"}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
