"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, MessageSquare, Trash2, Loader2, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils" // Assuming you have a utility for conditional classnames

// Import the service and its types
import {
  adminContactUsService,
  IContactMessage,
  ContactQueryStatus,
} from "../../../service/admincontact"

export default function ContactsPage() {
  const [contacts, setContacts] = useState<IContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // New state for filtering contacts by status
  const [filterStatus, setFilterStatus] = useState<ContactQueryStatus | null>(null)

  // Fetch contacts whenever the filterStatus changes
  useEffect(() => {
    fetchContacts()
  }, [filterStatus]) // Dependency array now includes filterStatus

  const fetchContacts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Pass the filterStatus to the service call
      const response = await adminContactUsService.getMessages(
        1,
        100,
        filterStatus !== null ? filterStatus : undefined // Only pass status if it's not null
      );
      setContacts(response.messages)
    } catch (err: any) {
      console.error("Error fetching contacts:", err)
      setError(err.message || "Failed to fetch contact messages.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact message? This action cannot be undone.")) {
      return;
    }
    try {
      await adminContactUsService.deleteMessage(id);
      setContacts(prevContacts => prevContacts.filter(contact => contact._id !== id));
      // Optionally show a success toast/message
    } catch (err: any) {
      console.error("Error deleting contact:", err);
      setError(err.message || "Failed to delete contact message.");
    }
  };

  const getStatusBadgeVariant = (status: ContactQueryStatus) => {
    switch (status) {
      case ContactQueryStatus.UNREAD:
        return "destructive"
      case ContactQueryStatus.PENDING:
        return "default"
      case ContactQueryStatus.RESOLVED:
        return "success"
      case ContactQueryStatus.READ:
        return "outline"
      case ContactQueryStatus.SPAM:
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFilterClick = (status: ContactQueryStatus | null) => {
    // If clicking the currently active filter, reset to show all
    if (filterStatus === status) {
      setFilterStatus(null);
    } else {
      setFilterStatus(status);
    }
  };

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
          <p className="text-muted-foreground text-sm sm:text-base">Manage customer inquiries and support requests.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {/* All Messages Button */}
          <Button
            variant={filterStatus === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterClick(null)}
            className={cn(filterStatus === null ? "ring-2 ring-offset-2 ring-primary" : "")}
          >
            All ({contacts.length})
          </Button>
          {/* Unread Button */}
          <Button
            variant={filterStatus === ContactQueryStatus.UNREAD ? "destructive" : "outline"}
            size="sm"
            onClick={() => handleFilterClick(ContactQueryStatus.UNREAD)}
            className={cn(filterStatus === ContactQueryStatus.UNREAD ? "ring-2 ring-offset-2 ring-destructive" : "")}
          >
            New ({contacts.filter((c) => c.status === ContactQueryStatus.UNREAD).length})
          </Button>
          {/* Read Button */}
          <Button
            variant={filterStatus === ContactQueryStatus.READ ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterClick(ContactQueryStatus.READ)}
            className={cn(filterStatus === ContactQueryStatus.READ ? "ring-2 ring-offset-2 ring-primary" : "")}
          >
            Read ({contacts.filter((c) => c.status === ContactQueryStatus.READ).length})
          </Button>
          {/* Other statuses can be added similarly */}
          <Button variant="outline" size="sm" onClick={fetchContacts} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Contact Messages</CardTitle>
          <CardDescription className="text-sm">Customer inquiries and support requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Contact</TableHead>
                  <TableHead className="hidden sm:table-cell min-w-[200px]">Query Type</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No contact messages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{contact.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{contact.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <p className="text-sm truncate max-w-[200px]">{contact.queryType}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {formatDate(contact.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(contact.status)} className="text-xs">
                          {contact.status}
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
                            <DropdownMenuItem onClick={() => alert(`Viewing contact: ${contact._id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert(`Replying to contact: ${contact._id}`)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Reply
                            </DropdownMenuItem>
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
        </CardContent>
      </Card>
    </div>
  )
}