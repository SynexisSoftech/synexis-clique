import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { ImageResponse } from "next/server"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-[#816552] text-gray-300">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-[#6F4E37] flex items-center justify-center">
<Image
src="/logo/logo.png"
width={40}
height={40}
alt="Logo"
/>
                </div>
                <span className="text-white text-xl font-bold">Shop On Clique</span>
              </div>
            </Link>
            <p className="text-gray-400 max-w-xs">
              Discover the latest fashion trends and elevate your style with our curated collections.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-9 h-9 bg-white-400 text-gray-300 rounded-full flex items-center justify-center hover:bg-[#6F4E37] hover:text-white transition-colors"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white-400 text-gray-300 rounded-full flex items-center justify-center hover:bg-[#6F4E37] hover:text-white transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white-400text-gray-300 rounded-full flex items-center justify-center hover:bg-[#6F4E37] hover:text-white transition-colors"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white-400 text-gray-300 rounded-full flex items-center justify-center hover:bg-[#6F4E37] hover:text-white transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[#6F4E37] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#6F4E37] transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="hover:text-[#6F4E37] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/sale" className="hover:text-[#6F4E37] transition-colors">
                  Sale
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#6F4E37] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#6F4E37] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="hover:text-[#6F4E37] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#6F4E37] transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#6F4E37] transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-[#6F4E37] transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#6F4E37] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#6F4E37] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#6F4E37] flex-shrink-0 mt-0.5" />
                <span>123 Fashion Street, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#6F4E37] flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#6F4E37] flex-shrink-0" />
                <span>support@fashionstore.com</span>
              </li>
            </ul>
            {/* <div className="mt-4 pt-4 border-t border-gray-800">
              <h4 className="text-white font-medium mb-2">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 bg-gray-800 text-white rounded-l-md focus:outline-none flex-grow"
                />
                <button className="bg-[#6F4E37] text-white px-4 py-2 rounded-r-md hover:bg-[#5d4230] transition-colors">
                  Subscribe
                </button>
              </div>
            </div> */}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-sm text-white-400">
          <p>© {new Date().getFullYear()} FashionStore. All rights reserved.</p>
          <p className="mt-2">
            Designed with{" "}
            <span className="text-[#6F4E37]" aria-label="love">
              ♥
            </span>{" "}
            for fashion lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
