"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Heart, Star, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface CategoryData {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  href: string
  featured: boolean
  trending: boolean
  productCount: number
  popularItems: {
    name: string
    price: number
    image: string
    rating: number
  }[]
}

export default function GenderCategories() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const categories: CategoryData[] = [
    {
      id: "women",
      title: "Women",
      subtitle: "Elegant & Stylish",
      description: "Discover our curated collection of women's footwear, from elegant heels to comfortable flats",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2080&auto=format&fit=crop",
      href: "/categories/women",
      featured: true,
      trending: true,
      productCount: 156,
      popularItems: [
        {
          name: "Elegant Heels",
          price: 6800,
          image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop",
          rating: 4.8,
        },
        {
          name: "Comfort Flats",
          price: 4200,
          image: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?q=80&w=400&auto=format&fit=crop",
          rating: 4.6,
        },
      ],
    },
    {
      id: "men",
      title: "Men",
      subtitle: "Classic & Modern",
      description: "Explore our premium men's shoe collection featuring formal, casual, and athletic styles",
      image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=2070&auto=format&fit=crop",
      href: "/categories/men",
      featured: true,
      trending: false,
      productCount: 189,
      popularItems: [
        {
          name: "Leather Loafers",
          price: 7200,
          image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=400&auto=format&fit=crop",
          rating: 4.7,
        },
        {
          name: "Athletic Sneakers",
          price: 8500,
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop",
          rating: 4.9,
        },
      ],
    },
    {
      id: "baby",
      title: "Baby & Kids",
      subtitle: "Cute & Comfortable",
      description: "Adorable and comfortable footwear for your little ones, designed for growing feet",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop",
      href: "/categories/baby",
      featured: false,
      trending: true,
      productCount: 87,
      popularItems: [
        {
          name: "Baby Sneakers",
          price: 2800,
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=400&auto=format&fit=crop",
          rating: 4.8,
        },
        {
          name: "Kids Sandals",
          price: 3200,
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop",
          rating: 4.5,
        },
      ],
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50/30 via-white to-[#6F4E37]/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-cormorant text-[#6F4E37] mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated collections designed for every member of your family
          </p>
        </motion.div>

        {/* Main Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              onHoverStart={() => setHoveredCategory(category.id)}
              onHoverEnd={() => setHoveredCategory(null)}
              className="group"
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {category.featured && (
                      <Badge className="bg-[#6F4E37] hover:bg-[#5d4230] text-white font-cormorant">Featured</Badge>
                    )}
                    {category.trending && (
                      <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-cormorant">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{
                        y: hoveredCategory === category.id ? 0 : 20,
                        opacity: hoveredCategory === category.id ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="mb-4"
                    >
                      <div className="flex items-center gap-2 text-sm text-amber-200 mb-2">
                        <Star className="h-4 w-4 fill-amber-200" />
                        <span>{category.productCount} Products Available</span>
                      </div>
                    </motion.div>

                    <h3 className="text-3xl font-bold font-cormorant mb-2">{category.title}</h3>
                    <p className="text-amber-100 text-lg font-medium mb-3">{category.subtitle}</p>
                    <p className="text-white/90 text-sm mb-4 line-clamp-2">{category.description}</p>

                    <Button
                      asChild
                      className="bg-[#6F4E37] hover:bg-[#5d4230] text-white font-cormorant font-medium group-hover:bg-white group-hover:text-[#6F4E37] transition-all duration-300"
                    >
                      <Link href={category.href} className="inline-flex items-center">
                        Explore Collection
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Popular Items Preview */}
                <CardContent className="p-6">
                  <h4 className="font-semibold text-[#6F4E37] mb-4 font-cormorant">Popular Items</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {category.popularItems.map((item, itemIndex) => (
                      <motion.div key={itemIndex} whileHover={{ scale: 1.05 }} className="group/item cursor-pointer">
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gradient-to-br from-amber-50 to-[#6F4E37]/10">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover/item:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/20 transition-colors duration-300" />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6 bg-white/80 hover:bg-white opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"
                          >
                            <Heart className="h-3 w-3 text-[#6F4E37]" />
                          </Button>
                        </div>
                        <h5 className="text-sm font-medium text-gray-900 truncate">{item.name}</h5>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#6F4E37]">
                            NPR {item.price.toLocaleString()}
                          </span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-gray-500 ml-1">{item.rating}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-[#6F4E37] to-amber-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold font-cormorant mb-4">Can't Find What You're Looking For?</h3>
            <p className="text-amber-100 mb-6 max-w-md mx-auto">
              Browse our complete collection or use our advanced filters to find the perfect pair
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                variant="secondary"
                className="bg-white text-[#6F4E37] hover:bg-amber-50 font-cormorant font-medium"
              >
                <Link href="/products">View All Products</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#6F4E37] font-cormorant font-medium"
              >
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
