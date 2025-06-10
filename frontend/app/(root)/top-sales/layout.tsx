import type React from "react"
import type { Metadata } from "next"
import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"

export const metadata: Metadata = {
  title: "Top Sales Of The Week | Premium Products",
  description: "Discover our best-selling products this week. Don't miss out on trending items with great discounts.",
  keywords: "top sales, best sellers, trending products, weekly deals, popular items",
}

export default function TopSalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
