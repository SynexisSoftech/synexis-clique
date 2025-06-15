"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useAuth } from "../../../context/AuthContext"
import { useCart } from "@/hooks/useCart"

// Import the separate components
import SearchComponent from "../search-bar/search-bar"
import WishlistIcon from "../wishlist/wishlist"
import CartDropdown from "./cart-dropdown"
import ProfileDropdown from "../profile-dropdown/profile-dropdown"

export default function Navbar() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { cartItemsCount } = useCart()
  const [wishlistCount] = useState(5) // You can replace this with actual wishlist count

  const navigationLinks = [
    { name: "PRODUCTS", href: "/products" },
    { name: "NEW ARRIVALS", href: "/new-arrivals" },
    { name: "CATEGORIES", href: "/categories" },
    { name: "ABOUT", href: "/about" },
    { name: "CONTACT", href: "/contact" },
  ]

  const handleSearch = (query: string) => {
    console.log("Searching for:", query)
    // Handle search logic here
    router.push(`/products?search=${encodeURIComponent(query)}`)
  }

  const handleWishlistClick = () => {
    if (isAuthenticated) {
      router.push("/wishlist")
    } else {
      router.push("/auth/login")
    }
  }

  const handleCartClick = () => {
    if (isAuthenticated) {
      router.push("/cart")
    } else {
      router.push("/auth/login")
    }
  }

  const handleSignInClick = () => {
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-amber-100 shadow-sm">
      <div className="container mx-auto px-4 lg:px-6 xl:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center space-x-6 lg:space-x-8 xl:space-x-10">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 hover:bg-amber-50 transition-colors duration-200"
                >
                  <Menu className="h-5 w-5 text-[#6F4E37]" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-white p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-6 border-b border-amber-100">
                    <Link href="/" className="flex items-center">
                      <Image src="/logo/logo.png" className="h-12 object-contain" width={120} height={48} alt="Logo" />
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4 text-[#6F4E37]" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 px-6 py-8">
                    <div className="space-y-6">
                      {navigationLinks.map((link) => (
                        <SheetClose asChild key={link.name}>
                          <Link
                            href={link.href}
                            className="block text-base font-medium italic text-gray-700 hover:text-[#6F4E37] transition-colors duration-200 font-cormorant py-2"
                          >
                            {link.name}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </nav>

                  {/* Mobile Footer */}
                  <div className="p-6 border-t border-amber-100">
                    {!authLoading && !isAuthenticated && (
                      <Button
                        onClick={handleSignInClick}
                        className="w-full bg-[#6F4E37] hover:bg-[#5d4230] text-white font-cormorant font-medium italic"
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-80">
              <Image
                src="/logo/logo.png"
                className="h-10 lg:h-12 xl:h-14 object-contain"
                width={120}
                height={64}
                alt="Logo"
              />
            </Link>

            {/* Desktop Navigation - Now in left section */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative text-xs lg:text-sm font-medium italic text-gray-700 hover:text-[#6F4E37] transition-colors duration-200 font-cormorant group py-2 whitespace-nowrap"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#6F4E37] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Search Component */}
            <div className="hidden sm:block">
              <SearchComponent onSearch={handleSearch} />
            </div>

            {/* Wishlist Icon */}
            <WishlistIcon count={wishlistCount} onClick={handleWishlistClick} />

            {/* Cart Dropdown */}
            <CartDropdown count={cartItemsCount} onClick={handleCartClick} />

            {/* Sign In Button or Profile Dropdown */}
            {!authLoading && (
              <>
                {isAuthenticated ? (
                  <ProfileDropdown />
                ) : (
                  <Button
                    onClick={handleSignInClick}
                    size="sm"
                    className="hidden sm:inline-flex bg-[#6F4E37] hover:bg-[#5d4230] text-white font-cormorant font-medium italic transition-colors duration-200 text-xs"
                  >
                    Sign In
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden pb-3">
          <SearchComponent onSearch={handleSearch} />
        </div>
      </div>
    </header>
  )
}
