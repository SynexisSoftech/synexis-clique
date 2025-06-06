"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SlideData {
  id: number
  image: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

const slides: SlideData[] = [
  {
    id: 1,
    image:
      "/hero/h2.png",
    title: "SUMMER DAYS",
    subtitle: "Available Now",
    ctaText: "SHOP THE COLLECTION",
    ctaLink: "/collections/summer",
  },
  {
    id: 2,
    image: "/hero/h1.png",
    title: "AUTUMN ESSENTIALS",
    subtitle: "Coming Soon",
    ctaText: "VIEW PREVIEW",
    ctaLink: "/collections/autumn",
  },
  {
    id: 3,
    image: "hero/h3.png",
    title: "WINTER WARMERS",
    subtitle: "Pre-order Now",
    ctaText: "EXPLORE COLLECTION",
    ctaLink: "/collections/winter",
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const slideCount = slides.length

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slideCount - 1 ? 0 : prev + 1))
  }, [slideCount])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slideCount - 1 : prev - 1))
  }, [slideCount])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isAutoPlaying) {
      interval = setInterval(() => {
        nextSlide()
      }, 5000) // Change slide every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAutoPlaying, nextSlide])

  // Pause auto-play when user hovers over the slider
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

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
            key={slide.id}
            className={cn(
              "absolute top-0 left-0 w-full h-full transition-opacity duration-1000",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0",
            )}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.image || "/hero/h1.png"}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute bottom-16 md:bottom-20 lg:bottom-24 left-8 md:left-12 lg:left-16 z-20 text-white">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider mb-2">{slide.title}</h2>
                <p className="text-sm md:text-base lg:text-lg mb-4 opacity-90">{slide.subtitle}</p>
                <Button
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-black transition-colors"
                  asChild
                >
                  <a href={slide.ctaLink}>{slide.ctaText}</a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
    </div>
  )
}
