"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Award, Users, Globe, Heart, ArrowRight, Quote, ChevronDown, Sparkles, Star } from "lucide-react"
import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"

// Enhanced TypeScript interfaces
interface Value {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
  gradient: string
  iconColor: string
}

interface TeamMember {
  name: string
  role: string
  image: string
  bio: string
  specialty: string
}

interface TimelineMilestone {
  year: string
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface Metric {
  number: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface LaunchFeature {
  title: string
  description: string
}

interface AboutData {
  hero: {
    title: string
    subtitle: string
    description: string
    image: string
  }
  mission: {
    title: string
    description: string
    values: Value[]
  }
  story: {
    title: string
    content: string
    image: string
  }
  team: {
    title: string
    subtitle: string
    members: TeamMember[]
  }
  timeline: {
    title: string
    milestones: TimelineMilestone[]
  }
  stats: {
    title: string
    metrics: Metric[]
  }
  testimonial: {
    quote: string
    author: string
    role: string
    image: string
    rating: number
  }
  launch: {
    title: string
    subtitle: string
    description: string
    features: LaunchFeature[]
  }
}

// Static data with proper typing
const aboutData: AboutData = {
  hero: {
    title: "The Future of Fashion is Here",
    subtitle: "Launching 2025",
    description:
      "Pioneering sustainable luxury fashion for the next generation. Join us as we redefine style, quality, and environmental consciousness.",
    image:
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  mission: {
    title: "Our Vision for 2025",
    description:
      "To revolutionize fashion by creating extraordinary pieces that harmonize luxury, sustainability, and innovation for the conscious consumer of tomorrow.",
    values: [
      {
        icon: Heart,
        title: "Innovation",
        description: "Pushing boundaries with cutting-edge sustainable materials and technology",
        gradient: "from-rose-400 to-pink-500",
        iconColor: "text-rose-500",
      },
      {
        icon: Award,
        title: "Quality",
        description: "Uncompromising excellence in every thread, stitch, and design detail",
        gradient: "from-amber-400 to-orange-500",
        iconColor: "text-amber-500",
      },
      {
        icon: Globe,
        title: "Sustainability",
        description: "Leading the industry in eco-conscious practices and carbon neutrality",
        gradient: "from-emerald-400 to-teal-500",
        iconColor: "text-emerald-500",
      },
      {
        icon: Users,
        title: "Community",
        description: "Building a global movement of conscious fashion enthusiasts",
        gradient: "from-blue-400 to-indigo-500",
        iconColor: "text-blue-500",
      },
    ],
  },
  story: {
    title: "Our Story",
    content:
      "Born from a vision to transform fashion for the digital age, our brand represents the convergence of timeless elegance and modern innovation. Set to launch in 2025, we're crafting a new narrative in sustainable luxury fashion—one that respects our planet while celebrating individual style and expression.",
    image:
      "https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  team: {
    title: "Meet Our Team",
    subtitle: "The creative minds behind our brand",
    members: [
      {
        name: "Sarah Chen",
        role: "Co-Founder & Creative Director",
        image:
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
        bio: "With over 15 years in fashion design, Sarah brings her vision of timeless elegance to every collection.",
        specialty: "Creative Vision",
      },
      {
        name: "Marcus Rodriguez",
        role: "Co-Founder & CEO",
        image:
          "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
        bio: "Marcus combines business acumen with a passion for sustainable fashion practices.",
        specialty: "Strategic Leadership",
      },
      {
        name: "Elena Vasquez",
        role: "Head of Design",
        image:
          "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
        bio: "Elena's innovative approach to contemporary fashion has earned recognition worldwide.",
        specialty: "Design Innovation",
      },
      {
        name: "James Thompson",
        role: "Sustainability Director",
        image:
          "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
        bio: "James leads our commitment to ethical sourcing and environmental responsibility.",
        specialty: "Sustainability",
      },
    ],
  },
  timeline: {
    title: "Our Journey",
    milestones: [
      {
        year: "2022",
        title: "The Vision",
        description: "Conceptualized our sustainable luxury fashion brand with a focus on innovation.",
        icon: Sparkles,
      },
      {
        year: "2023",
        title: "Team Formation",
        description: "Assembled our world-class team of designers and sustainability experts.",
        icon: Users,
      },
      {
        year: "2024",
        title: "Development Phase",
        description: "Perfecting our sustainable materials and production processes.",
        icon: Heart,
      },
      {
        year: "2025",
        title: "Global Launch",
        description: "Ready to revolutionize fashion with our inaugural collections.",
        icon: Star,
      },
    ],
  },
  stats: {
    title: "Our Impact Vision",
    metrics: [
      { number: "100%", label: "Sustainable Materials", icon: Heart },
      { number: "50+", label: "Countries at Launch", icon: Globe },
      { number: "0", label: "Carbon Footprint", icon: Award },
      { number: "2025", label: "Launch Year", icon: Star },
    ],
  },
  testimonial: {
    quote:
      "I've been following this brand's journey since the beginning. Their commitment to sustainability and innovation in fashion is exactly what our industry needs. Can't wait for the 2025 launch!",
    author: "Jessica Williams",
    role: "Fashion Industry Analyst",
    image:
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
    rating: 5,
  },
  launch: {
    title: "Launching 2025",
    subtitle: "Be part of the fashion revolution",
    description: "Join our exclusive pre-launch community and get first access to our collections.",
    features: [
      { title: "Sustainable Materials", description: "100% eco-friendly fabrics" },
      { title: "Carbon Neutral", description: "Zero carbon footprint" },
      { title: "Ethical Production", description: "Fair trade certified" },
      { title: "Global Shipping", description: "50+ countries ready" },
    ],
  },
}

// Enhanced TypeScript component interfaces
interface CardProps {
  children: React.ReactNode
  className?: string
  [key: string]: any
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
  [key: string]: any
}

interface ButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "secondary"
  [key: string]: any
}

// Enhanced custom components
const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div
    className={`bg-white/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </div>
)

const CardContent: React.FC<CardContentProps> = ({ children, className = "", ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
)

const Button: React.FC<ButtonProps> = ({ children, className = "", variant = "primary", ...props }) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-[#6F4E37] to-[#5d4230] hover:from-[#5d4230] hover:to-[#4a3426] text-white shadow-md hover:shadow-lg",
    secondary: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-6 py-3 font-cormorant font-medium italic transition-all duration-300 hover:scale-105 active:scale-95 transform-gpu ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Enhanced animation hooks with proper TypeScript
const useScrollAnimation = (): number => {
  const [scrollY, setScrollY] = useState<number>(0)

  useEffect(() => {
    const handleScroll = (): void => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return scrollY
}

const useInView = (threshold = 0.1): [(node: Element | null) => void, boolean] => {
  const [ref, setRef] = useState<Element | null>(null)
  const [inView, setInView] = useState<boolean>(false)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold,
      rootMargin: "50px",
    })

    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, threshold])

  return [setRef, inView]
}

const useMousePosition = (): { x: number; y: number } => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return mousePosition
}

const AboutPage: React.FC = () => {
  const scrollY = useScrollAnimation()
  const mousePosition = useMousePosition()
  const [heroRef, heroInView] = useInView()
  const [missionRef, missionInView] = useInView()
  const [storyRef, storyInView] = useInView()
  const [teamRef, teamInView] = useInView()
  const [timelineRef, timelineInView] = useInView()
  const [statsRef, statsInView] = useInView()
  const [launchRef, launchInView] = useInView()

  return (
    <div className="font-cormorant">
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20 overflow-hidden">
        {/* Hero Section */}
        <section ref={heroRef} className="relative h-screen overflow-hidden">
          {/* Dynamic background with parallax */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 will-change-transform"
            style={{
              backgroundImage: `url(${aboutData.hero.image})`,
              transform: `translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0002})`,
            }}
          />

          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6F4E37]/95 via-[#6F4E37]/85 to-[#6F4E37]/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Animated floating elements */}
          <div
            className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-amber-200/20 to-orange-300/10 rounded-full blur-2xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            }}
          />
          <div
            className="absolute bottom-32 left-16 w-32 h-32 bg-gradient-to-br from-amber-300/15 to-yellow-200/10 rounded-full blur-xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
              animationDelay: "1s",
            }}
          />

          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 lg:px-8">
              <div
                className={`max-w-5xl text-white transition-all duration-1500 ${heroInView ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
                  <p className="text-lg md:text-xl font-cormorant font-medium italic tracking-wider uppercase text-amber-100">
                    {aboutData.hero.subtitle}
                  </p>
                  <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-cormorant font-light italic mb-10 leading-tight tracking-tight">
                  <span className="block overflow-hidden">
                    <span
                      className={`block transition-transform duration-1000 delay-300 ${heroInView ? "translate-y-0" : "translate-y-full"}`}
                    >
                      The Future of
                    </span>
                  </span>
                  <span className="block overflow-hidden">
                    <span
                      className={`block transition-transform duration-1000 delay-500 ${heroInView ? "translate-y-0" : "translate-y-full"}`}
                    >
                      Fashion is
                    </span>
                  </span>
                  <span className="block overflow-hidden">
                    <span
                      className={`block bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent transition-transform duration-1000 delay-700 ${heroInView ? "translate-y-0" : "translate-y-full"}`}
                    >
                      Here
                    </span>
                  </span>
                </h1>

                <p
                  className={`text-xl md:text-2xl font-light leading-relaxed max-w-4xl mb-12 text-gray-100 transition-all duration-1000 delay-900 ${heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                >
                  {aboutData.hero.description}
                </p>

                <div
                  className={`flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-8 transition-all duration-1000 delay-1100 ${heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                >
                  <Button className="px-10 py-4 text-lg font-medium group">
                    Be First to Know
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>

                  <div className="flex items-center space-x-4 text-amber-200">
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
                    <span className="font-light tracking-widest uppercase text-sm font-cormorant italic">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center space-y-2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
              </div>
              <ChevronDown className="h-6 w-6 text-white/70" />
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section ref={missionRef} className="py-24 md:py-32 relative overflow-hidden">
          {/* Enhanced background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 -left-40 w-96 h-96 bg-gradient-to-br from-[#6F4E37]/8 to-amber-200/5 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-20 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/8 to-orange-300/5 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#6F4E37]/3 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-6 lg:px-8 relative">
            <div
              className={`text-center mb-20 transition-all duration-1000 delay-200 ${missionInView ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}
            >
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#6F4E37]/40 to-transparent" />
                <Sparkles className="h-6 w-6 text-[#6F4E37]/60" />
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#6F4E37]/40 to-transparent" />
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#6F4E37] mb-8 tracking-tight">
                {aboutData.mission.title}
              </h2>

              <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#6F4E37]/40 to-transparent mx-auto mb-10" />

              <p className="text-lg md:text-xl font-light text-gray-700 max-w-4xl mx-auto leading-relaxed">
                {aboutData.mission.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {aboutData.mission.values.map((value, index) => (
                <Card
                  key={index}
                  className={`group border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 hover:rotate-1 ${missionInView ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}
                  style={{ transitionDelay: `${400 + index * 150}ms` }}
                >
                  <CardContent className="p-8 text-center relative overflow-hidden">
                    {/* Background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    />

                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-md">
                        <value.icon
                          className={`h-8 w-8 ${value.iconColor} group-hover:scale-110 transition-transform duration-300`}
                        />
                      </div>

                      <h3 className="text-xl font-medium text-[#6F4E37] mb-4 group-hover:text-[#5d4230] transition-colors duration-300">
                        {value.title}
                      </h3>

                      <p className="font-light text-gray-700 leading-relaxed text-sm group-hover:text-gray-800 transition-colors duration-300">
                        {value.description}
                      </p>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section ref={storyRef} className="py-32 md:py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6F4E37]/5 via-transparent to-amber-50/30" />

          <div className="container mx-auto px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div
                className={`transition-all duration-1000 ${storyInView ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-px bg-[#6F4E37]/40" />
                  <Quote className="h-8 w-8 text-[#6F4E37]/60" />
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-cormorant font-light italic text-[#6F4E37] mb-12 tracking-tight">
                  {aboutData.story.title}
                </h2>

                <div className="w-32 h-px bg-gradient-to-r from-[#6F4E37]/40 to-transparent mb-12" />

                <p className="text-lg md:text-xl font-light text-gray-700 leading-relaxed mb-8 tracking-wide">
                  {aboutData.story.content.split(".")[0]}.
                </p>

                <p className="text-lg md:text-xl font-light text-gray-700 leading-relaxed mb-16 tracking-wide">
                  {aboutData.story.content.split(".").slice(1).join(".").trim()}
                </p>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                  <Button className="px-12 py-5 text-lg font-medium group">
                    Join Our Journey
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>

                  <Button
                    variant="secondary"
                    className="bg-white/10 backdrop-blur-sm border border-[#6F4E37]/20 text-[#6F4E37] hover:bg-[#6F4E37]/10 px-12 py-5 text-lg font-medium"
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              <div
                className={`relative transition-all duration-1000 delay-300 ${storyInView ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-br from-[#6F4E37]/20 to-amber-200/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                    <img
                      src={aboutData.story.image || "/placeholder.svg"}
                      alt="Our story"
                      className="w-full h-[700px] object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#6F4E37]/30 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#6F4E37]/10 group-hover:to-[#6F4E37]/20 transition-all duration-500" />
                  </div>
                </div>

                {/* Floating decorative elements */}
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#6F4E37]/10 to-amber-200/10 rounded-full blur-2xl -z-10 animate-pulse" />
                <div
                  className="absolute -top-12 -left-12 w-40 h-40 bg-gradient-to-br from-amber-200/10 to-orange-300/10 rounded-full blur-2xl -z-10 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default AboutPage
