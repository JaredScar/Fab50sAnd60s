"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import Link from "next/link"
import { useSiteContent } from "@/hooks/use-site-content"

interface MembershipContent {
  badge: string
  title: string
  description: string
  benefits: string[]
  price: string
  priceSuffix: string
  priceNote: string
  cardNote: string
  ctaLabel: string
  footerNote: string
}

export function Membership() {
  const content = useSiteContent()
  const membership = content.homepage.membership as unknown as MembershipContent

  return (
    <section id="membership" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div>
            <Badge className="mb-4 bg-accent/10 text-accent">
              <Star className="mr-1 h-3 w-3" />
              {membership.badge}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {membership.title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {membership.description}
            </p>

            {/* Benefits List */}
            <ul className="mt-8 space-y-3">
              {membership.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Card */}
          <Card className="border-2 border-primary/20 bg-card shadow-xl">
            <CardHeader className="pb-4 text-center">
              <Badge className="mx-auto mb-4 bg-primary text-primary-foreground">
                Annual Membership
              </Badge>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-foreground">{membership.price}</span>
                <span className="text-muted-foreground">{membership.priceSuffix}</span>
              </div>
              <p className="mt-2 text-muted-foreground">{membership.priceNote}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {membership.cardNote}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Registration Fee</span>
                  <span className="font-medium text-foreground">None</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Vehicle Requirements</span>
                  <span className="font-medium text-foreground">Any car welcome</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Age Requirements</span>
                  <span className="font-medium text-foreground">All ages welcome</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg">
                <Link href="#contact">
                  {membership.ctaLabel}
                </Link>
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {membership.footerNote}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
