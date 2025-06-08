"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Phone, Mail, MapPin, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ContactInfo, getContactInfo, deleteContactInfo } from "../../../service/contactInfoService"

export default function ContactInfoPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getContactInfo()
      setContactInfo(data)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch contact information")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!contactInfo?._id || !confirm("Are you sure you want to delete this contact information?")) {
      return
    }

    try {
      setDeleting(true)
      await deleteContactInfo(contactInfo._id)
      setContactInfo(null)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete contact information")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contact Information</h1>
              <p className="text-gray-600 mt-2">Manage your website's contact details</p>
            </div>
            <div className="flex gap-2">
              {!contactInfo && !loading && (
                <Link href="/admin/contact-info/add">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Contact Info
                  </Button>
                </Link>
              )}
              {contactInfo && (
                <>
                  <Link href={`/admin/contact-info/edit/${contactInfo._id}`}>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-[200px]" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-[150px]" />
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-[150px]" />
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-[150px]" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[180px]" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!loading && !contactInfo && !error && (
            <Card>
              <CardHeader>
                <CardTitle>No Contact Information Found</CardTitle>
                <CardDescription>
                  You haven't added any contact information yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/contact-info/add">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Contact Info
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {!loading && contactInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>
                  This information will be displayed on your website's contact page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.phoneNumbers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Phone Numbers</h3>
                    <div className="space-y-2">
                      {contactInfo.phoneNumbers.map((phone, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">{phone.label}</p>
                            <p className="text-gray-700">{phone.number}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contactInfo.emails.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Email Addresses</h3>
                    <div className="space-y-2">
                      {contactInfo.emails.map((email, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">{email.label}</p>
                            <p className="text-gray-700">{email.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contactInfo.locations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Locations</h3>
                    <div className="space-y-4">
                      {contactInfo.locations.map((location, index) => (
                        <div key={index} className="flex space-x-3">
                          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-medium text-sm">{location.label}</p>
                            <p className="text-gray-700">
                              {location.addressLine1}<br />
                              {location.addressLine2 && <>{location.addressLine2}<br /></>}
                              {location.city}, {location.state} {location.postalCode}
                            </p>
                            {location.googleMapsUrl && (
                              <a 
                                href={location.googleMapsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View on Google Maps
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contactInfo.createdAt && (
                  <div className="text-sm text-gray-500 mt-4">
                    Last updated: {new Date(contactInfo.updatedAt || contactInfo.createdAt).toLocaleString()}
                    {contactInfo.updatedBy && (
                      <span> by {contactInfo.updatedBy.username}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}