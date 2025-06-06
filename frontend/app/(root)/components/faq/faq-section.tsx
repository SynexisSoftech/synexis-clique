"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
    <section className="w-full py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
            Find answers to common questions about our products and services.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-lg border border-gray-200 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center bg-white rounded-lg p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-3">Still have questions?</h3>
            <p className="text-gray-600 mb-6">
              If you can't find the answer you're looking for, feel free to contact our support team.
            </p>
            <button className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
