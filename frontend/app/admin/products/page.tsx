"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Edit, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"
import { productsService, Product as ServiceProduct, ProductsResponse } from "../../../service/ProductsService"

// Local interface for display purposes, adapted from ServiceProduct
interface DisplayProduct {
  _id: string // Using _id from service
  title: string
  categoryDisplay: string // To store category title
  subcategoryDisplay: string // To store subcategory title
  price: number // Renamed from originalPrice
  stock: number // Renamed from stockQuantity
  status: "active" | "inactive" | "draft" | "out-of-stock" // Added out-of-stock for UI
  images?: string[] // From service
  // cashOnDelivery: boolean // This field is not in the service's Product interface.
                           // If needed, the service and backend must be updated.
                           // For now, it's removed from display or will be handled differently.
}

// Interfaces for categories and subcategories (assuming these are still fetched separately)
interface Category {
  _id: string // Assuming API returns _id
  title: string
}

interface Subcategory {
  _id: string // Assuming API returns _id
  title: string
  categoryId: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<DisplayProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  // Helper to get category title (if categoryId is populated or from separate fetch)
  const getCategoryTitle = (categoryId: string | { _id: string; title: string } | undefined): string => {
    if (!categoryId) return "N/A"
    if (typeof categoryId === "object" && categoryId.title) return categoryId.title
    const catId = typeof categoryId === "object" ? categoryId._id : categoryId
    const category = categories.find((cat) => cat._id === catId)
    return category ? category.title : "Unknown"
  }

  // Helper to get subcategory title (if subcategoryId is populated or from separate fetch)
  const getSubcategoryTitle = (subcategoryId: string | { _id: string; title: string } | undefined): string => {
    if (!subcategoryId) return "N/A"
    if (typeof subcategoryId === "object" && subcategoryId.title) return subcategoryId.title
    const subcatId = typeof subcategoryId === "object" ? subcategoryId._id : subcategoryId
    const subcategory = subcategories.find((sub) => sub._id === subcatId)
    return subcategory ? subcategory.title : "Unknown"
  }

  const fetchData = async (currentPage: number = 1) => {
    setIsLoading(true)
    try {
      // Fetch categories and subcategories (assuming these APIs exist and use _id)
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        fetch("/api/categories").then(res => res.ok ? res.json() : []), // Ensure your API uses _id or map accordingly
        fetch("/api/subcategories").then(res => res.ok ? res.json() : []), // Ensure your API uses _id or map accordingly
      ]);
      setCategories(categoriesRes);
      setSubcategories(subcategoriesRes);

      // Fetch products using the service
      const productsData: ProductsResponse = await productsService.getProducts({ page: currentPage, limit: 10 /* Or your desired limit */ });
      
   const displayProducts = productsData.products.map((p: ServiceProduct) => ({
  _id: p._id,
  title: p.title,
  categoryDisplay: getCategoryTitle(p.categoryId), // Ensure these helpers also handle undefined inputs gracefully
  subcategoryDisplay: getSubcategoryTitle(p.subcategoryId), // Ensure these helpers also handle undefined inputs gracefully
  price: typeof p.price === 'number' ? p.price : 0, // Default to 0 if price is not a number, or handle as error
  stock: typeof p.stock === 'number' ? p.stock : 0, // Also good to check stock
  status: (typeof p.stock === 'number' && p.stock === 0 && p.status !== "draft") ? "out-of-stock" : p.status,
  images: p.images,
}));

      setProducts(displayProducts)
      setPage(productsData.page)
      setTotalPages(productsData.pages)
      setTotalProducts(productsData.count)

    } catch (error) {
      console.error("Error fetching data:", error)
      // Handle error display to user
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch for categories and subcategories (if needed for mapping later)
    // and then fetch products.
    const loadInitialDepsAndProducts = async () => {
        try {
            const [categoriesData, subcategoriesData] = await Promise.all([
                fetch("/api/categories").then(res => res.ok ? res.json() : []),
                fetch("/api/subcategories").then(res => res.ok ? res.json() : [])
            ]);
            setCategories(Array.isArray(categoriesData) ? categoriesData.map(c => ({...c, _id: c.id || c._id})) : []); // Adjust assuming 'id' might be used
            setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData.map(s => ({...s, _id: s.id || s._id})) : []);  // Adjust assuming 'id' might be used
        } catch (error) {
            console.error("Error fetching initial dependencies:", error);
        } finally {
            fetchData(page); // Fetch products after dependencies are loaded
        }
    };
    loadInitialDepsAndProducts();
  }, [page]) // Re-fetch if page changes


  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await productsService.deleteProduct(id)
        setProducts(products.filter((product) => product._id !== id))
        // Optionally, show a success notification
      } catch (error) {
        console.error("Error deleting product:", error)
        // Optionally, show an error notification
      }
    }
  }

  const getStatusBadgeVariant = (status: DisplayProduct["status"]) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "draft":
        return "outline" // Or another variant for draft
      case "out-of-stock":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (isLoading && products.length === 0) { // Show loading only on initial load or if products are empty
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your product inventory here. Total: {totalProducts}</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/add-product"> {/* Adjust link if your add product page path is different */}
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Products</CardTitle>
          <CardDescription className="text-sm">A list of all products in your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Subcategory</TableHead>
                  <TableHead className="hidden lg:table-cell">Price</TableHead>
                  <TableHead className="hidden lg:table-cell">Stock</TableHead>
                  {/* <TableHead className="hidden xl:table-cell">COD</TableHead> Removed as not in service product */}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Image
                          src={product.images?.[0] || "/placeholder.svg?height=40&width=40"} // Use first product image or placeholder
                          alt={product.title}
                          width={40}
                          height={40}
                          className="rounded-md object-cover" // Added object-cover
                        />
                        <span className="font-medium text-sm sm:text-base truncate">{product.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {product.categoryDisplay}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {product.subcategoryDisplay}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">${product.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{product.stock}</TableCell>
                    {/* <TableCell className="hidden xl:table-cell">
                      <Badge variant={product.cashOnDelivery ? "default" : "secondary"} className="text-xs">
                        {product.cashOnDelivery ? "Available" : "Not Available"}
                      </Badge>
                    </TableCell> */}
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(product.status)} className="text-xs">
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1).replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                             {/* Adjust the link to your view product page if you have one */}
                            <Link href={`/dashboard/products/view/${product._id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/edit/${product._id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product._id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Basic Pagination Example */}
          <div className="flex items-center justify-between mt-4">
            <Button onClick={() => fetchData(page - 1)} disabled={page <= 1 || isLoading}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button onClick={() => fetchData(page + 1)} disabled={page >= totalPages || isLoading}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}