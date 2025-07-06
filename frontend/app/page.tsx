"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag, Heart, Baby, Users, Star, Sparkles, Eye, TrendingUp, Award, Shield, Truck, Clock } from "lucide-react"
import Image from "next/image"
import Navbar from "../app/(root)/components/navbar/navbar"
import Hero from "../app/(root)/components/hero/hero"
import FAQ from "../app/(root)/components/faq/faq-section"
import Footer from "../app/(root)/components/footer/footer"
import ButtonTop from "../app/(root)/components/bottom-to-top/buttonTop"
import { CategoryShowcase } from "../app/(root)/components/category-showcase/showcase"
import GenderCategories from "../app/(root)/components/category-homepage/gender-showcase"
import CategoryCom from "../app/(root)/components/category-homepage/category-showcase"
import NewArrivalsSection from "./(root)/components/new-arrival/page"
import TopSalesSection from "./(root)/components/top-sales/page"
import { ProductShowcase } from "./(root)/components/product-showcase/product-showcase"

// New components we'll create
import TrustBadges from "./(root)/components/trust-badges/trust-badges"
import NewsletterSignup from "./(root)/components/newsletter/newsletter-signup"
import FeaturesSection from "./(root)/components/features/features-section"

export default function HomePage() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Trust Badges - Build Customer Confidence */}
      <TrustBadges />
         {/* Featured Products */}
         <ProductShowcase />
      
      {/* Category Showcase */}
      <CategoryShowcase />
      
      {/* Features Section - Why Choose Us */}
      <FeaturesSection />
      
   
      {/* New Arrivals */}
      <NewArrivalsSection />
      
      {/* Top Sales */}
      <TopSalesSection />
      
      {/* Newsletter Signup */}
      <NewsletterSignup />
      
      {/* FAQ Section */}
      <FAQ />
      
      <Footer />
      <ButtonTop />
    </>
  )
}
