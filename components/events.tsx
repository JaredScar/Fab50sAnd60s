"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Calendar, MapPin, Clock, ChevronRight, ZoomIn } from "lucide-react"
import { useSiteContent } from "@/hooks/use-site-content"
import { createClient } from "@/lib/supabase/client"

interface EventItem {
  id: string
  title: string
  event_date: string
  rain_date: string | null
  time_display: string
  location: string
  event_type: string
  flyer_url: string | null
  contact: string | null
  entry_fee: string | null
  spectator_fee: string | null
}

const eventTypeColors: Record<string, string> = {
  "Car Show": "bg-primary/10 text-primary border-primary/20",
  "Cruise": "bg-accent/10 text-accent border-accent/20",
  "Meeting": "bg-muted text-muted-foreground border-border",
}

export function Events() {
  const supabase = createClient()
  const [flyerOpen, setFlyerOpen] = useState(false)
  const [activeFlyerIndex, setActiveFlyerIndex] = useState(0)
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([])
  const content = useSiteContent()
  const section = content.homepage.events as unknown as {
    title: string
    description: string
    buttonLabel: string
  }

  const openFlyer = (index: number) => {
    if (!upcomingEvents[index]?.flyer_url) return
    setActiveFlyerIndex(index)
    setFlyerOpen(true)
  }

  useEffect(() => {
    supabase
      .from("events")
      .select("id,title,event_date,rain_date,time_display,location,event_type,flyer_url,contact,entry_fee,spectator_fee")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(4)
      .then(({ data }) => setUpcomingEvents(data ?? []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id="events" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {section.title}
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              {section.description}
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="shrink-0">
            <Link href="/calendar">
              {section.buttonLabel}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Events Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {upcomingEvents.map((event, index) => {
            const cost = [event.entry_fee, event.spectator_fee].filter(Boolean).join(" · ")
            return (
            <div
              key={event.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-background shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
            >
              {/* Flyer Image */}
              <button
                onClick={() => openFlyer(index)}
                disabled={!event.flyer_url}
                className="relative block aspect-[3/4] w-full overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`View flyer for ${event.title}`}
              >
                {event.flyer_url ? (
                  <>
                    <Image
                      src={event.flyer_url}
                      alt={`${event.title} event flyer`}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                      <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium text-foreground opacity-0 shadow transition-opacity duration-300 group-hover:opacity-100">
                        <ZoomIn className="h-4 w-4" />
                        View Flyer
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
                    <Calendar className="mb-3 h-10 w-10 text-primary" />
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                  </div>
                )}
              </button>

              {/* Event Details */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={eventTypeColors[event.event_type] ?? eventTypeColors.Meeting}>
                    {event.event_type}
                  </Badge>
                </div>

                <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{formatEventDate(event.event_date)}</p>
                      {event.rain_date && <p className="text-muted-foreground text-xs">Rain date: {event.rain_date}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{event.time_display}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground leading-snug">{event.location}</span>
                  </div>
                </div>

                <div className="mt-auto border-t border-border pt-3">
                  {cost && <p className="text-xs font-semibold text-foreground">{cost}</p>}
                  {event.contact && <p className="mt-0.5 text-xs text-muted-foreground">{event.contact}</p>}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      </div>

      {/* Flyer Lightbox */}
      <Dialog open={flyerOpen} onOpenChange={setFlyerOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-auto p-2 sm:p-4">
          <DialogTitle className="sr-only">
            {upcomingEvents[activeFlyerIndex]?.title} Event Flyer
          </DialogTitle>
          {upcomingEvents[activeFlyerIndex]?.flyer_url && (
            <>
              <div className="relative w-full overflow-hidden rounded-lg">
                <Image
                  src={upcomingEvents[activeFlyerIndex].flyer_url}
                  alt={`${upcomingEvents[activeFlyerIndex].title} event flyer`}
                  width={600}
                  height={800}
                  className="h-auto w-full rounded-lg"
                  priority
                  unoptimized
                />
              </div>
              <p className="text-center text-sm font-semibold text-foreground">
                {upcomingEvents[activeFlyerIndex]?.title}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}
