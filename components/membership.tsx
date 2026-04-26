import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import Link from "next/link"

const benefits = [
  "Monthly club meetings with fellow enthusiasts",
  "Exclusive cruise nights and car shows",
  "Annual BBQ and holiday parties",
  "Club newsletter and event updates",
  "Discounts at participating auto shops",
  "Voting rights on club activities",
  "Official club merchandise",
  "Access to our member network for advice and help",
]

export function Membership() {
  return (
    <section id="membership" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div>
            <Badge className="mb-4 bg-accent/10 text-accent">
              <Star className="mr-1 h-3 w-3" />
              Membership
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Join Our Family
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Become a member of Long Island's most welcoming car club. Whether you're a 
              seasoned collector or just getting started, there's a place for you here.
            </p>

            {/* Benefits List */}
            <ul className="mt-8 space-y-3">
              {benefits.map((benefit) => (
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
                <span className="text-5xl font-bold text-foreground">$35</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="mt-2 text-muted-foreground">Per household</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  One low price covers your entire household. Bring the whole family to events!
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
                  Apply for Membership
                </Link>
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Come to a meeting first - we'd love to meet you!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
