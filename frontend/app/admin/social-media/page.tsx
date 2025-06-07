"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, ExternalLink, Save, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

// Import the actual service
import { socialLinkService, type SocialLink, type CreateSocialLinkDto } from "../../../service/adminSocialLinksservice"

// Updated interface to match backend expectations
interface SocialLinkFormData {
  title: string // Changed from 'name' to 'title'
  link: string // Changed from 'url' to 'link'
  icon?: string
  status: "active" | "inactive"
}

export default function SocialLinksPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLink, setSelectedLink] = useState<SocialLink | null>(null)
  const [formData, setFormData] = useState<SocialLinkFormData>({
    title: "", // Changed from 'name' to 'title'
    link: "", // Changed from 'url' to 'link'
    icon: "",
    status: "active",
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const [iconPreview, setIconPreview] = useState<string>("")
  const [uploadingIcon, setUploadingIcon] = useState(false)

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingIcon(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64String = e.target?.result as string
        // Store the base64 string in the form data
        setFormData({ ...formData, icon: base64String })
        setIconPreview(base64String)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to process the image",
        variant: "destructive",
      })
    } finally {
      setUploadingIcon(false)
    }
  }

  const removeIcon = () => {
    setFormData({ ...formData, icon: "" })
    setIconPreview("")
  }

  // Load social links on component mount
  useEffect(() => {
    loadSocialLinks()
  }, [])

  const loadSocialLinks = async () => {
    try {
      setLoading(true)
      const response = await socialLinkService.getAll()

      // Handle different response structures
      let links: SocialLink[] = []
      if (Array.isArray(response)) {
        links = response
      } else if (response && Array.isArray(response.data)) {
        links = response.data
      } else if (response && response.socialLinks && Array.isArray(response.socialLinks)) {
        links = response.socialLinks
      } else {
        console.warn("Unexpected response structure:", response)
        links = []
      }

      setSocialLinks(links)
    } catch (error) {
      console.error("Error loading social links:", error)
      setSocialLinks([]) // Ensure it's always an array
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load social links",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.title || !formData.link) {
      toast({
        title: "Validation Error",
        description: "Title and Link are required",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      // Send the data with the field names the backend expects
      await socialLinkService.create(formData as unknown as CreateSocialLinkDto)
      await loadSocialLinks()
      setIsCreateDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "Social link created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create social link",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedLink || !formData.title || !formData.link) {
      toast({
        title: "Validation Error",
        description: "Title and Link are required",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      // Send the data with the field names the backend expects
      await socialLinkService.update({
        id: selectedLink._id,
        ...formData,
      } as any)
      await loadSocialLinks()
      setIsEditDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "Social link updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update social link",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedLink) return

    try {
      setSubmitting(true)
      await socialLinkService.delete(selectedLink._id)
      await loadSocialLinks()
      setIsDeleteDialogOpen(false)
      setSelectedLink(null)
      toast({
        title: "Success",
        description: "Social link deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete social link",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (link: SocialLink) => {
    setSelectedLink(link)
    // Map the backend field names to our form field names
    setFormData({
      title: link.name || link.title || "", // Handle both field names
      link: link.url || link.link || "", // Handle both field names
      icon: link.icon || "",
      status: link.status,
    })
    setIconPreview(link.icon || "")
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (link: SocialLink) => {
    setSelectedLink(link)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      link: "",
      icon: "",
      status: "active",
    })
    setSelectedLink(null)
    setIconPreview("")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <SidebarProvider>
      {/* Sidebar space - your sidebar component will go here */}
    

      <SidebarInset>
        {/* Header space - your header component will go here */}
    

        {/* Main content */}
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Social Links</h2>
              <p className="text-muted-foreground">Manage your social media links and their visibility</p>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Social Link
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Social Links Management</CardTitle>
              <CardDescription>View, create, edit, and delete social media links</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Loading social links...</div>
                </div>
              ) : !Array.isArray(socialLinks) || socialLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="text-sm text-muted-foreground mb-4">No social links found</div>
                  <Button onClick={openCreateDialog} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first social link
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(socialLinks) &&
                      socialLinks.map((link) => (
                        <TableRow key={link._id}>
                          <TableCell className="font-medium">{link.name || link.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[200px]">{link.url || link.link}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(link.url || link.link, "_blank")}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {link.icon ? (
                              <img
                                src={link.icon || "/placeholder.svg"}
                                alt={link.name || link.title || "Icon"}
                                className="w-8 h-8 rounded object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                  e.currentTarget.nextElementSibling!.style.display = "block"
                                }}
                              />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                            <span style={{ display: "none" }} className="text-muted-foreground">
                              Invalid image
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={link.status === "active" ? "default" : "secondary"}>{link.status}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(link.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(link)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(link)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Social Link</DialogTitle>
              <DialogDescription>Add a new social media link to your collection.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Facebook, Twitter, LinkedIn"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link">Link (URL)</Label>
                <Input
                  id="link"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon Image</Label>
                <div className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <Input
                      id="icon"
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      disabled={uploadingIcon}
                    />
                    <p className="text-xs text-muted-foreground">
                      Image will be converted to base64 and sent to Cloudinary
                    </p>
                  </div>
                  {iconPreview && (
                    <div className="flex items-center gap-2">
                      <img
                        src={iconPreview || "/placeholder.svg"}
                        alt="Icon preview"
                        className="w-12 h-12 rounded object-cover border"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={removeIcon}>
                        Remove
                      </Button>
                    </div>
                  )}
                  {uploadingIcon && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4 animate-pulse" />
                      Converting image...
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Social Link</DialogTitle>
              <DialogDescription>Update the social media link information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="e.g., Facebook, Twitter, LinkedIn"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-link">Link (URL)</Label>
                <Input
                  id="edit-link"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-icon">Icon Image</Label>
                <div className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <Input
                      id="edit-icon"
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      disabled={uploadingIcon}
                    />
                    <p className="text-xs text-muted-foreground">
                      Image will be converted to base64 and sent to Cloudinary
                    </p>
                  </div>
                  {iconPreview && (
                    <div className="flex items-center gap-2">
                      <img
                        src={iconPreview || "/placeholder.svg"}
                        alt="Icon preview"
                        className="w-12 h-12 rounded object-cover border"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={removeIcon}>
                        Remove
                      </Button>
                    </div>
                  )}
                  {uploadingIcon && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4 animate-pulse" />
                      Converting image...
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Social Link</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedLink?.name || selectedLink?.title}"? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {submitting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
