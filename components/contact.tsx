"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Mail, MapPin, Phone, Facebook, Send } from "lucide-react"
import { useSiteContent } from "@/hooks/use-site-content"

interface HomeContactContent {
  title: string
  description: string
  meetingTitle: string
  meetingLines: string[]
  emailTitle: string
  facebookTitle: string
  facebookDescription: string
  formTitle: string
  formDescription: string
  successTitle: string
  successDescription: string
  sendAnotherLabel: string
  submitLabel: string
  submittingLabel: string
}

interface GlobalContactContent {
  email: string
  facebookUrl: string
  facebookLabel: string
}

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const content = useSiteContent()
  const section = content.homepage.contact as unknown as HomeContactContent
  const globalContact = content.global.contact as unknown as GlobalContactContent

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  return (
    <section id="contact" className="bg-card py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {section.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {section.description}
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{section.meetingTitle}</h3>
                    <p className="mt-1 text-muted-foreground">
                      {section.meetingLines.map((line, index) => (
                        <span key={line} className={index === section.meetingLines.length - 1 ? "text-sm" : undefined}>
                          {line}
                          {index < section.meetingLines.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{section.emailTitle}</h3>
                    <p className="mt-1 text-muted-foreground">
                      <a 
                        href={`mailto:${globalContact.email}`}
                        className="text-primary hover:underline"
                      >
                        {globalContact.email}
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Facebook className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{section.facebookTitle}</h3>
                    <p className="mt-1 text-muted-foreground">
                      <a 
                        href={globalContact.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {globalContact.facebookLabel}
                      </a>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {section.facebookDescription}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border-border/50">
            <CardHeader>
              <h3 className="text-xl font-semibold text-foreground">{section.formTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {section.formDescription}
              </p>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Send className="h-8 w-8" />
                  </div>
                  <h4 className="mt-4 text-xl font-semibold text-foreground">{section.successTitle}</h4>
                  <p className="mt-2 text-muted-foreground">
                    {section.successDescription}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-6"
                    onClick={() => setSubmitted(false)}
                  >
                    {section.sendAnotherLabel}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                        <Input 
                          id="firstName" 
                          name="firstName" 
                          required 
                          placeholder="John"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                        <Input 
                          id="lastName" 
                          name="lastName" 
                          required 
                          placeholder="Smith"
                        />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        placeholder="john@example.com"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="subject">Subject</FieldLabel>
                      <Input 
                        id="subject" 
                        name="subject" 
                        required 
                        placeholder="Membership inquiry, event question, etc."
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="message">Message</FieldLabel>
                      <Textarea 
                        id="message" 
                        name="message" 
                        required 
                        rows={4}
                        placeholder="Tell us about yourself and your car(s)..."
                      />
                    </Field>
                  </FieldGroup>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? section.submittingLabel : section.submitLabel}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
