"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { heroSlidesService, IHeroSlide } from "../../../service/heroslideservice"
import { useToast } from "@/hooks/use-toast"

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<IHeroSlide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSlide, setSelectedSlide] = useState<IHeroSlide | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setIsLoading(true)
        const response = await heroSlidesService.getSlides(1, 10)
        setSlides(response.slides)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch hero slides",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlides()
  }, [])

  const filteredSlides = slides.filter(
    (slide) =>
      slide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slide.subtitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    try {
      await heroSlidesService.deleteSlide(id)
      setSlides(slides.filter((slide) => slide._id !== id))
      toast({
        title: "Success",
        description: "Slide deleted successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete slide",
        variant: "destructive",
      })
    }
  }

  const handleView = (slide: IHeroSlide) => {
    setSelectedSlide(slide)
    setIsViewDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hero Slides</h1>
              <p className="text-gray-600 mt-2">Manage your website's hero section slides</p>
            </div>
            <Link href="/admin/add-hero">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Slide
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Slides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{slides.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Slides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {slides.filter((s) => s.status === "active").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Inactive Slides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {slides.filter((s) => s.status === "inactive").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search slides..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slides Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Hero Slides</CardTitle>
              <CardDescription>A list of all hero slides with their details and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>CTA</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSlides.length > 0 ? (
                    filteredSlides.map((slide) => (
                      <TableRow key={slide._id}>
                        <TableCell>
                          <Image
                            src={slide.imageUrl || "/placeholder.svg"}
                            alt={slide.title}
                            width={60}
                            height={40}
                            className="rounded object-cover"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{slide.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{slide.subtitle}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={slide.status === "active" ? "default" : "secondary"}>{slide.status}</Badge>
                        </TableCell>
                        <TableCell>{slide.order}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{slide.ctaText}</span>
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          </div>
                        </TableCell>
                        <TableCell>{new Date(slide.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(slide)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <Link href={`/admin/hero/edit/${slide._id}`}>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(slide._id)} 
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No slides found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hero Slide Details</DialogTitle>
            <DialogDescription>Complete information about the selected hero slide</DialogDescription>
          </DialogHeader>
          {selectedSlide && (
            <div className="space-y-6">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={selectedSlide.imageUrl || "/placeholder.svg"}
                  alt={selectedSlide.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Title</label>
                  <p className="mt-1 text-sm">{selectedSlide.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge variant={selectedSlide.status === "active" ? "default" : "secondary"}>
                      {selectedSlide.status}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Subtitle</label>
                  <p className="mt-1 text-sm">{selectedSlide.subtitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CTA Text</label>
                  <p className="mt-1 text-sm">{selectedSlide.ctaText}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CTA Link</label>
                  <p className="mt-1 text-sm text-blue-600">{selectedSlide.ctaLink}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Order</label>
                  <p className="mt-1 text-sm">{selectedSlide.order}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created By</label>
                  <p className="mt-1 text-sm">{selectedSlide.createdBy}</p>
                </div>
                {selectedSlide.seoKeywords && selectedSlide.seoKeywords.length > 0 && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">SEO Keywords</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedSlide.seoKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}