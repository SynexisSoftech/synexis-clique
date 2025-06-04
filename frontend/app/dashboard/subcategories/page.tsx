"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface Category {
  id: string
  title: string
}

interface Subcategory {
  id: string
  title: string
  categoryId: string
  status: string
  createdAt: string
}

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [subcategoriesRes, categoriesRes] = await Promise.all([
        fetch("/api/subcategories"),
        fetch("/api/categories"),
      ])

      if (subcategoriesRes.ok && categoriesRes.ok) {
        const subcategoriesData = await subcategoriesRes.json()
        const categoriesData = await categoriesRes.json()
        setSubcategories(subcategoriesData)
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.title : "Unknown"
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subcategory?")) {
      try {
        const response = await fetch(`/api/subcategories/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          setSubcategories(subcategories.filter((sub) => sub.id !== id))
        }
      } catch (error) {
        console.error("Error deleting subcategory:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading subcategories...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subcategories</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your product subcategories here.</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/add-subcategory">
            <Plus className="mr-2 h-4 w-4" />
            Add Subcategory
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Subcategories</CardTitle>
          <CardDescription className="text-sm">
            A list of all subcategories organized by parent category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Parent Category</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories.map((subcategory) => (
                  <TableRow key={subcategory.id}>
                    <TableCell className="font-medium">{subcategory.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">{getCategoryName(subcategory.categoryId)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {new Date(subcategory.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={subcategory.status === "active" ? "default" : "secondary"} className="text-xs">
                        {subcategory.status
                          ? subcategory.status.charAt(0).toUpperCase() + subcategory.status.slice(1)
                          : "Unknown"}
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
                            <Link href={`/dashboard/subcategories/edit/${subcategory.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(subcategory.id)}>
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
        </CardContent>
      </Card>
    </div>
  )
}
