import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-[#6F4E37] text-gray-300">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Image src="/logo/logo.png" width={32} height={32} alt="Logo" className="object-contain" />
                </div>
                <span className="text-white text-xl font-cormorant font-medium italic">Shop On Clique</span>
              </div>
            </Link>
            <p className="text-amber-100 max-w-xs font-cormorant italic">
              Discover the latest fashion trends and elevate your style with our curated collections.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-9 h-9 bg-white/10 text-amber-100 rounded-full flex items-center justify-center hover:bg-white hover:text-[#6F4E37] transition-colors"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 text-amber-100 rounded-full flex items-center justify-center hover:bg-white hover:text-[#6F4E37] transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 text-amber-100 rounded-full flex items-center justify-center hover:bg-white hover:text-[#6F4E37] transition-colors"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 text-amber-100 rounded-full flex items-center justify-center hover:bg-white hover:text-[#6F4E37] transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-cormorant font-medium italic text-xl mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="font-cormorant text-amber-100 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="font-cormorant text-amber-100 hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="font-cormorant text-amber-100 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/sale" className="font-cormorant text-amber-100 hover:text-white transition-colors">
                  Sale
                </Link>
              </li>
              <li>
                <Link href="/about" className="font-cormorant text-amber-100 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="font-cormorant text-amber-100 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-white font-cormorant font-medium italic text-xl mb-4">Help & Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="font-cormorant text-amber-100 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="font-cormorant text-amber-100 hover:text-white transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="font-cormorant text-amber-100 hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="font-cormorant text-amber-100 hover:text-white transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="font-cormorant text-amber-100 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="font-cormorant text-amber-100 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-cormorant font-medium italic text-xl mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-200 flex-shrink-0 mt-0.5" />
                <span className="font-cormorant text-amber-100">123 Fashion Street, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-amber-200 flex-shrink-0" />
                <span className="font-cormorant text-amber-100">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-amber-200 flex-shrink-0" />
                <span className="font-cormorant text-amber-100">support@shoponclique.com</span>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-white/20">
              <h4 className="text-white font-cormorant font-medium italic mb-3">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 bg-white/10 text-white placeholder-amber-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-white/30 flex-grow font-cormorant"
                />
                <button className="bg-white text-[#6F4E37] px-4 py-2 rounded-r-md hover:bg-amber-100 transition-colors font-cormorant font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/20 text-center text-sm">
          <p className="font-cormorant text-amber-100">
            © {new Date().getFullYear()} Shop On Clique. All rights reserved.
          </p>
          <p className="mt-2 font-cormorant italic text-amber-200">
            Designed with{" "}
            <span className="text-amber-300" aria-label="love">
              ♥
            </span>{" "}
            for fashion lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
