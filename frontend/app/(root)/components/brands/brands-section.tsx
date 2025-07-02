"use client"

import Image from "next/image"

const brands = [
  {
    name: "Nike",
    logo: "/placeholder-logo.png",
    description: "Premium athletic wear and sportswear",
    image: "/placeholder.jpg",
  },
  {
    name: "Adidas",
    logo: "/placeholder-logo.png",
    description: "Iconic sportswear and lifestyle fashion",
    image: "/placeholder.jpg",
  },
  {
    name: "Puma",
    logo: "/placeholder-logo.png",
    description: "Contemporary sports and casual wear",
    image: "/placeholder.jpg",
  },
  {
    name: "Reebok",
    logo: "/placeholder-logo.png",
    description: "Classic athletic footwear and apparel",
    image: "/placeholder.jpg",
  },
  {
    name: "Under Armour",
    logo: "/placeholder-logo.png",
    description: "Performance-driven athletic gear",
    image: "/placeholder.jpg",
  },
  {
    name: "New Balance",
    logo: "/placeholder-logo.png",
    description: "Comfortable and stylish footwear",
    image: "/placeholder.jpg",
  },
]

export default function BrandsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted Brands
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get branded outfits from the world's leading fashion and sportswear brands. Quality guaranteed.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-2">
                {/* Brand Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={brand.image}
                    alt={`${brand.name} products`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                
                {/* Brand Info */}
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={40}
                        height={40}
                        className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-center mb-2">{brand.name}</h3>
                  <p className="text-sm text-gray-600 text-center">{brand.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-brand-primary/5 to-amber-50/30 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Looking for a Specific Brand?
            </h3>
            <p className="text-gray-600 mb-6">
              We're constantly adding new branded outfits to our collection. Contact us if you don't see your favorite brand.
            </p>
            <button className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Request a Brand
            </button>
          </div>
        </div>
      </div>
    </section>
  )
} 