"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Phone,
  Send,
  CheckCircle
} from "lucide-react"
import { useSiteContent } from "@/hooks/use-site-content"

interface ContactPageContent {
  title: string
  description: string
  meetingLocationTitle: string
  meetingLocationLines: string[]
  meetingTimeTitle: string
  meetingTimeLines: string[]
  formTitle: string
  successTitle: string
  successDescription: string
  faqTitle: string
  faqs: Array<{ question: string; answer: string }>
}

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const content = useSiteContent()
  const page = content.contactPage.main as unknown as ContactPageContent
  const globalContact = content.global.contact as unknown as {
    email: string
    facebookUrl: string
    facebookLabel: string
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setFormSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-20">
        {/* Page Header */}
        <div className="bg-card border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {page.title}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {page.description}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {/* Contact Info Cards */}
            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    {page.meetingLocationTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {page.meetingLocationLines.map((line, index) => (
                    <p key={line} className={index === 0 ? "font-medium text-foreground" : "text-muted-foreground"}>
                      {line}
                    </p>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    {page.meetingTimeTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {page.meetingTimeLines.map((line, index) => (
                    <p key={line} className={index === 0 ? "font-medium text-foreground" : "text-muted-foreground"}>
                      {line}
                    </p>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    Email Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={`mailto:${globalContact.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {globalContact.email}
                  </a>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We typically respond within 24-48 hours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Facebook className="h-5 w-5 text-primary" />
                    </div>
                    Follow Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={globalContact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {globalContact.facebookLabel}
                  </a>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Stay updated on events, photos, and club news
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{page.formTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  {formSubmitted ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-foreground">
                        {page.successTitle}
                      </h3>
                      <p className="mt-2 text-muted-foreground">
                        {page.successDescription}
                      </p>
                      <Button 
                        className="mt-6" 
                        variant="outline"
                        onClick={() => setFormSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            name="firstName"
                            placeholder="John" 
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            name="lastName"
                            placeholder="Smith" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          placeholder="john@example.com" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                        <Input 
                          id="phone" 
                          name="phone"
                          type="tel" 
                          placeholder="(516) 555-0123" 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input 
                          id="subject" 
                          name="subject"
                          placeholder="Interested in joining the club" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea 
                          id="message" 
                          name="message"
                          placeholder="Tell us about yourself and your car(s)..."
                          rows={5}
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="car">What Do You Drive? (Optional)</Label>
                        <Input 
                          id="car" 
                          name="car"
                          placeholder="e.g., 1965 Ford Mustang, 2020 Dodge Challenger" 
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground">
                  {page.faqTitle}
                </h2>
                <div className="mt-4 space-y-4">
                  {page.faqs.map((faq) => (
                    <div key={faq.question} className="rounded-lg bg-card border border-border p-4">
                      <h3 className="font-medium text-foreground">{faq.question}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
