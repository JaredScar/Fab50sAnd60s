"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  List,
  Phone,
  ExternalLink,
} from "lucide-react"

export interface EventRow {
  id: string
  title: string
  event_date: string
  rain_date: string | null
  time_display: string
  location: string
  event_type: string
  description: string
  recurring: string | null
  flyer_url: string | null
  contact: string | null
  entry_fee: string | null
  spectator_fee: string | null
  highlights: string[]
}

interface Props {
  events: EventRow[]
}

const eventTypeColors: Record<string, string> = {
  Meeting: "bg-primary/10 text-primary border-primary/20",
  Cruise: "bg-accent/10 text-accent border-accent/20",
  Show: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Meetup: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  Parade: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  Other: "bg-muted text-muted-foreground border-border",
}

const eventDotColors: Record<string, string> = {
  Meeting: "bg-primary",
  Cruise: "bg-accent",
  Show: "bg-emerald-500",
  Meetup: "bg-sky-500",
  Parade: "bg-rose-500",
  Other: "bg-muted-foreground",
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function parseDate(dateStr: string): Date {
  // Supabase returns ISO strings; parse preserving local-date semantics
  return new Date(dateStr)
}

export function CalendarClient({ events }: Props) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<"calendar" | "list">("calendar")
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  function getEventsForDay(day: number) {
    return events.filter((e) => {
      const d = parseDate(e.event_date)
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
  }

  const monthEvents = events.filter((e) => {
    const d = parseDate(e.event_date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const selectedDateEvents = selectedDate
    ? events.filter((e) => parseDate(e.event_date).toDateString() === selectedDate.toDateString())
    : []

  const upcomingEvents = [...events]
    .sort((a, b) => parseDate(a.event_date).getTime() - parseDate(b.event_date).getTime())
    .filter((e) => parseDate(e.event_date) >= today)

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  return (
    <>
      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Events Calendar
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Upcoming cruise nights, meetings, and car shows
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant={view === "calendar" ? "default" : "outline"} onClick={() => setView("calendar")} size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" /> Calendar
              </Button>
              <Button variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")} size="sm">
                <List className="mr-2 h-4 w-4" /> List
              </Button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {Object.entries(eventTypeColors).map(([type, colors]) => (
              <Badge key={type} variant="outline" className={colors}>{type}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {view === "calendar" ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => { setCurrentDate(new Date(currentYear, currentMonth - 1, 1)); setSelectedDate(null) }}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <CardTitle className="text-xl sm:text-2xl">
                      {months[currentMonth]} {currentYear}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => { setCurrentDate(new Date(currentYear, currentMonth + 1, 1)); setSelectedDate(null) }}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.charAt(0)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const dayEvents = day ? getEventsForDay(day) : []
                      const isSelected = selectedDate && day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear()
                      const isToday = day && today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear
                      return (
                        <button
                          key={index}
                          onClick={() => day && setSelectedDate(new Date(currentYear, currentMonth, day))}
                          disabled={!day}
                          className={[
                            "relative min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 rounded-lg text-left transition-colors",
                            !day ? "cursor-default" : "hover:bg-muted/50 cursor-pointer",
                            isSelected ? "bg-primary/10 ring-2 ring-primary" : "",
                            isToday && !isSelected ? "bg-accent/10" : "",
                          ].filter(Boolean).join(" ")}
                        >
                          {day && (
                            <>
                              <span className={["text-sm font-medium", isSelected ? "text-primary" : "", isToday && !isSelected ? "text-accent font-bold" : "text-foreground"].filter(Boolean).join(" ")}>
                                {day}
                              </span>
                              {dayEvents.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-0.5">
                                  {dayEvents.slice(0, 3).map((event, i) => (
                                    <div key={i} className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${eventDotColors[event.event_type] ?? eventDotColors.Other}`} title={event.title} />
                                  ))}
                                  {dayEvents.length > 3 && <span className="text-xs text-muted-foreground">+{dayEvents.length - 3}</span>}
                                </div>
                              )}
                            </>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate ? `${months[selectedDate.getMonth()]} ${selectedDate.getDate()}` : `${months[currentMonth]} Events`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(selectedDate ? selectedDateEvents : monthEvents).length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      {selectedDate ? "No events scheduled for this day." : "No events scheduled for this month."}
                    </p>
                  ) : (
                    (selectedDate ? selectedDateEvents : monthEvents).map((event) => (
                      <div key={event.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <Badge className={eventTypeColors[event.event_type] ?? eventTypeColors.Other} variant="outline">
                          {event.event_type}
                        </Badge>
                        <h3 className="mt-2 font-semibold text-foreground">{event.title}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-muted-foreground">{event.time_display}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{event.location}</span>
                          </div>
                        </div>
                        {event.flyer_url && (
                          <Button variant="outline" size="sm" className="mt-3 w-full text-xs" onClick={() => setSelectedEvent(event)}>
                            View Event Flyer
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">No upcoming events.</p>
            ) : (
              upcomingEvents.map((event) => {
                const d = parseDate(event.event_date)
                return (
                  <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      <div className="flex items-center justify-center bg-primary/5 px-6 py-4 sm:w-28 sm:flex-col sm:py-6">
                        <span className="text-3xl font-bold text-primary leading-none">{d.getDate()}</span>
                        <span className="ml-2 text-sm font-medium text-muted-foreground sm:ml-0 sm:mt-1 sm:text-center">
                          {months[d.getMonth()].slice(0, 3)} {d.getFullYear()}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={eventTypeColors[event.event_type] ?? eventTypeColors.Other} variant="outline">
                              {event.event_type}
                            </Badge>
                            {event.rain_date && (
                              <span className="text-xs text-muted-foreground">Rain date: {event.rain_date}</span>
                            )}
                          </div>
                          <h3 className="mt-2 text-lg font-semibold text-foreground">{event.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">{event.time_display}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{event.location}</span>
                            </div>
                            {event.entry_fee && (
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-foreground">Entry:</span>
                                <span className="text-muted-foreground">{event.entry_fee}</span>
                              </div>
                            )}
                            {event.contact && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-4 w-4 text-primary" />
                                <span className="text-muted-foreground">{event.contact}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {event.flyer_url && (
                          <div className="mt-4">
                            <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>
                              <ExternalLink className="mr-2 h-4 w-4" /> View Event Flyer
                            </Button>
                          </div>
                        )}
                      </div>
                      {event.flyer_url && (
                        <div className="hidden lg:block w-32 shrink-0 cursor-pointer overflow-hidden" onClick={() => setSelectedEvent(event)}>
                          <Image src={event.flyer_url} alt={`${event.title} flyer`} width={128} height={180} className="h-full w-full object-cover hover:opacity-90 transition-opacity" unoptimized />
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogTitle className="sr-only">{selectedEvent?.title} Flyer</DialogTitle>
          {selectedEvent?.flyer_url && (
            <div className="relative">
              <Image src={selectedEvent.flyer_url} alt={`${selectedEvent.title} event flyer`} width={600} height={800} className="w-full h-auto" unoptimized />
              <div className="p-4 bg-card border-t border-border">
                <p className="font-semibold text-foreground">{selectedEvent.title}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{new Date(selectedEvent.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  <span>{selectedEvent.time_display}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{selectedEvent.location}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
