"use client"

import { Settings, ShoppingBag, Heart, LogOut, UserCircle, Package, CreditCard, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all duration-300 hover:scale-110 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full" />
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold">
              JD
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-2xl p-2"
      >
        {/* Profile Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl mb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-indigo-500/20">
              <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Profile" />
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold">
                JD
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">John Doe</p>
              <p className="text-sm text-gray-500">john.doe@example.com</p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-200/50" />

        {/* Account Section */}
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
          Account
        </DropdownMenuLabel>

        <DropdownMenuItem className="group hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 rounded-xl transition-all duration-200 cursor-pointer px-3 py-2.5">
          <UserCircle className="h-4 w-4 text-blue-500 group-hover:text-cyan-500 transition-colors duration-200" />
          <span className="ml-3 font-medium">My Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="group hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 rounded-xl transition-all duration-200 cursor-pointer px-3 py-2.5">
          <Settings className="h-4 w-4 text-purple-500 group-hover:text-pink-500 transition-colors duration-200" />
          <span className="ml-3 font-medium">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="group hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-orange-500/10 rounded-xl transition-all duration-200 cursor-pointer px-3 py-2.5">
          <Bell className="h-4 w-4 text-amber-500 group-hover:text-orange-500 transition-colors duration-200" />
          <span className="ml-3 font-medium">Notifications</span>
          <span className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
            3
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200/50 my-2" />

        {/* Shopping Section */}
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
          Shopping
        </DropdownMenuLabel>

        <DropdownMenuItem className="group hover:bg-gradient-to-r hover:from-green-500/10 hover:to-emerald-500/10 rounded-xl transition-all duration-200 cursor-pointer px-3 py-2.5">
          <Package className="h-4 w-4 text-green-500 group-hover:text-emerald-500 transition-colors duration-200" />
          <span className="ml-3 font-medium">My Orders</span>
          <span className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full">
            2
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem className="group hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-red-500/10 rounded-xl transition-all duration-200 cursor-pointer px-3 py-2.5">
          <Heart className="h-4 w-4 text-pink-500 group-hover:text-red-500 transition-colors duration-200" />
          <span className="ml-3 font-medium">Wishlist</span>
          <span className="ml-auto bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs px-2 py-1 rounded-full">
            5
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem className="group hover:bg-gradient-to-r hover:from-teal-500/10 hover:to-cyan-500/10 rounded-xl transition-all duration-200 cursor-pointer px-3 py-2.5">
          <ShoppingBag className="h-4 w-4 text-teal-500 group-hover:text-cyan-500 transition-colors duration-200" />
          <span className="ml-3 font-medium">Shopping Cart</span>
          <span className="ml-auto bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full">
            3
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem className="group hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-blue-500/10 rounded-xl transition-all duration-200 cursor-pointer px-3 py-2.5">
          <CreditCard className="h-4 w-4 text-indigo-500 group-hover:text-blue-500 transition-colors duration-200" />
          <span className="ml-3 font-medium">Payment Methods</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200/50 my-2" />

        {/* Logout */}
        <DropdownMenuItem className="group hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 rounded-xl transition-all duration-200 cursor-pointer px-3 py-2.5">
          <LogOut className="h-4 w-4 text-red-500 group-hover:text-pink-500 transition-colors duration-200" />
          <span className="ml-3 font-medium text-red-600 group-hover:text-pink-600 transition-colors duration-200">
            Sign Out
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
