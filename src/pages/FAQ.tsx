
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: "What types of fabrics do you use?",
      answer: "We use high-quality fabrics including pure silk, georgette, chiffon, cotton, and handloom materials. Each product description specifies the exact fabric composition."
    },
    {
      question: "How do I determine the right size?",
      answer: "Please refer to our size chart available on each product page. For custom tailoring, we recommend taking professional measurements. Our customer service team can also assist with size selection."
    },
    {
      question: "Do you offer custom tailoring services?",
      answer: "Yes, we offer custom tailoring for blouses and alterations for sarees. Additional charges may apply. Please contact us for custom requirements and pricing."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 7 days of delivery for unworn items in original condition with tags. Custom-tailored items are not returnable unless there's a manufacturing defect."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard delivery takes 5-7 business days, express delivery takes 2-3 days, and same-day delivery is available within select city limits. Processing time is 1-2 business days."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to USA, UK, Canada, Australia, and select countries. International shipping charges and delivery times vary by destination. Contact us for specific details."
    },
    {
      question: "How do I care for my sarees?",
      answer: "Care instructions vary by fabric. Silk sarees should be dry cleaned, while cotton can be gently hand washed. Always check the care label and store in a cool, dry place away from direct sunlight."
    },
    {
      question: "Can I track my order?",
      answer: "Yes, once your order is shipped, you'll receive a tracking number via SMS and email. You can track your order status in your account or on our website."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, net banking, UPI, and digital wallets. Cash on delivery is available for orders within India."
    },
    {
      question: "Do you have a physical store?",
      answer: "Yes, our flagship store is located at 123 Fashion Street, Designer Hub, Textile City. Visit us during business hours: Mon-Fri 9AM-7PM, Sat 10AM-6PM, Sun 11AM-5PM."
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-usha-burgundy mb-4">Frequently Asked Questions</h1>
          <div className="indian-border w-24 mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about our products and services
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:text-usha-burgundy">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Can't find the answer you're looking for? Our customer service team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:contact@ushadesigns.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-usha-burgundy text-white rounded-md hover:bg-usha-burgundy/90 transition-colors"
            >
              Email Support
            </a>
            <a 
              href="tel:+919876543210"
              className="inline-flex items-center justify-center px-6 py-3 border border-usha-burgundy text-usha-burgundy rounded-md hover:bg-usha-burgundy/10 transition-colors"
            >
              Call Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
