// app/dashboard/categories/page.tsx
"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
// Import your service and types
import { categoriesService, Category } from "../../../service/categoryApi" // Adjust path to your categories.ts file
import AdminRouteGuard from "@/app/AdminRouteGuard";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]) // Use Category from service
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null) // State for error messages

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async (): Promise<void> => {
    setIsLoading(true)
    setError(null) // Clear previous errors
    try {
      // Use the service to fetch categories
      const response = await categoriesService.getCategories({ page: 1, limit: 10 }) // Add default filters or dynamic ones
      setCategories(response.categories)
    } catch (err: any) {
      console.error("Error fetching categories:", err)
      setError(err.message || "Failed to load categories.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return // User cancelled
    }

    // Optimistic UI update
    const originalCategories = [...categories]
    setCategories(categories.filter((cat) => cat._id !== id)) // Use _id as per Category interface

    try {
      await categoriesService.deleteCategory(id)
      // Success is implied by the optimistic update
    } catch (err: any) {
      console.error("Error deleting category:", err)
      setError(err.message || "Failed to delete category.")
      setCategories(originalCategories) // Revert on error
    }
  }

  const getStatusBadgeVariant = (status: Category["status"]): "default" | "secondary" => {
    return status === "active" ? "default" : "secondary"
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64 text-red-500">
          <p className="text-lg">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <AdminRouteGuard>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your product categories here.</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/addcategory">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Categories</CardTitle>
          <CardDescription className="text-sm">A list of all categories in your store.</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No categories found</p>
              <p className="text-sm text-muted-foreground mt-2">Start by creating your first category</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    // Use _id for the key as per your Category interface
                    <TableRow key={category._id}>
                      <TableCell className="font-medium">{category.title}</TableCell>
                      <TableCell className="hidden sm:table-cell max-w-[200px] truncate">
                        {category.description}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(category.status)} className="text-xs">
                          {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
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
                              <Link href={`/admin/categories/edit/${category._id}`}> {/* Use _id here */}
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(category._id)}> {/* Use _id here */}
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
          )}
        </CardContent>
      </Card>
    </div>
    </AdminRouteGuard>
  )
}