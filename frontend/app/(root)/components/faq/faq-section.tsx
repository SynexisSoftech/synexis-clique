"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronRight } from "lucide-react"

const faqData = [
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping typically takes 3-5 business days within the continental US. Express shipping is available for 1-2 day delivery.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for all unworn items in their original condition with tags attached. Return shipping is free for customers in the US.",
  },
  {
    question: "How do I find my correct size?",
    answer:
      "You can refer to our size guide for detailed measurements. Our items typically run true to size, but we recommend checking the specific product description for any sizing notes.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. All payments are securely processed.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a confirmation email with a tracking number. You can also track your order by logging into your account on our website.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. Import duties and taxes may apply.",
  },
  {
    question: "How should I care for my items?",
    answer:
      "Care instructions vary by item and material. Generally, we recommend washing in cold water and air drying. Specific care instructions are included on product tags.",
  },
  {
    question: "Do you offer gift cards?",
    answer:
      "Yes, we offer digital gift cards in various denominations. They can be purchased online and sent directly to the recipient via email.",
  },
]

export default function FAQ() {
  return (
    <section className="w-full py-12 md:py-16 lg:py-24 bg-amber-50/50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium italic tracking-tight mb-4 text-[#6F4E37] font-cormorant">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-1 bg-[#6F4E37]/30 mx-auto mb-6"></div>
          <p className="mx-auto max-w-[700px] text-gray-700 md:text-xl font-cormorant italic">
            Find answers to common questions about our products and services.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full space-y-5">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-lg border border-[#6F4E37]/20 shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="text-left font-medium italic text-[#6F4E37] hover:no-underline py-6 px-6 font-cormorant text-lg md:text-xl group">
                  <div className="flex items-center">
                    <div className="mr-4 h-8 w-8 rounded-full bg-[#6F4E37]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#6F4E37]/20 transition-colors">
                      <ChevronRight className="h-4 w-4 text-[#6F4E37] transition-transform group-data-[state=open]:rotate-90" />
                    </div>
                    {faq.question}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6 px-6 pl-[4.5rem] font-cormorant text-lg leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-16 text-center bg-white rounded-lg p-8 border border-[#6F4E37]/20 shadow-md">
            <h3 className="text-2xl font-medium italic mb-3 text-[#6F4E37] font-cormorant">Still have questions?</h3>
            <p className="text-gray-700 mb-8 font-cormorant text-lg">
              If you can't find the answer you're looking for, feel free to contact our support team.
            </p>
            <button className="bg-[#6F4E37] text-white px-8 py-3 rounded-md font-cormorant font-medium italic text-lg hover:bg-[#5d4230] transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
