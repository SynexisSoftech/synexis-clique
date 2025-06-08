"use client"; // This directive is necessary for Next.js client components

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import publicCategoryService, {
  PublicCategory,
} from "../../../../service/public/categoryPublicService"; // Adjust the import path as needed

export function CategoryShowcase() {
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories =
          await publicCategoryService.getAllPublicCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // The empty array ensures this effect runs only once on mount

  // You might want to add a count property to your PublicCategory interface
  // or fetch product counts separately if they are not part of the category data.
  // For now, I'm adding a placeholder `count` and a random `color` for demonstration.
  const categoriesWithDisplayData = categories.map((cat) => ({
    ...cat,
    count: Math.floor(Math.random() * 50) + 10, // Placeholder for product count
    color:
      ["from-blue-500 to-cyan-400", "from-amber-500 to-yellow-400", "from-rose-500 to-pink-400"][
        Math.floor(Math.random() * 3)
      ], // Random color for display
  }));

  if (loading) {
    return (
      <section className="w-full py-12 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-slate-600">Loading categories...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-12 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="w-full py-12 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-slate-600">No categories found.</p>
        </div>
      </section>
    );
  }

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
          {categoriesWithDisplayData.map((category) => (
            <Link
              key={category._id} // Use _id from the fetched data
              href={`/categories/${category.slug}`}
              className="group"
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 group-hover:opacity-30 transition-opacity`}
                    ></div>
                    <Image
                      src={category.image || "/placeholder.svg"} // Use category.image
                      alt={category.title} // Use category.title
                      width={600}
                      height={400}
                      className="object-cover w-full aspect-[3/2] transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h3 className="text-xl font-bold">{category.title}</h3>{" "}
                      {/* Use category.title */}
                      <p className="text-sm mt-1 text-white/90">
                        {category.description}
                      </p>
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
  );
}