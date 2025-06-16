"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Plus, Edit, Trash2, ImageOff, AlertCircle, RefreshCw, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import AdminRouteGuard from "@/app/AdminRouteGuard"
import { useToast } from "@/hooks/use-toast"
import { categoriesService, type Category } from "../../../service/categoryApi"
import Image from "next/image"

interface ValidationError {
  field?: string
  message: string
  code?: string
}

interface ApiError {
  message: string
  errors?: ValidationError[]
  status?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // Filter categories based on search term
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter(
        (category) =>
          category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCategories(filtered)
    }
  }, [categories, searchTerm])

  const fetchCategories = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await categoriesService.getCategories({ page: 1, limit: 100 })
      setCategories(response.categories || [])
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || "Failed to load categories",
        errors: err.errors || [],
        status: err.status || 500,
      }
      setError(apiError)

      toast({
        title: "Error Loading Categories",
        description: apiError.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this category?")) return

    const originalCategories = [...categories]
    setIsDeleting(id)

    // Optimistic update
    setCategories(categories.filter((cat) => cat._id !== id))

    try {
      await categoriesService.deleteCategory(id)
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      })
    } catch (err: any) {
      // Revert optimistic update
      setCategories(originalCategories)

      const apiError: ApiError = {
        message: err.message || "Failed to delete category",
        errors: err.errors || [],
        status: err.status || 500,
      }

      toast({
        title: "Delete Failed",
        description: apiError.message,
        variant: "destructive",
      })

      // Show detailed validation errors if available
      if (apiError.errors && apiError.errors.length > 0) {
        apiError.errors.forEach((error: ValidationError) => {
          toast({
            title: `Validation Error${error.field ? ` (${error.field})` : ""}`,
            description: error.message,
            variant: "destructive",
          })
        })
      }
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusBadgeVariant = (status: Category["status"]): "default" | "secondary" => {
    return status === "active" ? "default" : "secondary"
  }

  const renderMobileCard = (category: Category) => (
    <Card key={category._id} className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {category.image ? (
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.title}
                width={60}
                height={60}
                className="rounded-lg object-cover h-15 w-15"
              />
            ) : (
              <div className="w-15 h-15 flex items-center justify-center bg-secondary rounded-lg">
                <ImageOff className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{category.title}</h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                )}
                <div className="mt-2">
                  <Badge variant={getStatusBadgeVariant(category.status)} className="text-xs">
                    {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0" disabled={isDeleting === category._id}>
                    {isDeleting === category._id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/categories/edit/${category._id}`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(category._id)}
                    disabled={isDeleting === category._id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="w-full">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-15 w-15 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <AdminRouteGuard>
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Categories</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your product categories</p>
            </div>
            <Button asChild className="w-full sm:w-auto flex-shrink-0">
              <Link href="/admin/addcategory">
                <Plus className="mr-2 h-4 w-4" />
                <span className="sm:inline">Add Category</span>
              </Link>
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="break-words">{error.message}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchCategories}
                  className="w-full sm:w-auto flex-shrink-0"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Search Section */}
          <div className="w-full">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Content Section */}
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">All Categories</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${filteredCategories.length} categories found`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {isLoading ? (
                <div className="p-4 sm:p-0">{renderLoadingSkeleton()}</div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <ImageOff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? "No categories found" : "No categories yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? `No categories match "${searchTerm}"` : "Get started by creating your first category"}
                  </p>
                  {!searchTerm && (
                    <Button asChild>
                      <Link href="/admin/addcategory">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Mobile View */}
                  <div className="block lg:hidden p-4 space-y-4">{filteredCategories.map(renderMobileCard)}</div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Image</TableHead>
                          <TableHead className="min-w-[150px]">Name</TableHead>
                          <TableHead className="min-w-[200px]">Description</TableHead>
                          <TableHead className="w-24">Status</TableHead>
                          <TableHead className="w-20 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCategories.map((category) => (
                          <TableRow key={category._id}>
                            <TableCell>
                              {category.image ? (
                                <Image
                                  src={category.image || "/placeholder.svg"}
                                  alt={category.title}
                                  width={50}
                                  height={50}
                                  className="rounded-md object-cover h-12 w-12"
                                />
                              ) : (
                                <div className="w-12 h-12 flex items-center justify-center bg-secondary rounded-md">
                                  <ImageOff className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="max-w-[200px] truncate">{category.title}</div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[300px] truncate text-muted-foreground">
                                {category.description || "No description"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(category.status)}>
                                {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    disabled={isDeleting === category._id}
                                  >
                                    {isDeleting === category._id ? (
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <MoreHorizontal className="h-4 w-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/categories/edit/${category._id}`}>
                                      <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDelete(category._id)}
                                    disabled={isDeleting === category._id}
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRouteGuard>
  )
}
