"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
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

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: currentSlide === index ? 1 : 0,
                  y: currentSlide === index ? 0 : 30
                }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="absolute bottom-16 md:bottom-20 lg:bottom-24 left-8 md:left-12 lg:left-16 z-20 text-white max-w-lg"
              >
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: currentSlide === index ? 1 : 0,
                    y: currentSlide === index ? 0 : 20
                  }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider mb-3 md:mb-4"
                >
                  {slide.title}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: currentSlide === index ? 1 : 0,
                    y: currentSlide === index ? 0 : 20
                  }}
                  transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                  className="text-sm md:text-base lg:text-lg mb-5 md:mb-6 opacity-90"
                >
                  {slide.subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: currentSlide === index ? 1 : 0,
                    y: currentSlide === index ? 0 : 20
                  }}
                  transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                >
                  <Button
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-black transition-colors"
                    asChild
                  >
                    <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation and Indicators only if more than one slide */}
      {slideCount > 1 && (
        <>
          {/* Navigation arrows */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          {/* Slide indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  currentSlide === index
                    ? "bg-white scale-110"
                    : "bg-white/50 hover:bg-white/70"
                )}
              />
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
