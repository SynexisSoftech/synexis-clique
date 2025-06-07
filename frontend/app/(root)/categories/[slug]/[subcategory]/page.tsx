"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Filter, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/app/(root)/components/navbar/navbar";
import Footer from "@/app/(root)/components/footer/footer";

// Import the new service and type
import publicSubcategoryService, { type PublicSubcategory } from "../../../../../service/public/publicSubcategoryService"; // Adjust path

export default function SubcategoryPage({ params }: { params: { slug: string; subcategory: string } }) {
    // Use the new PublicSubcategory type for state
    const [subcategory, setSubcategory] = useState<PublicSubcategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState("featured");

    useEffect(() => {
        const fetchSubcategory = async () => {
            if (!params.slug || !params.subcategory) return;

            try {
                setLoading(true);
                // Fetch the specific subcategory using its parent's slug and its own slug
                const data = await publicSubcategoryService.getPublicSubcategoryBySlug(
                    params.slug,
                    params.subcategory
                );
                setSubcategory(data);
            } catch (err: any) {
                setError(err.message || "Failed to fetch subcategory details.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubcategory();
    }, [params.slug, params.subcategory]);

    // This data should also be fetched from an API
    const subcategoryProducts = [
        // ... (sample product data remains the same for now)
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2 text-lg">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading Subcategory...</span>
                </div>
            </div>
        );
    }

    if (error || !subcategory) {
        return (
            <>
                <Navbar />
                <div className="container px-4 py-8 md:px-6 md:py-12">
                    <Alert variant="destructive">
                        <AlertDescription>{error || "Subcategory not found."}</AlertDescription>
                    </Alert>
                    <div className="mt-4">
                        <Button asChild>
                            <Link href="/categories">Back to Categories</Link>
                        </Button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <div>
            <Navbar />

            <div className="container px-4 py-8 md:px-6 md:py-12">
                {/* Breadcrumbs using dynamic data */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <Link href="/" className="text-slate-500 hover:text-slate-700">Home</Link>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                    <Link href="/categories" className="text-slate-500 hover:text-slate-700">Categories</Link>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                    <Link href={`/categories/${subcategory.categoryId.slug}`} className="text-slate-500 hover:text-slate-700">
                        {subcategory.categoryId.title}
                    </Link>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{subcategory.title}</span>
                </div>

                {/* Header Banner using dynamic data */}
                <div className="relative mb-8">
                    <div className="relative h-[200px] md:h-[300px] overflow-hidden rounded-lg">
                        <Image
                            src={subcategory.image || "/placeholder.svg?height=300&width=800"}
                            alt={subcategory.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                    </div>
                    <div className="absolute inset-0 flex items-center">
                        <div className="container px-4 md:px-6">
                            <div className="max-w-lg">
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{subcategory.title}</h1>
                                <p className="text-white/80 md:text-lg">
                                    {subcategory.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Product Count */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                     {/* ... (this section remains the same) ... */}
                </div>

                {/* Product Grid */}
                {subcategoryProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* ... (product mapping remains the same) ... */}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-slate-600 mb-4">No products found in this subcategory yet.</p>
                        <Button asChild className="bg-rose-600 hover:bg-rose-700">
                           <Link href={`/categories/${subcategory.categoryId.slug}`}>View All {subcategory.categoryId.title}</Link>
                        </Button>
                    </div>
                )}
                
                {/* About Section */}
                <div className="mt-12 bg-slate-50 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">About {subcategory.title}</h2>
                     <p className="text-slate-600">
                        {subcategory.description}
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}