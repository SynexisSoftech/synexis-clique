"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Tags, Building2, TrendingUp, ShoppingCart, Star, Loader2 } from "lucide-react"
import AdminRouteGuard from "../AdminRouteGuard"
import { categoriesService } from "../../service/categoryApi"
import { subcategoriesService } from "../../service/subcategories"
import { productsService } from "../../service/ProductsService"
import { adminOrderService } from "../../service/orderService"
import { reviewAdminService } from "../../service/reviewAdminservice"

interface DashboardStats {
  totalCategories: number
  totalSubcategories: number
  totalProducts: number
  totalOrders: number
  totalReviews: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCategories: 0,
    totalSubcategories: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalReviews: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [categoriesData, subcategoriesData, productsData, ordersData, reviewsData] = await Promise.all([
          categoriesService.getCategories({ limit: 1 }), // Just get count, limit to 1 for efficiency
          subcategoriesService.getSubcategories({ limit: 1 }),
          productsService.getProducts({ limit: 1 }),
          adminOrderService.getAllOrders(1, 1), // page 1, limit 1
          reviewAdminService.getReviews(1, 1), // page 1, limit 1
        ])

        setStats({
          totalCategories: categoriesData.count,
          totalSubcategories: subcategoriesData.count,
          totalProducts: productsData.count,
          totalOrders: ordersData.count,
          totalReviews: reviewsData.count,
        })
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    isLoading,
  }: {
    title: string
    value: number
    description: string
    icon: any
    isLoading: boolean
  }) => (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{isLoading ? "Loading..." : description}</p>
      </CardContent>
    </Card>
  )

  return (
    <AdminRouteGuard>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome to your admin dashboard. Here's an overview of your store.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            title="Total Categories"
            value={stats.totalCategories}
            description={stats.totalCategories === 0 ? "No categories yet" : `Active categories`}
            icon={Tags}
            isLoading={isLoading}
          />

          <StatCard
            title="Subcategories"
            value={stats.totalSubcategories}
            description={stats.totalSubcategories === 0 ? "No subcategories yet" : `Active subcategories`}
            icon={Building2}
            isLoading={isLoading}
          />

          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            description={stats.totalProducts === 0 ? "No products yet" : `Products in catalog`}
            icon={Package}
            isLoading={isLoading}
          />

          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            description={stats.totalOrders === 0 ? "No orders yet" : `Customer orders`}
            icon={ShoppingCart}
            isLoading={isLoading}
          />

          <StatCard
            title="Total Reviews"
            value={stats.totalReviews}
            description={stats.totalReviews === 0 ? "No reviews yet" : `Customer reviews`}
            icon={Star}
            isLoading={isLoading}
          />
        </div>

        {/* Quick Stats Summary - Mobile Friendly */}
        <div className="mt-6 sm:mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Quick Overview</CardTitle>
              <CardDescription className="text-sm">Summary of your store's current status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading overview...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Catalog Items:</span>
                        <span className="font-medium">
                          {(stats.totalCategories + stats.totalSubcategories + stats.totalProducts).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer Activity:</span>
                        <span className="font-medium">{(stats.totalOrders + stats.totalReviews).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Content Status:</span>
                        <span className="font-medium">{stats.totalProducts > 0 ? "Active" : "Setup Required"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Store Health:</span>
                        <span className="font-medium">
                          {stats.totalCategories > 0 && stats.totalProducts > 0 ? "Good" : "Needs Attention"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Getting Started Message */}
                  {stats.totalCategories === 0 && stats.totalProducts === 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Getting Started</h3>
                          <p className="text-sm text-blue-700 mt-1">
                            Start by adding categories and products to set up your store catalog.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRouteGuard>
  )
}
