import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './context/AuthContext'

import { Cormorant_Garamond } from "next/font/google"
import { Toaster } from '@/components/ui/toaster'
import { CartProvider } from './context/CartContext'

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
})

export const metadata: Metadata = {
  title: 'Clique App',
  description: 'Created by Synexis Softech',
 
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
           <AuthProvider>    <CartProvider>{children}  <Toaster /></CartProvider></AuthProvider></body>
    </html>
  )
}
