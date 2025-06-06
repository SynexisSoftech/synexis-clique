"use client"

import { useState } from "react"
import Image from "next/image"
import { Award, Users, Globe, Heart, ArrowRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"

// Static data - can be easily replaced with API calls later
const aboutData = {
  hero: {
    title: "Crafting Timeless Fashion Since 2010",
    subtitle: "Where Elegance Meets Innovation",
    description:
      "We believe that fashion is more than just clothing—it's a form of self-expression, a way to tell your story, and a means to feel confident in your own skin.",
    image: "/placeholder.svg?height=600&width=800&text=About+Hero",
  },
  mission: {
    title: "Our Mission",
    description:
      "To create exceptional fashion pieces that empower individuals to express their unique style while maintaining the highest standards of quality and sustainability.",
    values: [
      {
        icon: Heart,
        title: "Passion",
        description: "Every piece is crafted with love and attention to detail",
      },
      {
        icon: Award,
        title: "Quality",
        description: "We use only the finest materials and craftsmanship",
      },
      {
        icon: Globe,
        title: "Sustainability",
        description: "Committed to ethical and environmentally conscious practices",
      },
      {
        icon: Users,
        title: "Community",
        description: "Building connections through shared style and values",
      },
    ],
  },
  story: {
    title: "Our Story",
    content:
      "Founded in 2010 by fashion enthusiasts Sarah Chen and Marcus Rodriguez, our brand began as a small boutique in downtown Manhattan. What started as a dream to create accessible luxury fashion has grown into a global community of style-conscious individuals who value quality, authenticity, and self-expression.",
    image: "/placeholder.svg?height=500&width=700&text=Our+Story",
  },
  team: {
    title: "Meet Our Team",
    subtitle: "The creative minds behind our brand",
    members: [
      {
        name: "Sarah Chen",
        role: "Co-Founder & Creative Director",
        image: "/placeholder.svg?height=300&width=300&text=Sarah+Chen",
        bio: "With over 15 years in fashion design, Sarah brings her vision of timeless elegance to every collection.",
      },
      {
        name: "Marcus Rodriguez",
        role: "Co-Founder & CEO",
        image: "/placeholder.svg?height=300&width=300&text=Marcus+Rodriguez",
        bio: "Marcus combines business acumen with a passion for sustainable fashion practices.",
      },
      {
        name: "Elena Vasquez",
        role: "Head of Design",
        image: "/placeholder.svg?height=300&width=300&text=Elena+Vasquez",
        bio: "Elena's innovative approach to contemporary fashion has earned recognition worldwide.",
      },
      {
        name: "James Thompson",
        role: "Sustainability Director",
        image: "/placeholder.svg?height=300&width=300&text=James+Thompson",
        bio: "James leads our commitment to ethical sourcing and environmental responsibility.",
      },
    ],
  },
  timeline: {
    title: "Our Journey",
    milestones: [
      {
        year: "2010",
        title: "The Beginning",
        description: "Founded our first boutique in Manhattan with a vision to democratize luxury fashion.",
      },
      {
        year: "2013",
        title: "Digital Expansion",
        description: "Launched our e-commerce platform, reaching customers worldwide.",
      },
      {
        year: "2016",
        title: "Sustainability Initiative",
        description: "Introduced our eco-friendly collection and sustainable practices.",
      },
      {
        year: "2019",
        title: "Global Recognition",
        description: "Received the Fashion Innovation Award for our sustainable practices.",
      },
      {
        year: "2022",
        title: "Community Impact",
        description: "Launched our mentorship program for emerging designers.",
      },
      {
        year: "2024",
        title: "Future Forward",
        description: "Continuing to innovate with AI-powered personalization and virtual styling.",
      },
    ],
  },
  stats: {
    title: "Our Impact",
    metrics: [
      { number: "500K+", label: "Happy Customers" },
      { number: "50+", label: "Countries Served" },
      { number: "1M+", label: "Items Sold" },
      { number: "98%", label: "Customer Satisfaction" },
    ],
  },
  testimonial: {
    quote:
      "This brand has completely transformed my wardrobe. Every piece I own from them makes me feel confident and beautiful. The quality is unmatched, and I love their commitment to sustainability.",
    author: "Jessica Williams",
    role: "Fashion Blogger & Loyal Customer",
    image: "/placeholder.svg?height=100&width=100&text=Jessica",
  },
}

export default function AboutPage() {
  const [activeTimelineItem, setActiveTimelineItem] = useState(0)

  return (
    <>
    <Navbar />
  
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <Image
          src={aboutData.hero.image || "/placeholder.svg"}
          alt="About us hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#6F4E37]/90 to-[#6F4E37]/70" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl text-white">
              <p className="text-lg md:text-xl font-cormorant italic mb-4 text-amber-100">{aboutData.hero.subtitle}</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-cormorant font-medium italic mb-6">
                {aboutData.hero.title}
              </h1>
              <p className="text-lg md:text-xl font-cormorant leading-relaxed max-w-2xl">
                {aboutData.hero.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 md:py-24 bg-amber-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-cormorant font-medium italic text-[#6F4E37] mb-6">
              {aboutData.mission.title}
            </h2>
            <div className="w-24 h-1 bg-[#6F4E37]/30 mx-auto mb-8"></div>
            <p className="text-lg md:text-xl font-cormorant text-gray-700 max-w-3xl mx-auto">
              {aboutData.mission.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutData.mission.values.map((value, index) => (
              <Card key={index} className="border-[#6F4E37]/20 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#6F4E37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <value.icon className="h-8 w-8 text-[#6F4E37]" />
                  </div>
                  <h3 className="text-xl font-cormorant font-medium italic text-[#6F4E37] mb-4">{value.title}</h3>
                  <p className="font-cormorant text-gray-700 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-cormorant font-medium italic text-[#6F4E37] mb-8">
                {aboutData.story.title}
              </h2>
              <div className="w-24 h-1 bg-[#6F4E37]/30 mb-8"></div>
              <p className="text-lg font-cormorant text-gray-700 leading-relaxed mb-8">{aboutData.story.content}</p>
              <Button className="bg-[#6F4E37] hover:bg-[#5d4230] text-white font-cormorant font-medium italic text-lg px-8 py-3">
                Learn More About Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Image
                src={aboutData.story.image || "/placeholder.svg"}
                alt="Our story"
                width={700}
                height={500}
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#6F4E37]/10 rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 md:py-24 bg-[#6F4E37] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cormorant font-medium italic mb-4">{aboutData.stats.title}</h2>
            <div className="w-24 h-1 bg-white/30 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutData.stats.metrics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-cormorant font-bold mb-2">{stat.number}</div>
                <div className="text-lg font-cormorant italic text-amber-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-amber-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-cormorant font-medium italic text-[#6F4E37] mb-6">
              {aboutData.timeline.title}
            </h2>
            <div className="w-24 h-1 bg-[#6F4E37]/30 mx-auto"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-[#6F4E37]/20"></div>

              {aboutData.timeline.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <Card className="border-[#6F4E37]/20 shadow-lg">
                      <CardContent className="p-6">
                        <div className="text-2xl font-cormorant font-bold text-[#6F4E37] mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-cormorant font-medium italic text-[#6F4E37] mb-3">
                          {milestone.title}
                        </h3>
                        <p className="font-cormorant text-gray-700">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#6F4E37] rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-cormorant font-medium italic text-[#6F4E37] mb-4">
              {aboutData.team.title}
            </h2>
            <div className="w-24 h-1 bg-[#6F4E37]/30 mx-auto mb-6"></div>
            <p className="text-lg font-cormorant italic text-gray-700">{aboutData.team.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutData.team.members.map((member, index) => (
              <Card
                key={index}
                className="border-[#6F4E37]/20 shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="relative">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#6F4E37]/80 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-cormorant font-medium italic text-[#6F4E37] mb-2">{member.name}</h3>
                  <p className="font-cormorant text-amber-700 mb-3">{member.role}</p>
                  <p className="font-cormorant text-gray-700 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 md:py-24 bg-amber-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Quote className="h-12 w-12 text-[#6F4E37]/30 mx-auto mb-8" />
            <blockquote className="text-xl md:text-2xl font-cormorant italic text-gray-700 mb-8 leading-relaxed">
              "{aboutData.testimonial.quote}"
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <Image
                src={aboutData.testimonial.image || "/placeholder.svg"}
                alt={aboutData.testimonial.author}
                width={60}
                height={60}
                className="rounded-full"
              />
              <div className="text-left">
                <div className="font-cormorant font-medium text-[#6F4E37]">{aboutData.testimonial.author}</div>
                <div className="font-cormorant italic text-gray-600">{aboutData.testimonial.role}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
    </div>

    <Footer />
      </>
  )
}
