import { Button } from "@/components/ui/button"
import Link from "next/link"
import Navbar from "./(root)/components/navbar/navbar"
import Hero from "./(root)/components/hero/hero"
import FAQ from "./(root)/components/faq/faq-section"
import Footer from "./(root)/components/footer/footer"

export default function HomePage() {
  return (
 <>
 
 <Navbar />
 <Hero />
 <FAQ />
 <Footer />
 
 </>
  )
}
