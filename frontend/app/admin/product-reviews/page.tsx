
"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { reviewAdminService, type IAdminReview, type ReviewStatus } from "../../../service/reviewAdminservice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ChevronDown, Star, Trash2, AlertCircle, CheckCircle, EyeOff, Flag } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"

export default function AdminReviewsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State management
  const [reviews, setReviews] = useState<IAdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus | undefined>(
    (searchParams.get("status") as ReviewStatus) || undefined,
  )
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const limit = 10

  // Fetch reviews based on current filters and pagination
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await reviewAdminService.getReviews(currentPage, limit, selectedStatus)
      setReviews(data.reviews)
      setTotalPages(data.pages)
      setTotalCount(data.count)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reviews. Please try again.",
        variant: "error",
      })
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle status change
  const handleStatusChange = async (reviewId: string, newStatus: ReviewStatus) => {
    try {
      setActionLoading(true)
      await reviewAdminService.updateReviewStatus(reviewId, newStatus)

      // Update the review in the local state
      setReviews(reviews.map((review) => (review._id === reviewId ? { ...review, status: newStatus } : review)))

      toast({
        title: "Status Updated",
        description: `Review status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review status.",
        variant: "error",
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle review deletion
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return

    try {
      setActionLoading(true)
      await reviewAdminService.deleteReview(reviewToDelete)

      // Remove the deleted review from the local state
      setReviews(reviews.filter((review) => review._id !== reviewToDelete))

      toast({
        title: "Review Deleted",
        description: "The review has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the review.",
        variant: "error",
      })
    } finally {
      setActionLoading(false)
      setIsDeleteDialogOpen(false)
      setReviewToDelete(null)
    }
  }

  // Handle filter change
  const handleFilterChange = (status: string) => {
    const newStatus = status === "all" ? undefined : (status as ReviewStatus)
    setSelectedStatus(newStatus)
    setCurrentPage(1) // Reset to first page when filter changes

    // Update URL query params
    const params = new URLSearchParams(searchParams.toString())
    if (newStatus) {
      params.set("status", newStatus)
    } else {
      params.delete("status")
    }

    router.push(`/admin/reviews?${params.toString()}`)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Get status badge
  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      case "hidden":
        return (
          <Badge className="bg-gray-500">
            <EyeOff className="w-3 h-3 mr-1" /> Hidden
          </Badge>
        )
      case "flagged":
        return (
          <Badge className="bg-red-500">
            <Flag className="w-3 h-3 mr-1" /> Flagged
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
    )
  }

  // Fetch reviews on mount and when dependencies change
  useEffect(() => {
    fetchReviews()
  }, [currentPage, selectedStatus])

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Review Management</CardTitle>
            <CardDescription>Manage customer reviews across your products</CardDescription>
          </div>
          <Select value={selectedStatus || "all"} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            // Empty state
            <div className="text-center py-10">
              <p className="text-muted-foreground">No reviews found matching your criteria.</p>
            </div>
          ) : (
            // Reviews table
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <div className="font-medium">{review.userId.username}</div>
                        <div className="text-sm text-muted-foreground">{review.userId.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={review.productId.name}>
                          {review.productId.name}
                        </div>
                      </TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell>{getStatusBadge(review.status)}</TableCell>
                      <TableCell>
                        {review.isVerifiedPurchase ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(review.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setReviewToDelete(review._id)
                              setIsDeleteDialogOpen(true)
                            }}
                            disabled={actionLoading}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild disabled={actionLoading}>
                              <Button variant="outline" size="sm">
                                Status <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(review._id, "active")}
                                disabled={review.status === "active"}
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(review._id, "pending")}
                                disabled={review.status === "pending"}
                              >
                                <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(review._id, "hidden")}
                                disabled={review.status === "hidden"}
                              >
                                <EyeOff className="mr-2 h-4 w-4 text-gray-500" />
                                Hide
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(review._id, "flagged")}
                                disabled={review.status === "flagged"}
                              >
                                <Flag className="mr-2 h-4 w-4 text-red-500" />
                                Flag
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/reviews/${review._id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(currentPage - 1)
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => {
                    // Show limited page numbers for better UX
                    if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage + 2)) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(i + 1)
                            }}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }

                    // Add ellipsis for skipped pages
                    if (i === currentPage - 3 || i === currentPage + 3) {
                      return (
                        <PaginationItem key={i}>
                          <span className="px-4 py-2">...</span>
                        </PaginationItem>
                      )
                    }

                    return null
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(currentPage + 1)
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-center text-sm text-muted-foreground mt-2">
                Showing {reviews.length} of {totalCount} reviews
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the review from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              disabled={actionLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
