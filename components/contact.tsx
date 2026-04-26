"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Mail, MapPin, Phone, Facebook, Send } from "lucide-react"

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
            Get In Touch
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions? Want to learn more? We'd love to hear from you!
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
                    <h3 className="font-semibold text-foreground">Meeting Location</h3>
                    <p className="mt-1 text-muted-foreground">
                      American Legion Hall<br />
                      Levittown, NY<br />
                      <span className="text-sm">First Tuesday of every month at 7:30 PM</span>
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
                    <h3 className="font-semibold text-foreground">Email Us</h3>
                    <p className="mt-1 text-muted-foreground">
                      <a 
                        href="mailto:info@fab5060carclub.com" 
                        className="text-primary hover:underline"
                      >
                        info@fab5060carclub.com
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
                    <h3 className="font-semibold text-foreground">Follow Us</h3>
                    <p className="mt-1 text-muted-foreground">
                      <a 
                        href="https://facebook.com/fab5060carclub" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Facebook - Fab 50s & 60s Car Club
                      </a>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      See event photos and updates
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border-border/50">
            <CardHeader>
              <h3 className="text-xl font-semibold text-foreground">Send Us a Message</h3>
              <p className="text-sm text-muted-foreground">
                Fill out the form below and we'll get back to you soon.
              </p>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Send className="h-8 w-8" />
                  </div>
                  <h4 className="mt-4 text-xl font-semibold text-foreground">Message Sent!</h4>
                  <p className="mt-2 text-muted-foreground">
                    Thanks for reaching out. We'll get back to you soon.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-6"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
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
                    {isSubmitting ? "Sending..." : "Send Message"}
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
