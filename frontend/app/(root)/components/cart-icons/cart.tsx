"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CartIconProps {
  count?: number
  onClick?: () => void
}

export default function CartIcon({ count = 0, onClick }: CartIconProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-10 w-10 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 hover:scale-110 group"
      onClick={onClick}
    >
      <ShoppingBag className="h-5 w-5 text-green-600 group-hover:text-emerald-500 transition-colors duration-300" />
      {count > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-white shadow-lg animate-bounce">
          {count}
        </Badge>
      )}
      <span className="sr-only">Shopping cart ({count} items)</span>
    </Button>
  )
}
