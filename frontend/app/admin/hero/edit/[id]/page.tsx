"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { heroSlidesService, IHeroSlide, UpdateHeroSlideData } from "../../../../../service/heroslideservice"
import Link from "next/link"
import { ArrowLeft, Upload, X, Plus } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default function EditHeroSlidePage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slide, setSlide] = useState<IHeroSlide | null>(null)
  const [formData, setFormData] = useState<UpdateHeroSlideData>({
    title: "",
    subtitle: "",
    image: undefined,
    ctaText: "",
    ctaLink: "",
    order: 0,
    status: "active",
    seoKeywords: [],
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [keywordInput, setKeywordInput] = useState("")

  useEffect(() => {
    const fetchSlide = async () => {
      try {
        setIsLoading(true)
        const data = await heroSlidesService.getSlideById(id as string)
        setSlide(data)
        setFormData({
          title: data.title,
          subtitle: data.subtitle,
          image: undefined, // Don't preload existing image to avoid base64 issues
          ctaText: data.ctaText,
          ctaLink: data.ctaLink,
          order: data.order,
          status: data.status,
          seoKeywords: data.seoKeywords || [],
        })
        setImagePreview(data.imageUrl) // Set the preview with the existing image URL
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch slide data",
          variant: "destructive",
        })
        router.push("/admin/hero-slides")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchSlide()
    }
  }, [id])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive"
      })
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seoKeywords?.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...(prev.seoKeywords || []), keywordInput.trim()]
      }))
      setKeywordInput("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords?.filter(k => k !== keyword) || []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)

      // Prepare the update data
      const updateData: UpdateHeroSlideData = {
        ...formData,
        seoKeywords: formData.seoKeywords?.length ? formData.seoKeywords : undefined
      }

      // If a new image was uploaded, convert it to base64
      if (imageFile) {
        const base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = (error) => reject(error)
          reader.readAsDataURL(imageFile)
        })
        updateData.image = base64Image
      }

      await heroSlidesService.updateSlide(id as string, updateData)
      
      toast({
        title: "Success",
        description: "Hero slide updated successfully",
      })
      
      router.push("/admin/hero-slides")
    } catch (error: any) {
      console.error("Error updating hero slide:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update hero slide",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/hero-slides">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Hero Slide</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Slide Details</CardTitle>
            <CardDescription>Update the content and settings for this hero slide</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") => 
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange("subtitle", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Text</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => handleInputChange("ctaText", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctaLink">CTA Link</Label>
                  <Input
                    id="ctaLink"
                    value={formData.ctaLink}
                    onChange={(e) => handleInputChange("ctaLink", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => handleInputChange("order", Number.parseInt(e.target.value) || 1)}
                    className="w-32"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>SEO Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a keyword"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" onClick={addKeyword} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.seoKeywords?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.seoKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeKeyword(keyword)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Hero Image</Label>
                  {imagePreview ? (
                    <div className="relative">
                      <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                        <Image 
                          src={imagePreview} 
                          alt="Preview" 
                          fill 
                          className="object-cover" 
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setImagePreview(null)
                          setImageFile(null)
                          setFormData(prev => ({ ...prev, image: null }))
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="space-y-2">
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-sm font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
                          <span className="text-sm text-gray-500"> or drag and drop</span>
                        </Label>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/admin/hero">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}