"use client"

import { Shield, Truck, Clock, RotateCcw, CreditCard, Headphones } from "lucide-react"

const trustFeatures = [
  {
    icon: Shield,
    title: "Secure Shopping",
    description: "100% secure payment processing",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free delivery on orders over NPR 2000",
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
  },
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Same day dispatch on orders before 2 PM",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day return policy with free returns",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: CreditCard,
    title: "Multiple Payment",
    description: "Pay with card, eSewa, or cash on delivery",
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round the clock customer service",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
]

export default function TrustBadges() {
  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trustFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-lg hover:shadow-md transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-full ${feature.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
} 