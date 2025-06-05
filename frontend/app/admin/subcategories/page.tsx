// app/dashboard/subcategories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { subcategoriesService, Subcategory as ISubcategory } from "../../../service/subcategories"; // Renamed to ISubcategory to avoid conflict
import { categoriesService, Category as ICategory } from "../../../service/categoryApi"; // Renamed to ICategory
import AdminRouteGuard from "@/app/AdminRouteGuard";

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<ISubcategory[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both subcategories and categories concurrently
      const [subcategoriesRes, categoriesRes] = await Promise.all([
        subcategoriesService.getSubcategories(),
        categoriesService.getCategories(), // Assuming getCategories returns a list directly or has a 'categories' field
      ]);

      setSubcategories(subcategoriesRes.subcategories || []); // Adjust based on actual service response structure
      setCategories(categoriesRes.categories || []); // Adjust based on actual service response structure
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    // Ensure categoryId is a string before finding, and that the populated category is accessed correctly
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.title : "Unknown";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) {
      return;
    }

    try {
      setError(null);
      await subcategoriesService.deleteSubcategory(id);
      setSubcategories((prev) => prev.filter((sub) => sub._id !== id));
    } catch (err: any) {
      console.error("Error deleting subcategory:", err);
      setError(err.message || "Failed to delete subcategory.");
    }
  };

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
    );
  }

  return (
    <AdminRouteGuard>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subcategories</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your product subcategories here.</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/subcategories/add"> {/* Corrected link path */}
            <Plus className="mr-2 h-4 w-4" />
            Add Subcategory
          </Link>
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Subcategories</CardTitle>
          <CardDescription className="text-sm">
            A list of all subcategories organized by parent category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {subcategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No subcategories found. Start by adding a new one!
              </div>
            ) : (
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
                    <TableRow key={subcategory._id}> {/* Use _id from Mongoose model */}
                      <TableCell className="font-medium">{subcategory.title}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {typeof subcategory.categoryId === 'object' && subcategory.categoryId !== null
                          ? subcategory.categoryId.title // If populated
                          : getCategoryName(subcategory.categoryId as string)} {/* If not populated or just ID */}
                      </TableCell>
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
                              <Link href={`/admin/subcategories/edit/${subcategory._id}`}> {/* Use _id for edit link */}
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(subcategory._id)}> {/* Use _id for delete */}
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminRouteGuard>
  );
}