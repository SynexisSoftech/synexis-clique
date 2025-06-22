"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Settings, ShoppingBag, Heart, LogOut, Crown, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../../../context/AuthContext"

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = async () => {
    try {
      // Optional: Call logout API endpoint if you have one
      // await apiClient.post('/api/auth/logout')

      logout() // This calls your AuthContext logout function
      setOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
      // Still logout locally even if API call fails
      logout()
      setOpen(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3" />
      case "user":
        return <Shield className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "user":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getInitials = (username?: string, email?: string, firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (username) {
      return username.slice(0, 2).toUpperCase()
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const getDisplayName = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    return username || "User"
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-gradient-to-r from-[#6F4E37]/10 to-amber-500/10 hover:from-[#6F4E37]/20 hover:to-amber-500/20 transition-all duration-300 hover:scale-110"
        >
          <Avatar className="h-9 w-9 border-2 border-[#6F4E37]/20">
            <AvatarImage
              src={user.photoURL || "/placeholder.svg?height=40&width=40"}
              alt={user.username || user.email}
            />
            <AvatarFallback className="bg-[#6F4E37] text-white text-sm font-medium">
              {getInitials(user.username, user.email, user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-gradient-to-b from-white to-amber-50/30 border-[#6F4E37]/20" align="end">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-3 p-4">
            <Avatar className="h-12 w-12 border-2 border-[#6F4E37]/20">
              <AvatarImage
                src={user.photoURL || "/placeholder.svg?height=48&width=48"}
                alt={user.username || user.email}
              />
              <AvatarFallback className="bg-[#6F4E37] text-white font-medium">
                {getInitials(user.username, user.email, user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-[#6F4E37] truncate font-cormorant">{getDisplayName(user.firstName, user.lastName, user.username)}</p>
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs flex items-center gap-1">
                  {getRoleIcon(user.role)}
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-[#6F4E37]/60 truncate">{user.email}</p>
              <p className="text-xs text-[#6F4E37]/40 mt-1">ID: {user.id.slice(-8)}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#6F4E37]/20" />

        <DropdownMenuGroup className="p-2">
          <DropdownMenuItem className="focus:bg-[#6F4E37]/5 rounded-lg" asChild>
            <Link href="/profile" className="flex items-center gap-3 px-2 py-2" onClick={() => setOpen(false)}>
              <User className="h-4 w-4 text-[#6F4E37]" />
              <span className="font-cormorant">My Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="focus:bg-[#6F4E37]/5 rounded-lg" asChild>
            <Link href="/orders" className="flex items-center gap-3 px-2 py-2" onClick={() => setOpen(false)}>
              <ShoppingBag className="h-4 w-4 text-[#6F4E37]" />
              <span className="font-cormorant">My Orders</span>
            </Link>
          </DropdownMenuItem>
{/* 
          <DropdownMenuItem className="focus:bg-[#6F4E37]/5 rounded-lg" asChild>
            <Link href="/wishlist" className="flex items-center gap-3 px-2 py-2" onClick={() => setOpen(false)}>
              <Heart className="h-4 w-4 text-[#6F4E37]" />
              <span className="font-cormorant">Wishlist</span>
            </Link>
          </DropdownMenuItem> */}

          <DropdownMenuItem className="focus:bg-[#6F4E37]/5 rounded-lg" asChild>
            <Link href="/settings" className="flex items-center gap-3 px-2 py-2" onClick={() => setOpen(false)}>
              <Settings className="h-4 w-4 text-[#6F4E37]" />
              <span className="font-cormorant">Settings</span>
            </Link>
          </DropdownMenuItem>

          {user.role === "admin" && (
            <>
              <DropdownMenuSeparator className="bg-[#6F4E37]/20 my-2" />
              <DropdownMenuItem className="focus:bg-[#6F4E37]/5 rounded-lg" asChild>
                <Link href="/admin" className="flex items-center gap-3 px-2 py-2" onClick={() => setOpen(false)}>
                  <Crown className="h-4 w-4 text-amber-600" />
                  <span className="font-cormorant text-amber-600">Admin Panel</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-[#6F4E37]/20" />

        <div className="p-2">
          <DropdownMenuItem className="focus:bg-red-50 rounded-lg cursor-pointer" onClick={handleLogout}>
            <div className="flex items-center gap-3 px-2 py-2 w-full">
              <LogOut className="h-4 w-4 text-red-600" />
              <span className="font-cormorant text-red-600">Sign Out</span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
