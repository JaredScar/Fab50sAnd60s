"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Sparkles, Car } from "lucide-react"
import { useSiteContent } from "@/hooks/use-site-content"

interface AboutContent {
  title: string
  description: string
  features: Array<{ title: string; description: string }>
  calloutTitle: string
  calloutDescription: string
}

export function About() {
  const content = useSiteContent()
  const about = content.homepage.about as unknown as AboutContent
  const icons = [Car, Users, Heart, Sparkles]

  return (
    <section id="about" className="bg-card py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {about.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {about.description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {about.features.map((feature, index) => {
            const Icon = icons[index] ?? Car
            return (
            <Card 
              key={feature.title} 
              className="group border-border/50 bg-background transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
            )
          })}
        </div>

        {/* Emphasis Box */}
        <div className="mt-16 rounded-2xl bg-primary/5 border border-primary/10 p-8 text-center sm:p-12">
          <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
            {about.calloutTitle}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {about.calloutDescription}
          </p>
        </div>
      </div>
    </section>
  )
}
