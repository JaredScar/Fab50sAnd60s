"use client"

import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Trophy, Heart, Car, MapPin } from "lucide-react"
import { useSiteContent } from "@/hooks/use-site-content"

interface AboutPageContent {
  title: string
  intro: string
  introSecond: string
  primaryCta: string
  secondaryCta: string
  stats: Array<{ label: string; value: string }>
  valuesTitle: string
  valuesDescription: string
  values: Array<{ title: string; description: string }>
  meetingTitle: string
  meetingDescription: string
  historyTitle: string
  historyParagraphs: string[]
  ctaTitle: string
  ctaDescription: string
}

export default function AboutPage() {
  const content = useSiteContent()
  const page = content.aboutPage.main as unknown as AboutPageContent
  const statIcons = [Calendar, Users, Trophy, Car]
  const valueIcons = [Car, Heart, Users, MapPin]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-20">
        {/* Hero Section */}
        <div className="bg-card border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {page.title}
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  {page.intro}
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {page.introSecond}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/calendar">{page.primaryCta}</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/#membership">{page.secondaryCta}</Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Fab 50s & 60s Nostalgia Car Club Logo"
                  width={400}
                  height={400}
                  className="w-full max-w-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-primary/5 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
              {page.stats.map((stat, index) => {
                const Icon = statIcons[index] ?? Calendar
                return (
                <div key={stat.label} className="text-center">
                  <Icon className="mx-auto h-8 w-8 text-primary" />
                  <div className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground sm:text-base">
                    {stat.label}
                  </div>
                </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {page.valuesTitle}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {page.valuesDescription}
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
              {page.values.map((value, index) => {
                const Icon = valueIcons[index] ?? Car
                return (
                <Card key={value.title} className="border-border/50">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {value.title}
                        </h3>
                        <p className="mt-2 leading-relaxed text-muted-foreground">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* Meeting Info */}
        <div className="bg-card border-y border-border py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {page.meetingTitle}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {page.meetingDescription}
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Each meeting includes updates on upcoming events, planning for cruises and shows, 
                  and plenty of time to swap stories and share your automotive passion.
                </p>
                <div className="mt-6 rounded-lg bg-muted/50 p-4">
                  <p className="font-medium text-foreground">Meeting Location:</p>
                  <p className="text-muted-foreground">American Legion Hall</p>
                  <p className="text-muted-foreground">Levittown, NY</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    First Tuesday of every month - 7:30 PM
                  </p>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {page.historyTitle}
                </h2>
                {page.historyParagraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-lg leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {page.ctaTitle}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {page.ctaDescription}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/#membership">Become a Member</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/#contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
