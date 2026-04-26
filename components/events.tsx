"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Calendar, MapPin, Clock, ChevronRight, ZoomIn } from "lucide-react"

const upcomingEvents = [
  {
    title: "Spring Dust Off Car Show",
    date: "Sunday, April 19, 2026",
    rainDate: "Sunday, April 26, 2026",
    time: "9:00 AM – 3:00 PM",
    location: "The Maples, 10 Ryerson Ave, Manorville, NY 11949",
    type: "Car Show",
    description: "28 trophy classes, raffles, 50/50, vendors, and All American BBQ by The Maples. Judging starts at 10:00 AM.",
    flyer: "/images/flyers/spring-dust-off-2026.jpg",
    cost: "$20/vehicle · $5/spectator",
    contact: "Arthur: 631-463-4983",
  },
  {
    title: "Paws of War 2026 Car Show",
    date: "Sunday, May 31, 2026",
    rainDate: "Sunday, June 7, 2026",
    time: "9:00 AM – 3:00 PM",
    location: "Paws of War, 127 Smithtown Blvd, Nesconset, NY",
    type: "Car Show",
    description: "Support our veterans! 18+ trophy classes, live music, raffles, 50/50, and food truck. Judged by the Fab 50s & 60s club.",
    flyer: "/images/flyers/paws-of-war-2026.jpg",
    cost: "Free spectators · $25 show cars",
    contact: "Ray: 631-624-4126 · Arthur: 631-463-4983",
  },
  {
    title: "15th Annual Rock-N-Roll Car Show",
    date: "Sunday, August 9, 2026",
    rainDate: "Sunday, August 16, 2026",
    time: "9:00 AM – 4:00 PM",
    location: "Smithtown Historical Society, 239 E. Main St., Smithtown, NY",
    type: "Car Show",
    description: "Judy's Run for Stroke Awareness & Prevention. 28 classes, DJ Steve, live bands, craft tables, food vendors, raffles, 50/50, and blood pressure screening.",
    flyer: "/images/flyers/rock-n-roll-car-show-2026.jpg",
    cost: "$20 show cars · $10/spectator",
    contact: "Bob: (631) 255-2516",
  },
  {
    title: "Stony Brook Child Care Car Show & Craft Fair",
    date: "Sunday, September 27, 2026",
    rainDate: "Sunday, October 4, 2026",
    time: "9:00 AM – 3:00 PM",
    location: "The Maples, 10 Ryerson Ave, Manorville, NY 11949",
    type: "Car Show",
    description: "24 judged classes hosted by the Fab 50s & 60s. All years, makes and models — classics, hot rods, muscle cars, custom cars. Food, 50/50, raffle baskets, music, vendors and more.",
    flyer: "/images/flyers/stony-brook-car-show-2026.jpg",
    cost: "$20/vehicle · $5/spectator · Kids under 5 free",
    contact: "Jackie: 631-495-6825",
  },
]

const eventTypeColors: Record<string, string> = {
  "Car Show": "bg-primary/10 text-primary border-primary/20",
  "Cruise": "bg-accent/10 text-accent border-accent/20",
  "Meeting": "bg-muted text-muted-foreground border-border",
}

export function Events() {
  const [flyerOpen, setFlyerOpen] = useState(false)
  const [activeFlyerIndex, setActiveFlyerIndex] = useState(0)

  const openFlyer = (index: number) => {
    setActiveFlyerIndex(index)
    setFlyerOpen(true)
  }

  return (
    <section id="events" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Upcoming Events
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Don't miss what's coming up this season
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="shrink-0">
            <Link href="/calendar">
              Full Calendar
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Events Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {upcomingEvents.map((event, index) => (
            <div
              key={event.title}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-background shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
            >
              {/* Flyer Image */}
              <button
                onClick={() => openFlyer(index)}
                className="relative block aspect-[3/4] w-full overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`View flyer for ${event.title}`}
              >
                <Image
                  src={event.flyer}
                  alt={`${event.title} event flyer`}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
                {/* Zoom overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                  <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium text-foreground opacity-0 shadow transition-opacity duration-300 group-hover:opacity-100">
                    <ZoomIn className="h-4 w-4" />
                    View Flyer
                  </div>
                </div>
              </button>

              {/* Event Details */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={eventTypeColors[event.type]}>
                    {event.type}
                  </Badge>
                </div>

                <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{event.date}</p>
                      <p className="text-muted-foreground text-xs">Rain date: {event.rainDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{event.time}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground leading-snug">{event.location}</span>
                  </div>
                </div>

                <div className="mt-auto border-t border-border pt-3">
                  <p className="text-xs font-semibold text-foreground">{event.cost}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{event.contact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flyer Lightbox */}
      <Dialog open={flyerOpen} onOpenChange={setFlyerOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-auto p-2 sm:p-4">
          <DialogTitle className="sr-only">
            {upcomingEvents[activeFlyerIndex]?.title} Event Flyer
          </DialogTitle>
          <div className="relative w-full overflow-hidden rounded-lg">
            <Image
              src={upcomingEvents[activeFlyerIndex]?.flyer}
              alt={`${upcomingEvents[activeFlyerIndex]?.title} event flyer`}
              width={600}
              height={800}
              className="h-auto w-full rounded-lg"
              priority
            />
          </div>
          <p className="text-center text-sm font-semibold text-foreground">
            {upcomingEvents[activeFlyerIndex]?.title}
          </p>
        </DialogContent>
      </Dialog>
    </section>
  )
}
