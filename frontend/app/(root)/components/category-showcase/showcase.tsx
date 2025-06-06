import Link from "next/link"
import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CategoryShowcase() {
  const categories = [
    {
      id: 1,
      name: "Athletic Shoes",
      description: "Performance footwear for sports and active lifestyles",
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1974&auto=format&fit=crop",
      slug: "athletic",
      color: "from-blue-500 to-cyan-400",
      count: 24,
    },
    {
      id: 2,
      name: "Casual Shoes",
      description: "Comfortable everyday footwear for any occasion",
      image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1915&auto=format&fit=crop",
      slug: "casual",
      color: "from-amber-500 to-yellow-400",
      count: 36,
    },
    {
      id: 3,
      name: "Formal Shoes",
      description: "Elegant designs for professional and special occasions",
      image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=2070&auto=format&fit=crop",
      slug: "formal",
      color: "from-rose-500 to-pink-400",
      count: 18,
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
              Shop by Category
            </h2>
            <p className="max-w-[700px] text-slate-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Browse our wide selection of footwear for every style and occasion
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="group">
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 group-hover:opacity-30 transition-opacity`}
                    ></div>
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      width={600}
                      height={400}
                      className="object-cover w-full aspect-[3/2] transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h3 className="text-xl font-bold">{category.name}</h3>
                      <p className="text-sm mt-1 text-white/90">{category.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                          {category.count} Products
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/20 hover:bg-white/30 text-white border-0"
                        >
                          Shop Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
