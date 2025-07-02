"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  ChevronRight,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ShoppingBag,
  Package,
  CreditCard,
  Truck,
  Shield,
  Star,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

const faqData = [
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping typically takes 3-5 business days within the continental US. Express shipping is available for 1-2 day delivery. We also offer same-day delivery in select metropolitan areas.",
    category: "shipping",
    icon: Truck,
    iconColor: "text-blue-500",
    bgColor: "from-blue-100 to-blue-200",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for all unworn items in their original condition with tags attached. Return shipping is free for customers in the US. International returns may incur shipping fees.",
    category: "returns",
    icon: Shield,
    iconColor: "text-green-500",
    bgColor: "from-green-100 to-green-200",
  },
  {
    question: "How do I find my correct size?",
    answer:
      "You can refer to our comprehensive size guide for detailed measurements. Our items typically run true to size, but we recommend checking the specific product description for any sizing notes.",
    category: "sizing",
    icon: Star,
    iconColor: "text-yellow-500",
    bgColor: "from-yellow-100 to-yellow-200",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and Buy Now Pay Later options. All payments are securely processed with 256-bit SSL encryption.",
    category: "payment",
    icon: CreditCard,
    iconColor: "text-purple-500",
    bgColor: "from-purple-100 to-purple-200",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a confirmation email with a tracking number. You can track your order in your account or use our mobile app for real-time updates.",
    category: "tracking",
    icon: Package,
    iconColor: "text-orange-500",
    bgColor: "from-orange-100 to-orange-200",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to over 100 countries worldwide. International shipping rates and delivery times vary by location. Import duties and taxes may apply and are the responsibility of the customer.",
    category: "shipping",
    icon: Truck,
    iconColor: "text-indigo-500",
    bgColor: "from-indigo-100 to-indigo-200",
  },
]

export default function FAQ() {
  const router = useRouter()

  const contactClick = () => {
    router.push("/contact")
  }

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-yellow-50/40 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-10 left-8 w-24 h-24 bg-[#6f4e37] rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 right-8 w-32 h-32 bg-amber-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-orange-400 rounded-full blur-3xl"></div>
      </div>

      {/* Shopping Icons Background */}
      <div className="absolute inset-0 opacity-[0.04] overflow-hidden">
        <ShoppingBag className="absolute top-20 left-[10%] w-16 h-16 text-[#6f4e37] rotate-12" />
        <Package className="absolute top-40 right-[15%] w-12 h-12 text-amber-600 -rotate-12" />
        <CreditCard className="absolute bottom-32 left-[20%] w-14 h-14 text-orange-500 rotate-45" />
        <Truck className="absolute bottom-20 right-[25%] w-18 h-18 text-[#6f4e37] -rotate-6" />
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#6f4e37] to-amber-700 rounded-2xl mb-4 shadow-lg">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-[#6f4e37] via-amber-700 to-orange-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-[#6f4e37] to-amber-600 rounded-full"></div>
            <ShoppingBag className="w-4 h-4 text-[#6f4e37] mx-3" />
            <div className="w-12 h-0.5 bg-gradient-to-l from-[#6f4e37] to-amber-600 rounded-full"></div>
          </div>
          <p className="mx-auto max-w-2xl text-gray-600 md:text-lg leading-relaxed">
            Everything you need to know about shopping with us, shipping, returns, and more.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-white/70 rounded-xl border border-[#6f4e37]/10 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group hover:border-[#6f4e37]/20"
                >
                  <AccordionTrigger className="text-left font-semibold text-[#6f4e37] hover:no-underline py-5 px-6 group-hover:bg-gradient-to-r group-hover:from-amber-50/50 group-hover:to-orange-50/30 transition-all duration-200">
                    <div className="flex items-center w-full">
                      <div
                        className={`mr-4 h-8 w-8 rounded-lg bg-gradient-to-br ${faq.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-200`}
                      >
                        <faq.icon className={`h-4 w-4 ${faq.iconColor}`} />
                      </div>
                      <span className="flex-1 pr-4 text-base md:text-lg">{faq.question}</span>
                      <ChevronRight className="h-4 w-4 text-[#6f4e37] transition-transform duration-200 ease-out group-data-[state=open]:rotate-90 flex-shrink-0" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="overflow-hidden transition-all duration-200 ease-in-out">
                    <div className="text-gray-600 pb-5 px-6 pl-14 leading-relaxed">
                      <div className="border-l-2 border-[#6f4e37]/20 pl-4 bg-gradient-to-r from-amber-50/30 to-transparent p-3 rounded-r-lg">
                        {faq.answer}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-12 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 rounded-2xl p-8 border border-[#6f4e37]/10 shadow-lg relative overflow-hidden"
        >
          <div className="text-center relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#6f4e37] to-amber-700 rounded-2xl mb-6 shadow-lg">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-[#6f4e37]">Need More Help?</h3>
            <p className="text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto">
              Our customer support team is ready to assist you with any questions about your shopping experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                onClick={contactClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group bg-gradient-to-r from-[#6f4e37] to-amber-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-[#5d4230] hover:to-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
              >
                <Mail className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Contact Support
              </motion.button>

              <div className="flex items-center text-gray-600 text-sm">
                <Phone className="w-4 h-4 mr-2 text-[#6f4e37]" />
                <span>Call us: </span>
                <a
                  href="tel:+1-555-123-4567"
                  className="ml-1 font-semibold text-[#6f4e37] hover:text-amber-700 transition-colors"
                >
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 