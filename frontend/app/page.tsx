import { Button } from "@/components/ui/button"
import Link from "next/link"
import Navbar from "./(root)/components/navbar/navbar"
import Hero from "./(root)/components/hero/hero"
import FAQ from "./(root)/components/faq/faq-section"
import Footer from "./(root)/components/footer/footer"
import ButtonTop from "./(root)/components/bottom-to-top/buttonTop"
import { CategoryShowcase } from "./(root)/components/category-showcase/showcase"
import GenderCategories from "./(root)/components/category-homepage/gender-showcase"
import CategoryCom from "./(root)/components/category-homepage/category-showcase"

export default function HomePage() {
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
