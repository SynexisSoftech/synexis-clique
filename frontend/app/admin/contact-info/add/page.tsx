"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus, X, Phone, Mail, MapPin, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createOrUpdateContactInfo, type IPhoneNumber, type IEmail, type ILocation } from "../../../../service/contactInfoService"

export default function AddContactInfoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    phoneNumbers: [{ label: "", number: "" }],
    emails: [{ label: "", email: "" }],
    locations: [{
      label: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      googleMapsUrl: ""
    }]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, { label: "", number: "" }]
    }))
  }

  const removePhoneNumber = (index: number) => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.filter((_, i) => i !== index)
    }))
  }

  const updatePhoneNumber = (index: number, field: keyof IPhoneNumber, value: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map((phone, i) => 
        i === index ? { ...phone, [field]: value } : phone
      )
    }))
  }

  const addEmail = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, { label: "", email: "" }]
    }))
  }

  const removeEmail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }))
  }

  const updateEmail = (index: number, field: keyof IEmail, value: string) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => 
        i === index ? { ...email, [field]: value } : email
      )
    }))
  }

  const addLocation = () => {
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, {
        label: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        googleMapsUrl: ""
      }]
    }))
  }

  const removeLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }))
  }

  const updateLocation = (index: number, field: keyof ILocation, value: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map((location, i) => 
        i === index ? { ...location, [field]: value } : location
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Filter out incomplete entries
      const cleanedData = {
        phoneNumbers: formData.phoneNumbers.filter(p => p.label.trim() && p.number.trim()),
        emails: formData.emails.filter(e => e.label.trim() && e.email.trim()),
        locations: formData.locations.filter(l => 
          l.label.trim() && 
          l.addressLine1.trim() && 
          l.city.trim() && 
          l.state.trim() && 
          l.postalCode.trim()
        )
      }

      await createOrUpdateContactInfo(cleanedData)
      setSuccess(true)
      setTimeout(() => router.push("/admin/contact-info"), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create contact information")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin/contact-info">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Contact Info
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Contact Information</h1>
              <p className="text-gray-600 mt-2">Create new contact information for your website</p>
            </div>
          </div>

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Contact information created successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Phone Numbers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Numbers
                </CardTitle>
                <CardDescription>Add multiple phone numbers with labels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.phoneNumbers.map((phone, index) => (
                  <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Phone #{index + 1}</h4>
                      {formData.phoneNumbers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePhoneNumber(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`phone-label-${index}`}>Label *</Label>
                        <Input
                          id={`phone-label-${index}`}
                          placeholder="e.g., Customer Support, Sales"
                          value={phone.label}
                          onChange={(e) => updatePhoneNumber(index, "label", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`phone-number-${index}`}>Phone Number *</Label>
                        <Input
                          id={`phone-number-${index}`}
                          type="tel"
                          placeholder="e.g., +1 (555) 123-4567"
                          value={phone.number}
                          onChange={(e) => updatePhoneNumber(index, "number", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPhoneNumber}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Phone Number
                </Button>
              </CardContent>
            </Card>

            {/* Email Addresses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Addresses
                </CardTitle>
                <CardDescription>Add multiple email addresses with labels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.emails.map((email, index) => (
                  <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Email #{index + 1}</h4>
                      {formData.emails.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmail(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`email-label-${index}`}>Label *</Label>
                        <Input
                          id={`email-label-${index}`}
                          placeholder="e.g., General Inquiries, Support"
                          value={email.label}
                          onChange={(e) => updateEmail(index, "label", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`email-address-${index}`}>Email Address *</Label>
                        <Input
                          id={`email-address-${index}`}
                          type="email"
                          placeholder="e.g., info@example.com"
                          value={email.email}
                          onChange={(e) => updateEmail(index, "email", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmail}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Email Address
                </Button>
              </CardContent>
            </Card>

            {/* Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Locations
                </CardTitle>
                <CardDescription>Add business locations and addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.locations.map((location, index) => (
                  <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Location #{index + 1}</h4>
                      {formData.locations.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLocation(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`location-label-${index}`}>Label *</Label>
                      <Input
                        id={`location-label-${index}`}
                        placeholder="e.g., Head Office, Warehouse"
                        value={location.label}
                        onChange={(e) => updateLocation(index, "label", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`location-address1-${index}`}>Address Line 1 *</Label>
                      <Input
                        id={`location-address1-${index}`}
                        placeholder="Street address"
                        value={location.addressLine1}
                        onChange={(e) => updateLocation(index, "addressLine1", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`location-address2-${index}`}>Address Line 2</Label>
                      <Input
                        id={`location-address2-${index}`}
                        placeholder="Apartment, suite, unit, etc. (optional)"
                        value={location.addressLine2}
                        onChange={(e) => updateLocation(index, "addressLine2", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`location-city-${index}`}>City *</Label>
                        <Input
                          id={`location-city-${index}`}
                          placeholder="City"
                          value={location.city}
                          onChange={(e) => updateLocation(index, "city", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`location-state-${index}`}>State/Province *</Label>
                        <Input
                          id={`location-state-${index}`}
                          placeholder="State/Province"
                          value={location.state}
                          onChange={(e) => updateLocation(index, "state", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`location-postal-${index}`}>Postal Code *</Label>
                        <Input
                          id={`location-postal-${index}`}
                          placeholder="Postal/ZIP Code"
                          value={location.postalCode}
                          onChange={(e) => updateLocation(index, "postalCode", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`location-maps-${index}`}>Google Maps URL</Label>
                      <Input
                        id={`location-maps-${index}`}
                        placeholder="https://maps.google.com/..."
                        value={location.googleMapsUrl || ""}
                        onChange={(e) => updateLocation(index, "googleMapsUrl", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLocation}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Location
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/admin/contact-info">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Contact Info"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
