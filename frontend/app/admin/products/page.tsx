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
import {
  productsService,
  type Product as ServiceProduct,
  type ProductsResponse,
} from "../../../service/ProductsService" // Adjust path

// Local interface for display, adapted from the new service Product interface
interface DisplayProduct {
  _id: string
  title: string
  categoryDisplay: string
  subcategoryDisplay: string
  originalPrice: number
  discountPrice?: number // Add this property
  stockQuantity: number
  status: "active" | "inactive" | "out-of-stock"
  images?: string[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<DisplayProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const getCategoryTitle = (category: any): string => {
    if (!category) return "N/A"
    return typeof category === "object" ? category.title : "Unknown"
  }

  const getSubcategoryTitle = (subcategory: any): string => {
    if (!subcategory) return "N/A"
    return typeof subcategory === "object" ? subcategory.title : "Unknown"
  }

  const fetchData = async (currentPage = 1) => {
    setIsLoading(true)
    try {
      const productsData: ProductsResponse = await productsService.getProducts({ page: currentPage, limit: 10 })

      const displayProducts = productsData.products.map(
        (p: ServiceProduct): DisplayProduct => ({
          _id: p._id,
          title: p.title,
          categoryDisplay: getCategoryTitle(p.categoryId),
          subcategoryDisplay: getSubcategoryTitle(p.subcategoryId),
          originalPrice: p.originalPrice,
          discountPrice: p.discountPrice, // Add this line
          stockQuantity: p.stockQuantity,
          status: p.status, // The backend pre-save hook handles setting 'out-of-stock'
          images: p.images,
        }),
      )

      setProducts(displayProducts)
      setPage(productsData.page)
      setTotalPages(productsData.pages)
      setTotalProducts(productsData.count)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(page)
  }, [page])

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsService.deleteProduct(id)
        setProducts((prevProducts) => prevProducts.filter((product) => product._id !== id))
        // Optionally refetch to update total count
        setTotalProducts((prev) => prev - 1)
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const getStatusBadgeVariant = (status: DisplayProduct["status"]) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "out-of-stock":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (isLoading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
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
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your product inventory. Total: {totalProducts}
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/add-product">
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
                  <TableHead className="hidden md:table-cell">Original Price</TableHead>
                  <TableHead className="hidden md:table-cell">Discount Price</TableHead>
                  <TableHead className="hidden lg:table-cell">Stock</TableHead>
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
                          src={product.images?.[0] || "/placeholder.svg?height=40&width=40"}
                          alt={product.title}
                          width={40}
                          height={40}
                          className="rounded-md object-cover bg-muted"
                        />
                        <span className="font-medium text-sm sm:text-base truncate">{product.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{product.categoryDisplay}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">Rs{product.originalPrice.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {product.discountPrice ? `Rs${product.discountPrice.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{product.stockQuantity}</TableCell>
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
                            <Link href={`/dashboard/products/view/${product._id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/edit/${product._id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-500"
                            onClick={() => handleDelete(product._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button onClick={() => setPage(page - 1)} disabled={page <= 1 || isLoading}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button onClick={() => setPage(page + 1)} disabled={page >= totalPages || isLoading}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
