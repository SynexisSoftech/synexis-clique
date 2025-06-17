"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, ExternalLink, Save, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Import Textarea for description
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

// Import the corrected service and its types
import {
  socialLinkService,
  type SocialLink,
  type CreateSocialLinkDto,
  type UpdateSocialLinkDto,
} from "../../../service/adminSocialLinksservice" // Adjust path as needed

// CORRECTED: Interface aligned with the backend model (title, link, description)
interface SocialLinkFormData {
  title: string
  link: string
  description: string
  icon: string // Will hold a base64 string for new uploads or a URL for existing icons
  status: "active" | "inactive"
}

export default function SocialLinksPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLink, setSelectedLink] = useState<SocialLink | null>(null)

  // CORRECTED: Initial state aligned with the backend model
  const [formData, setFormData] = useState<SocialLinkFormData>({
    title: "",
    link: "",
    description: "",
    icon: "",
    status: "active",
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const [iconPreview, setIconPreview] = useState<string>("")
  const [uploadingIcon, setUploadingIcon] = useState(false)

  // This function is correctly implemented for converting an image to a base64 string.
  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" })
      return
    }
    if (file.size > 6 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Image must be smaller than 6MB.", variant: "destructive" })
      return
    }

    setUploadingIcon(true)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      const base64String = reader.result as string
      // The `icon` field now holds the base64 string, ready for submission
      setFormData({ ...formData, icon: base64String })
      setIconPreview(base64String)
      setUploadingIcon(false)
    }
    reader.onerror = () => {
      toast({ title: "Upload Error", description: "Failed to process the image.", variant: "destructive" })
      setUploadingIcon(false)
    }
  }

  const removeIcon = () => {
    setFormData({ ...formData, icon: "" })
    setIconPreview("")
  }

  useEffect(() => {
    loadSocialLinks()
  }, [])

  // CORRECTED: Simplified data loading logic
  const loadSocialLinks = async () => {
    try {
      setLoading(true)
      const links = await socialLinkService.getAll()
      setSocialLinks(links)
    } catch (error) {
      console.error("Error loading social links:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load social links.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    // CORRECTED: Added validation for icon, as the backend requires it
    if (!formData.title || !formData.link || !formData.icon) {
      toast({
        title: "Validation Error",
        description: "Title, Link, and an Icon are required to create a new link.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      // The formData now perfectly matches the CreateSocialLinkDto
      await socialLinkService.create(formData)
      await loadSocialLinks()
      setIsCreateDialogOpen(false)
      resetForm()
      toast({ title: "Success", description: "Social link created successfully." })
    } catch (error) {
      toast({
        title: "Error Creating Link",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedLink) return
    if (!formData.title || !formData.link) {
      toast({ title: "Validation Error", description: "Title and Link are required.", variant: "destructive" })
      return
    }

    try {
      setSubmitting(true)
      const updatePayload: UpdateSocialLinkDto = {
        id: selectedLink._id,
        title: formData.title,
        link: formData.link,
        description: formData.description,
        status: formData.status,
      }
      // Only include the icon if it's a new base64 upload
      if (formData.icon.startsWith("data:image")) {
        updatePayload.icon = formData.icon
      }

      await socialLinkService.update(updatePayload)
      await loadSocialLinks()
      setIsEditDialogOpen(false)
      resetForm()
      toast({ title: "Success", description: "Social link updated successfully." })
    } catch (error) {
      toast({
        title: "Error Updating Link",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
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
      toast({ title: "Success", description: "Social link deleted successfully." })
    } catch (error) {
      toast({
        title: "Error Deleting Link",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
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
    // CORRECTED: Directly map the backend fields to the form state
    setFormData({
      title: link.title,
      link: link.link,
      description: link.description || "",
      icon: link.icon || "", // This will be the Cloudinary URL
      status: link.status,
    })
    setIconPreview(link.icon || "") // Set the preview to the existing icon URL
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
      description: "",
      icon: "",
      status: "active",
    })
    setSelectedLink(null)
    setIconPreview("")
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Social Links</h2>
              <p className="text-muted-foreground">Manage your social media links and their visibility</p>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Social Link
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Social Links Management</CardTitle>
              <CardDescription>View, create, edit, and delete social media links.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : socialLinks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No social links found.</p>
                  <Button onClick={openCreateDialog} variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Create your first social link
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Icon</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* CORRECTED: Removed fallbacks for `name` and `url` */}
                    {socialLinks.map((link) => (
                      <TableRow key={link._id}>
                        <TableCell>
                          {link.icon ? (
                            <img
                              src={link.icon}
                              alt={link.title}
                              className="w-8 h-8 rounded-full object-cover border"
                            />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{link.title}</TableCell>
                        <TableCell>
                          <a
                            href={link.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:underline"
                          >
                            <span className="truncate max-w-[200px]">{link.link}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant={link.status === "active" ? "default" : "secondary"}>{link.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(link.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(link)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(link)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialogs for Create/Edit */}
        <Dialog
          open={isCreateDialogOpen || isEditDialogOpen}
          onOpenChange={isCreateDialogOpen ? setIsCreateDialogOpen : setIsEditDialogOpen}
        >
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{isEditDialogOpen ? "Edit Social Link" : "Create Social Link"}</DialogTitle>
              <DialogDescription>
                {isEditDialogOpen
                  ? "Update the details for this social media link."
                  : "Add a new social media link to your collection."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Title, Link, and Description Inputs */}
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Facebook, Twitter"
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
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of the link."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              {/* Icon Upload Section */}
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon Image</Label>
                <div className="flex items-center gap-4">
                  {iconPreview && (
                    <img
                      src={iconPreview}
                      alt="Icon preview"
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  )}
                  <div className="flex-1">
                    <Input
                      id="icon"
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      disabled={uploadingIcon}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 2MB. Uploading a new image will replace the old one.
                    </p>
                  </div>
                  {iconPreview && (
                    <Button type="button" variant="ghost" size="icon" onClick={removeIcon}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              {/* Status Select */}
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
              <Button
                variant="outline"
                onClick={() => (isEditDialogOpen ? setIsEditDialogOpen(false) : setIsCreateDialogOpen(false))}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={isEditDialogOpen ? handleEdit : handleCreate} disabled={submitting || uploadingIcon}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? "Saving..." : "Save Changes"}
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
                Are you sure you want to delete "{selectedLink?.title}"? This action cannot be undone.
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