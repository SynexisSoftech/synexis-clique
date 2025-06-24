"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ExternalLink,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  getPublicContactInfo, 
  type PublicContactInfo 
} from "../../../service/public/publicContactInfoService"
import { 
  createContactMessage, 
  type ICreateContactMessage,
  type IContactMessageResponse 
} from "../../../service/public/publiccontact"
import { ContactQueryType } from "../../../service/admincontact"

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<PublicContactInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState<ICreateContactMessage>({
    name: "",
    email: "",
    phone: "",
    queryType: ContactQueryType.GENERAL_QUERY,
    description: ""
  })

  // Fetch contact information on component mount
  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getPublicContactInfo()
      setContactInfo(data)
    } catch (err: any) {
      console.error("Error fetching contact info:", err)
      setError(err.message || "Failed to load contact information.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ICreateContactMessage, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await createContactMessage(formData)
      
      // Reset form on success
      setFormData({
        name: "",
        email: "",
        phone: "",
        queryType: ContactQueryType.GENERAL_QUERY,
        description: ""
      })

      toast({
        title: "Message Sent Successfully!",
        description: response.message || "Thank you for contacting us. We'll get back to you soon.",
      })
    } catch (err: any) {
      console.error("Error submitting contact form:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getQueryTypeIcon = (queryType: ContactQueryType) => {
    switch (queryType) {
      case ContactQueryType.PAYMENT_ISSUES:
        return <AlertCircle className="h-4 w-4" />
      case ContactQueryType.ACCOUNT_HELP:
        return <Clock className="h-4 w-4" />
      case ContactQueryType.FEEDBACK:
        return <CheckCircle className="h-4 w-4" />
      case ContactQueryType.DELIVERY_OFFERS:
        return <Mail className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6F4E37]/5 to-[#6F4E37]/10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-96 mx-auto" />
              <Skeleton className="h-6 w-80 mx-auto" />
            </div>
            
            {/* Contact Info Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Form Skeleton */}
            <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-80" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6F4E37]/5 to-[#6F4E37]/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[#6F4E37] font-cormorant">
              Get in Touch
            </h1>
            <p className="text-lg text-[#6F4E37]/70 font-cormorant max-w-2xl mx-auto">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="ml-2">{error}</span>
            </div>
          )}

          {/* Contact Information Cards */}
          {contactInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Phone Numbers */}
              {contactInfo.phoneNumbers.length > 0 && (
                <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Phone className="h-6 w-6 text-[#6F4E37]" />
                      <h3 className="text-lg font-semibold text-[#6F4E37] font-cormorant">Phone</h3>
                    </div>
                    <div className="space-y-2">
                      {contactInfo.phoneNumbers.map((phone, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-sm text-[#6F4E37]/70 font-cormorant">{phone.label}</p>
                          <a 
                            href={`tel:${phone.number}`}
                            className="text-[#6F4E37] hover:text-[#6F4E37]/70 transition-colors font-cormorant"
                          >
                            {phone.number}
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Email Addresses */}
              {contactInfo.emails.length > 0 && (
                <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="h-6 w-6 text-[#6F4E37]" />
                      <h3 className="text-lg font-semibold text-[#6F4E37] font-cormorant">Email</h3>
                    </div>
                    <div className="space-y-2">
                      {contactInfo.emails.map((email, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-sm text-[#6F4E37]/70 font-cormorant">{email.label}</p>
                          <a 
                            href={`mailto:${email.email}`}
                            className="text-[#6F4E37] hover:text-[#6F4E37]/70 transition-colors font-cormorant"
                          >
                            {email.email}
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Locations */}
              {contactInfo.locations.length > 0 && (
                <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="h-6 w-6 text-[#6F4E37]" />
                      <h3 className="text-lg font-semibold text-[#6F4E37] font-cormorant">Location</h3>
                    </div>
                    <div className="space-y-3">
                      {contactInfo.locations.map((location, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-sm text-[#6F4E37]/70 font-cormorant">{location.label}</p>
                          <div className="text-[#6F4E37] font-cormorant text-sm">
                            <p>{location.addressLine1}</p>
                            {location.addressLine2 && <p>{location.addressLine2}</p>}
                            <p>{location.city}, {location.state} {location.postalCode}</p>
                          </div>
                          {location.googleMapsUrl && (
                            <a 
                              href={location.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#6F4E37] hover:text-[#6F4E37]/70 transition-colors text-sm"
                            >
                              View on Maps
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Contact Form */}
          <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-[#6F4E37] font-cormorant">
                Send us a Message
              </CardTitle>
              <CardDescription className="text-[#6F4E37]/70 font-cormorant">
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#6F4E37] font-cormorant">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="border-[#6F4E37]/20 focus:border-[#6F4E37]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#6F4E37] font-cormorant">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                      className="border-[#6F4E37]/20 focus:border-[#6F4E37]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#6F4E37] font-cormorant">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    className="border-[#6F4E37]/20 focus:border-[#6F4E37]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="queryType" className="text-[#6F4E37] font-cormorant">
                    Query Type *
                  </Label>
                  <Select
                    value={formData.queryType}
                    onValueChange={(value) => handleInputChange("queryType", value as ContactQueryType)}
                  >
                    <SelectTrigger className="border-[#6F4E37]/20 focus:border-[#6F4E37]">
                      <SelectValue placeholder="Select query type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ContactQueryType.GENERAL_QUERY}>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          General Query
                        </div>
                      </SelectItem>
                      <SelectItem value={ContactQueryType.PAYMENT_ISSUES}>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Payment Issues
                        </div>
                      </SelectItem>
                      <SelectItem value={ContactQueryType.ACCOUNT_HELP}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Account Help
                        </div>
                      </SelectItem>
                      <SelectItem value={ContactQueryType.DELIVERY_OFFERS}>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Delivery Offers
                        </div>
                      </SelectItem>
                      <SelectItem value={ContactQueryType.FEEDBACK}>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Feedback
                        </div>
                      </SelectItem>
                      <SelectItem value={ContactQueryType.OTHER}>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Other
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#6F4E37] font-cormorant">
                    Message *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Tell us how we can help you..."
                    className="min-h-[120px] border-[#6F4E37]/20 focus:border-[#6F4E37] resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#6F4E37] hover:bg-[#6F4E37]/90 text-white font-cormorant"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-[#6F4E37] font-cormorant">
              Business Hours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <h3 className="font-semibold text-[#6F4E37] font-cormorant">Monday - Friday</h3>
                <p className="text-[#6F4E37]/70 font-cormorant">9:00 AM - 6:00 PM</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-[#6F4E37] font-cormorant">Saturday</h3>
                <p className="text-[#6F4E37]/70 font-cormorant">10:00 AM - 4:00 PM</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-[#6F4E37] font-cormorant">Sunday</h3>
                <p className="text-[#6F4E37]/70 font-cormorant">Closed</p>
              </div>
            </div>
            <p className="text-[#6F4E37]/70 font-cormorant">
              We typically respond to inquiries within 24 hours during business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
