"use client"

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
import NewArrivalsSection from "./(root)/components/new-arrival/page"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <CategoryShowcase />
      <GenderCategories />
      <CategoryCom />
      <NewArrivalsSection />
      <FAQ />
      <Footer />
      <ButtonTop />
    </>
  )
}