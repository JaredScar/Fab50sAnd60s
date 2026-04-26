import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Trophy, Heart, Car, MapPin } from "lucide-react"

const stats = [
  { label: "Years Active", value: "30+", icon: Calendar },
  { label: "Active Members", value: "100+", icon: Users },
  { label: "Events Per Year", value: "50+", icon: Trophy },
  { label: "Cars Welcome", value: "All", icon: Car },
]

const values = [
  {
    title: "All Cars Welcome",
    description: "From classic 50s and 60s beauties to modern muscle cars, imports, customs, and everything in between. If you love cars, you belong here.",
    icon: Car,
  },
  {
    title: "Family Friendly",
    description: "We're a family-oriented club. Bring your kids, grandkids, and loved ones to our events. Car enthusiasm spans generations!",
    icon: Heart,
  },
  {
    title: "Community First",
    description: "We support local charities, participate in community parades, and give back to Long Island. Cars bring us together; community keeps us going.",
    icon: Users,
  },
  {
    title: "Long Island Proud",
    description: "Based right here on Long Island, we cruise local roads, support local businesses, and celebrate our home.",
    icon: MapPin,
  },
]

export default function AboutPage() {
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
                  About Our Club
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  The Fabulous 50s and 60s Nostalgia Car Club has been bringing together car enthusiasts 
                  on Long Island for over 30 years. What started as a small group of classic car lovers 
                  has grown into one of the most welcoming automotive communities in the area.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  While our name pays tribute to the golden era of American automobiles, we welcome 
                  <strong className="text-foreground"> ALL makes, models, and years</strong>. Whether you drive a 
                  pristine 1957 Chevy, a restored muscle car, a modern sports car, or a beloved daily driver 
                  with character - you are welcome here.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/calendar">See Our Events</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/#membership">Join Today</Link>
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
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="mx-auto h-8 w-8 text-primary" />
                  <div className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground sm:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                What We're All About
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                More than just a car club - we're a community
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
              {values.map((value) => (
                <Card key={value.title} className="border-border/50">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <value.icon className="h-6 w-6 text-primary" />
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
              ))}
            </div>
          </div>
        </div>

        {/* Meeting Info */}
        <div className="bg-card border-y border-border py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Monthly Meetings
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  We meet on the <strong className="text-foreground">first Tuesday of every month at 7:30 PM</strong> at 
                  the American Legion Hall in Levittown. Meetings are casual, friendly, and a great 
                  way to connect with fellow car enthusiasts.
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
                  Our History
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Founded in the early 1990s by a group of friends who shared a passion for the 
                  classic cars of the 1950s and 60s, our club has grown and evolved while staying 
                  true to our core mission: bringing car lovers together.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Over the decades, we've hosted countless car shows, raised thousands of dollars 
                  for local charities, and created lifelong friendships. Today, we continue that 
                  tradition while welcoming a new generation of automotive enthusiasts.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  The name may say "50s and 60s" but our hearts are open to all who share 
                  the love of cars, regardless of make, model, or year.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Ready to Join the Fun?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Membership is just $35 per year and includes you and your immediate family. 
              Come to a meeting, check out an event, and see what we're all about!
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
