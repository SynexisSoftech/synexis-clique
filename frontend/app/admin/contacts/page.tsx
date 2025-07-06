"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, Eye, MessageSquare, Trash2, Loader2, RefreshCw, Search, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Import the service and its types
import {
  adminContactUsService,
  IContactMessage,
  ContactQueryStatus,
  ContactQueryType,
} from "../../../service/admincontact"

export default function ContactsPage() {
  const [contacts, setContacts] = useState<IContactMessage[]>([])
  const [filteredContacts, setFilteredContacts] = useState<IContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<ContactQueryStatus | null>(null)
  const [filterQueryType, setFilterQueryType] = useState<ContactQueryType | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedContact, setSelectedContact] = useState<IContactMessage | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const { toast } = useToast()

  const pageSize = 10

  // Fetch contacts whenever filters or page changes
  useEffect(() => {
    fetchContacts()
  }, [filterStatus, filterQueryType, currentPage])

  // Filter contacts based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContacts(contacts)
    } else {
      const filtered = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredContacts(filtered)
    }
  }, [searchTerm, contacts])

  const fetchContacts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await adminContactUsService.getMessages(
        currentPage,
        pageSize,
        filterStatus !== null ? filterStatus : undefined,
        filterQueryType !== null ? filterQueryType : undefined
      )
      setContacts(response.messages)
      setTotalPages(response.pages)
      setTotalCount(response.count)
    } catch (err: any) {
      console.error("Error fetching contacts:", err)
      setError(err.message || "Failed to fetch contact messages.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact message? This action cannot be undone.")) {
      return
    }
    try {
      await adminContactUsService.deleteMessage(id)
      setContacts(prevContacts => prevContacts.filter(contact => contact._id !== id))
      toast({
        title: "Success",
        description: "Contact message deleted successfully.",
      })
    } catch (err: any) {
      console.error("Error deleting contact:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to delete contact message.",
        variant: "error",
      })
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: ContactQueryStatus) => {
    try {
      await adminContactUsService.updateMessage(id, { status: newStatus })
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact._id === id ? { ...contact, status: newStatus } : contact
        )
      )
      toast({
        title: "Success",
        description: `Status updated to ${newStatus}`,
      })
    } catch (err: any) {
      console.error("Error updating status:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update status.",
        variant: "error",
      })
    }
  }

  const getStatusBadgeVariant = (status: ContactQueryStatus) => {
    switch (status) {
      case ContactQueryStatus.UNREAD:
        return "destructive"
      case ContactQueryStatus.PENDING_RESPONSE:
        return "default"
      case ContactQueryStatus.RESOLVED:
        return "secondary"
      case ContactQueryStatus.READ:
        return "outline"
      case ContactQueryStatus.CLOSED:
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: ContactQueryStatus) => {
    switch (status) {
      case ContactQueryStatus.UNREAD:
        return <AlertCircle className="h-4 w-4" />
      case ContactQueryStatus.PENDING_RESPONSE:
        return <Clock className="h-4 w-4" />
      case ContactQueryStatus.RESOLVED:
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusDisplayName = (status: ContactQueryStatus) => {
    switch (status) {
      case ContactQueryStatus.UNREAD:
        return "Unread"
      case ContactQueryStatus.READ:
        return "Read"
      case ContactQueryStatus.PENDING_RESPONSE:
        return "Pending Response"
      case ContactQueryStatus.RESOLVED:
        return "Resolved"
      case ContactQueryStatus.CLOSED:
        return "Closed"
      default:
        return status
    }
  }

  const getQueryTypeDisplayName = (queryType: ContactQueryType) => {
    switch (queryType) {
      case ContactQueryType.DELIVERY_OFFERS:
        return "Delivery Offers"
      case ContactQueryType.GENERAL_QUERY:
        return "General Query"
      case ContactQueryType.PAYMENT_ISSUES:
        return "Payment Issues"
      case ContactQueryType.ACCOUNT_HELP:
        return "Account Help"
      case ContactQueryType.FEEDBACK:
        return "Feedback"
      case ContactQueryType.OTHER:
        return "Other"
      default:
        return queryType
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleFilterClick = (status: ContactQueryStatus | null) => {
    if (filterStatus === status) {
      setFilterStatus(null)
    } else {
      setFilterStatus(status)
    }
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleQueryTypeChange = (queryType: string) => {
    if (queryType === "all") {
      setFilterQueryType(null)
    } else {
      setFilterQueryType(queryType as ContactQueryType)
    }
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setFilterStatus(null)
    setFilterQueryType(null)
    setCurrentPage(1)
  }

  const handleViewDetails = (contact: IContactMessage) => {
    setSelectedContact(contact)
    setIsViewModalOpen(true)
  }

  const handleReply = (contact: IContactMessage) => {
    // Create a mailto link with pre-filled subject and body
    const subject = encodeURIComponent(`Re: ${getQueryTypeDisplayName(contact.queryType)} - ${contact.name}`)
    const body = encodeURIComponent(`Dear ${contact.name},\n\nThank you for contacting us regarding your ${getQueryTypeDisplayName(contact.queryType).toLowerCase()}.\n\n[Your response here]\n\nBest regards,\n[Your Name]\n[Your Company]`)
    
    const mailtoLink = `mailto:${contact.email}?subject=${subject}&body=${body}`
    
    // Open the email client
    window.open(mailtoLink, '_blank')
    
    // Show a toast notification
    toast({
      title: "Email Client Opened",
      description: `Gmail should open with a reply to ${contact.email}`,
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
            <p className="mt-2 text-muted-foreground">Loading contacts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage customer inquiries and support requests. {totalCount > 0 && `(${totalCount} total messages)`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" onClick={fetchContacts} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Query Type Filter */}
        <Select value={filterQueryType || "all"} onValueChange={handleQueryTypeChange}>
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="Query Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={ContactQueryType.GENERAL_QUERY}>General Query</SelectItem>
            <SelectItem value={ContactQueryType.PAYMENT_ISSUES}>Payment Issues</SelectItem>
            <SelectItem value={ContactQueryType.ACCOUNT_HELP}>Account Help</SelectItem>
            <SelectItem value={ContactQueryType.DELIVERY_OFFERS}>Delivery Offers</SelectItem>
            <SelectItem value={ContactQueryType.FEEDBACK}>Feedback</SelectItem>
            <SelectItem value={ContactQueryType.OTHER}>Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {(searchTerm || filterStatus || filterQueryType) && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterStatus === null ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick(null)}
          className={cn(filterStatus === null ? "ring-2 ring-offset-2 ring-primary" : "")}
        >
          All ({totalCount})
        </Button>
        <Button
          variant={filterStatus === ContactQueryStatus.UNREAD ? "destructive" : "outline"}
          size="sm"
          onClick={() => handleFilterClick(ContactQueryStatus.UNREAD)}
          className={cn(filterStatus === ContactQueryStatus.UNREAD ? "ring-2 ring-offset-2 ring-destructive" : "")}
        >
          New ({contacts.filter((c) => c.status === ContactQueryStatus.UNREAD).length})
        </Button>
        <Button
          variant={filterStatus === ContactQueryStatus.READ ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick(ContactQueryStatus.READ)}
          className={cn(filterStatus === ContactQueryStatus.READ ? "ring-2 ring-offset-2 ring-primary" : "")}
        >
          Read ({contacts.filter((c) => c.status === ContactQueryStatus.READ).length})
        </Button>
        <Button
          variant={filterStatus === ContactQueryStatus.PENDING_RESPONSE ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick(ContactQueryStatus.PENDING_RESPONSE)}
          className={cn(filterStatus === ContactQueryStatus.PENDING_RESPONSE ? "ring-2 ring-offset-2 ring-primary" : "")}
        >
          Pending ({contacts.filter((c) => c.status === ContactQueryStatus.PENDING_RESPONSE).length})
        </Button>
        <Button
          variant={filterStatus === ContactQueryStatus.RESOLVED ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick(ContactQueryStatus.RESOLVED)}
          className={cn(filterStatus === ContactQueryStatus.RESOLVED ? "ring-2 ring-offset-2 ring-primary" : "")}
        >
          Resolved ({contacts.filter((c) => c.status === ContactQueryStatus.RESOLVED).length})
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Contact Messages</CardTitle>
          <CardDescription className="text-sm">
            {searchTerm 
              ? `Showing ${filteredContacts.length} of ${contacts.length} messages matching "${searchTerm}"`
              : `Showing ${contacts.length} messages (page ${currentPage} of ${totalPages})`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Contact</TableHead>
                  <TableHead className="hidden sm:table-cell min-w-[200px]">Query Type</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[300px]">Message</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm 
                        ? `No messages found matching "${searchTerm}".`
                        : "No contact messages found."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{contact.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-xs text-muted-foreground truncate">{contact.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <p className="text-sm truncate max-w-[200px]">{getQueryTypeDisplayName(contact.queryType)}</p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <p className="text-sm text-muted-foreground truncate max-w-[300px]" title={contact.description}>
                          {contact.description.length > 100 
                            ? `${contact.description.substring(0, 100)}...` 
                            : contact.description
                          }
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {formatDate(contact.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(contact.status)} className="text-xs flex items-center gap-1">
                          {getStatusIcon(contact.status)}
                          {getStatusDisplayName(contact.status)}
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
                            <DropdownMenuItem onClick={() => handleViewDetails(contact)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReply(contact)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Reply via Email
                            </DropdownMenuItem>
                            {contact.status === ContactQueryStatus.UNREAD && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(contact._id, ContactQueryStatus.READ)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            {contact.status !== ContactQueryStatus.RESOLVED && contact.status !== ContactQueryStatus.CLOSED && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(contact._id, ContactQueryStatus.RESOLVED)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Resolved
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteContact(contact._id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#6F4E37] font-cormorant">
              Contact Message Details
            </DialogTitle>
            <DialogDescription className="text-[#6F4E37]/70 font-cormorant">
              View the complete message and contact information
            </DialogDescription>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-[#6F4E37] font-cormorant">Contact Information</h3>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedContact.name}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedContact.email}</p>
                    {selectedContact.phone && (
                      <p className="text-sm"><span className="font-medium">Phone:</span> {selectedContact.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-[#6F4E37] font-cormorant">Message Details</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Query Type:</span> {getQueryTypeDisplayName(selectedContact.queryType)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> 
                      <Badge variant={getStatusBadgeVariant(selectedContact.status)} className="ml-2 text-xs">
                        {getStatusDisplayName(selectedContact.status)}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date:</span> {formatDate(selectedContact.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <h3 className="font-semibold text-[#6F4E37] font-cormorant">Message</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedContact.description}</p>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedContact.adminNotes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-[#6F4E37] font-cormorant">Admin Notes</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedContact.adminNotes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedContact.status === ContactQueryStatus.UNREAD && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleStatusUpdate(selectedContact._id, ContactQueryStatus.READ)
                      setIsViewModalOpen(false)
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Read
                  </Button>
                )}
                {selectedContact.status !== ContactQueryStatus.RESOLVED && selectedContact.status !== ContactQueryStatus.CLOSED && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleStatusUpdate(selectedContact._id, ContactQueryStatus.RESOLVED)
                      setIsViewModalOpen(false)
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReply(selectedContact)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Reply via Email
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    handleDeleteContact(selectedContact._id)
                    setIsViewModalOpen(false)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
