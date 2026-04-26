import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Car, Users, Calendar } from "lucide-react"

export function Hero() {
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
              Long Island's Friendliest Car Club
            </Badge>
            
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Where Car Lovers{" "}
              <span className="text-primary">Come Together</span>
            </h1>
            
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Whether you drive a classic '57 Chevy, a modern muscle car, or anything in between - 
              <strong className="text-foreground"> ALL makes, models, and years are welcome</strong>. 
              Join our community of passionate car enthusiasts.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-lg">
                <Link href="#membership">
                  Become a Member
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 text-lg border-2">
                <Link href="#events">
                  View Upcoming Events
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="h-5 w-5" />
                  <span className="text-2xl font-bold text-foreground">100+</span>
                </div>
                <span className="text-sm text-muted-foreground">Members</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-2 text-primary">
                  <Calendar className="h-5 w-5" />
                  <span className="text-2xl font-bold text-foreground">30+</span>
                </div>
                <span className="text-sm text-muted-foreground">Events/Year</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-2 text-primary">
                  <Car className="h-5 w-5" />
                  <span className="text-2xl font-bold text-foreground">35+</span>
                </div>
                <span className="text-sm text-muted-foreground">Years Strong</span>
              </div>
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
