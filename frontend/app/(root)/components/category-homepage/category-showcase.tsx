"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, Baby, User } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function CategoryShowcase() {
  const categories = [
    {
      id: "women",
      title: "Women",
      icon: User,
      description: "Elegant footwear for the modern woman",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop",
      href: "/categories/women",
      color: "from-rose-400 to-pink-500",
      stats: "150+ Styles",
    },
    {
      id: "men",
      title: "Men",
      icon: Users,
      description: "Classic and contemporary men's shoes",
      image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop",
      href: "/categories/men",
      color: "from-blue-400 to-indigo-500",
      stats: "200+ Styles",
    },
    {
      id: "baby",
      title: "Baby & Kids",
      icon: Baby,
      description: "Comfortable shoes for little feet",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800&auto=format&fit=crop",
      href: "/categories/baby",
      color: "from-green-400 to-emerald-500",
      stats: "80+ Styles",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50/50 via-white to-[#6F4E37]/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold font-cormorant text-[#6F4E37] mb-6">Find Your Perfect Fit</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our carefully curated collections designed for every member of your family. From elegant women's
            heels to sturdy men's boots and adorable baby shoes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500">
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Icon */}
                    <div className="absolute top-6 left-6">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    {/* Stats Badge */}
                    <div className="absolute top-6 right-6">
                      <div className="bg-[#6F4E37]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {category.stats}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold font-cormorant text-[#6F4E37] mb-3">{category.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{category.description}</p>

                    <Button
                      asChild
                      className="w-full bg-[#6F4E37] hover:bg-[#5d4230] text-white font-cormorant font-medium text-lg py-6 rounded-xl group-hover:bg-gradient-to-r group-hover:from-[#6F4E37] group-hover:to-amber-700 transition-all duration-300"
                    >
                      <Link href={category.href} className="inline-flex items-center justify-center">
                        Shop {category.title}
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>

                  {/* Decorative Element */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#6F4E37] to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-[#6F4E37]">
              <Users className="h-8 w-8" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-[#6F4E37] font-cormorant">Family Packages Available</h4>
              <p className="text-sm text-gray-600">Get special discounts when shopping for the whole family</p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-[#6F4E37] text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white"
            >
              <Link href="/family-deals">Learn More</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
