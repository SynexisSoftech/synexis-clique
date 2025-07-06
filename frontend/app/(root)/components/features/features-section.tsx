"use client"

import { Award, Users, Zap, Heart, Star, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

const features = [
  {
    icon: Award,
    title: "Premium Quality",
    description: "Curated selection of high-quality products from top brands",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Dedicated support team committed to your satisfaction",
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Quick processing and delivery to get your items fast",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Heart,
    title: "Trusted by Thousands",
    description: "Join our community of satisfied customers",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    icon: Star,
    title: "Best Prices",
    description: "Competitive pricing with regular deals and discounts",
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
  },
  {
    icon: TrendingUp,
    title: "Trending Styles",
    description: "Stay ahead with the latest fashion trends and styles",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Shop On Clique?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing you with the best shopping experience, from quality products to exceptional service.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
} 
