"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Facebook, Instagram, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Footer from "../components/footer/footer"
import Navbar from "../components/navbar/navbar"

const queryTypes = [
  { value: "GENERAL_QUERY", label: "General Query" },
  { value: "ACCOUNT_HELP", label: "Account Help" },
  { value: "DELIVERY_OFFERS", label: "Delivery & Offers" },
  { value: "PAYMENT_ISSUES", label: "Payment Issues" },
  { value: "FEEDBACK", label: "Feedback" },
  { value: "OTHER", label: "Other" },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    queryType: "GENERAL_QUERY",
    description: "I have a question about your services",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Form submitted:", formData)
    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: "",
        email: "",
        queryType: "",
        description: "",
      })
    }, 3000)
  }

  return (
    <>
    <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section with Single Image */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <Image
            src="/placeholder.svg?height=800&width=1600&text=Contact+Us"
            alt="Contact us"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#6F4E37]/90 to-[#6F4E37]/70" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Get in Touch</h1>
                <p className="text-lg md:text-xl text-white/90 max-w-xl">
                  We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
              {/* Contact Form - Takes more space */}
              <div className="lg:col-span-3">
                <Card className="shadow-lg border-0 overflow-hidden">
                  <div className="bg-[#6F4E37] p-6 text-white">
                    <h2 className="text-2xl font-bold">Send us a Message</h2>
                    <p className="text-white/80 mt-1">We're here to help you</p>
                  </div>

                  <CardContent className="p-6 md:p-8">
                    {isSubmitted ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                        <p className="text-gray-600">Thank you for contacting us. We'll get back to you soon.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                              Full Name *
                            </Label>
                            <Input
                              id="name"
                              type="text"
                              value={formData.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              className="h-11 border-gray-200 focus:border-[#6F4E37] focus:ring-[#6F4E37]"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                              Email Address *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              className="h-11 border-gray-200 focus:border-[#6F4E37] focus:ring-[#6F4E37]"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="queryType" className="text-sm font-medium text-gray-700">
                            Query Type *
                          </Label>
                          <Select
                            value={formData.queryType}
                            onValueChange={(value) => handleInputChange("queryType", value)}
                          >
                            <SelectTrigger className="h-11 border-gray-200 focus:border-[#6F4E37] focus:ring-[#6F4E37]">
                              <SelectValue placeholder="Select query type" />
                            </SelectTrigger>
                            <SelectContent>
                              {queryTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                            Message *
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className="min-h-32 border-gray-200 focus:border-[#6F4E37] focus:ring-[#6F4E37] resize-none"
                            placeholder="Please describe your query in detail..."
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-11 bg-[#6F4E37] hover:bg-[#5d4230] text-white font-medium transition-colors"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              Send Message
                            </div>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information - Takes less space */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg border-0 overflow-hidden">
                  <div className="bg-[#6F4E37] p-6 text-white">
                    <h2 className="text-xl font-bold">Contact Information</h2>
                    <p className="text-white/80 mt-1">Reach out to us directly</p>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#6F4E37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-[#6F4E37]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Email</h3>
                        <p className="text-gray-600">support@fashionstore.com</p>
                        <p className="text-gray-600">hello@fashionstore.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#6F4E37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-[#6F4E37]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Phone</h3>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                        <p className="text-gray-600">+1 (555) 987-6543</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#6F4E37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-[#6F4E37]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Address</h3>
                        <p className="text-gray-600">123 Fashion Street</p>
                        <p className="text-gray-600">New York, NY 10001</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#6F4E37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-[#6F4E37]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Hours</h3>
                        <p className="text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
                        <p className="text-gray-600">Sat - Sun: 10:00 AM - 4:00 PM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Connect With Us</h3>
                    <div className="flex space-x-4">
                      <a
                        href="#"
                        className="w-10 h-10 bg-[#6F4E37] text-white rounded-full flex items-center justify-center hover:bg-[#5d4230] transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                        <span className="sr-only">Facebook</span>
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 bg-[#6F4E37] text-white rounded-full flex items-center justify-center hover:bg-[#5d4230] transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 bg-[#6F4E37] text-white rounded-full flex items-center justify-center hover:bg-[#5d4230] transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 bg-[#6F4E37] text-white rounded-full flex items-center justify-center hover:bg-[#5d4230] transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  )
}
