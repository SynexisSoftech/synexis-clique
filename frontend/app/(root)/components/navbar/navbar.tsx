"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Import the separate components
import SearchComponent from "../search-bar/search-bar"
import WishlistIcon from "../wishlist/wishlist"
import CartIcon from "../cart-icons/cart"
import ProfileDropdown from "../profile-dropdown/profile-dropdown"

export default function Navbar() {
  const [cartCount] = useState(3)
  const [wishlistCount] = useState(5)

  const navigationLinks = [
    { name: "SHOP", href: "/shop" },
    { name: "NEW ARRIVALS", href: "/new-arrivals" },
    { name: "SALE", href: "/sale" },
    { name: "ABOUT", href: "/about" },
  ]

  const handleSearch = (query: string) => {
    console.log("Searching for:", query)
    // Handle search logic here
  }

  const handleWishlistClick = () => {
    console.log("Wishlist clicked")
    // Handle wishlist navigation
  }

  const handleCartClick = () => {
    console.log("Cart clicked")
    // Handle cart navigation
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-md border-b border-gray-200/50 shadow-lg shadow-purple-500/5">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex h-16 sm:h-18 lg:h-20 items-center justify-between">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-10 w-10 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 hover:scale-110"
                >
                  <Menu className="h-5 w-5 text-purple-600" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-gradient-to-b from-white to-purple-50/30">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      MENU
                    </div>
                  </div>
                  <Link
                    href="/"
                    className="group flex items-center justify-center transition-transform duration-300 hover:scale-105"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                      <Image
                        src="/logo/logo.png"
                        className="relative h-12 sm:h-14 lg:h-16 object-contain filter group-hover:brightness-110 transition-all duration-300"
                        width={120}
                        height={60}
                        alt="Logo"
                      />
                    </div>
                  </Link>
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="relative text-lg font-semibold text-gray-700 hover:text-gray-900 transition-colors duration-300 p-4 rounded-xl group"
                    >
                      {link.name}
                      <span className="absolute bottom-2 left-4 w-0 h-0.5 bg-[#6F4E37] transition-all duration-300 group-hover:w-[calc(100%-2rem)]"></span>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo - Desktop */}
            <Link
              href="/"
              className="group hidden md:flex items-center transition-transform duration-300 hover:scale-105"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <Image
                  src="/logo/logo.png"
                  className="relative h-10 sm:h-12 lg:h-14 xl:h-16 object-contain filter group-hover:brightness-110 transition-all duration-300"
                  width={64}
                  height={64}
                  alt="Logo"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2 lg:space-x-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative text-xs lg:text-sm xl:text-base font-bold tracking-wide text-gray-700 hover:text-gray-900 transition-colors duration-300 px-3 py-2 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#6F4E37] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            {/* Search Component */}
            <SearchComponent onSearch={handleSearch} />

            {/* Wishlist Icon */}
            <WishlistIcon count={wishlistCount} onClick={handleWishlistClick} />

            {/* Cart Icon */}
            <CartIcon count={cartCount} onClick={handleCartClick} />

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}
