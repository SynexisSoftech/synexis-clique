"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Edit, Trash2, ImageOff } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import AdminRouteGuard from "@/app/AdminRouteGuard"
import { useToast } from "@/hooks/use-toast"
import { categoriesService, Category } from "../../../service/categoryApi"
import Image from "next/image"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      try {
        const response = await categoriesService.getCategories({ page: 1, limit: 10 })
        setCategories(response.categories)
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load categories.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [toast])

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this category?")) return

    const originalCategories = [...categories]
    setCategories(categories.filter((cat) => cat._id !== id))

    try {
      await categoriesService.deleteCategory(id)
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      })
    } catch (err: any) {
      setCategories(originalCategories)
      toast({
        title: "Error",
        description: err.message || "Failed to delete category.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: Category["status"]): "default" | "secondary" => {
    return status === "active" ? "default" : "secondary"
  }

  return (
    <AdminRouteGuard>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Manage your product categories.</p>
          </div>
          <Button asChild>
            <Link href="/admin/categories/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No categories found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        {category.image ? (
                          <Image
                            src={category.image}
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
                      <TableCell className="font-medium">{category.title}</TableCell>
                      <TableCell className="hidden sm:table-cell max-w-[300px] truncate">
                        {category.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(category.status)}>
                          {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/categories/edit/${category._id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(category._id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminRouteGuard>
  )
}