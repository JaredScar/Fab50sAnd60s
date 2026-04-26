"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Car, Users, Calendar } from "lucide-react"
import { useSiteContent } from "@/hooks/use-site-content"

interface HeroContent {
  badge: string
  title: string
  titleHighlight: string
  description: string
  primaryCta: string
  secondaryCta: string
  stats: Array<{ value: string; label: string }>
}

export function Hero() {
  const content = useSiteContent()
  const hero = content.homepage.hero as unknown as HeroContent
  const statIcons = [Users, Calendar, Car]

  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(85,160,190,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(200,120,80,0.06),transparent_50%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <Badge 
              variant="outline" 
              className="mb-6 border-primary/30 bg-primary/10 text-primary px-4 py-2 text-sm font-semibold tracking-wide"
            >
              {hero.badge}
            </Badge>
            
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {hero.title}
              {hero.titleHighlight && (
                <>
                  {" "}
                  <span className="text-primary">{hero.titleHighlight}</span>
                </>
              )}
            </h1>
            
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-lg">
                <Link href="#membership">
                  {hero.primaryCta}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 text-lg border-2">
                <Link href="#events">
                  {hero.secondaryCta}
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              {hero.stats.map((stat, index) => {
                const Icon = statIcons[index] ?? Car
                return (
                  <div key={stat.label} className="flex flex-col items-center lg:items-start">
                    <div className="flex items-center gap-2 text-primary">
                      <Icon className="h-5 w-5" />
                      <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Logo/Image */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/5 blur-3xl" />
              <Image
                src="/images/logo.png"
                alt="The Fabulous 50s & 60s Nostalgia Car Club Logo"
                width={500}
                height={500}
                className="relative z-10 h-auto w-full max-w-md drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
