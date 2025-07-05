"use client"

import type React from "react"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchComponentProps {
  onSearch?: (query: string) => void
}

export default function SearchComponent({ onSearch }: SearchComponentProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch?.(searchQuery)
  
    }
  }

  return (
    <>
      {/* Desktop Search */}
      <form onSubmit={handleSearch} className="hidden lg:flex items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 group-hover:text-purple-600 transition-colors duration-300" />
            <Input
              type="search"
              placeholder="SEARCH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 w-48 xl:w-64 border border-gray-200 focus:border-purple-400 rounded-full bg-white/80 backdrop-blur-sm transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20 hover:border-blue-300"
            />
          </div>
        </div>
      </form>

      {/* Mobile Search Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-10 w-10 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 hover:scale-110"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
      >
        <Search className="h-5 w-5 text-blue-600" />
        <span className="sr-only">Search</span>
      </Button>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 border-t border-gray-200/50 py-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-md">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <form onSubmit={handleSearch} className="flex items-center space-x-3">
              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <Input
                    type="search"
                    placeholder="SEARCH..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full border border-gray-200 focus:border-purple-400 rounded-full bg-white/80 backdrop-blur-sm transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20"
                    autoFocus
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-300 hover:scale-110"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4 text-red-500" />
                <span className="sr-only">Close search</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
