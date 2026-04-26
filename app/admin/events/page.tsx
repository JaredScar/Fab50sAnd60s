"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Pencil, Trash2, CalendarDays } from "lucide-react"
import { format } from "date-fns"

const EVENT_TYPES = ["Meeting", "Show", "Cruise", "Meetup", "Parade", "Other"]

const TYPE_COLORS: Record<string, string> = {
  Meeting: "bg-primary/10 text-primary border-primary/20",
  Cruise: "bg-accent/10 text-accent border-accent/20",
  Show: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Meetup: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  Parade: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  Other: "bg-muted text-muted-foreground border-border",
}

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  rain_date: string | null
  time_display: string
  location: string
  event_type: string
  recurring: string | null
  contact: string | null
  entry_fee: string | null
  spectator_fee: string | null
  highlights: string[]
  created_at: string
}

const EMPTY: Omit<Event, "id" | "created_at"> = {
  title: "",
  description: "",
  event_date: "",
  rain_date: "",
  time_display: "",
  location: "",
  event_type: "Meeting",
  recurring: "",
  contact: "",
  entry_fee: "",
  spectator_fee: "",
  highlights: [],
}

export default function AdminEventsPage() {
  const supabase = createClient()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [form, setForm] = useState<Omit<Event, "id" | "created_at">>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [highlightsText, setHighlightsText] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setRole(user?.app_metadata?.role ?? "")
    })
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchEvents() {
    setLoading(true)
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
    setEvents(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setHighlightsText("")
    setDialogOpen(true)
  }

  function openEdit(event: Event) {
    setEditing(event)
    setForm({
      title: event.title,
      description: event.description,
      event_date: event.event_date ? event.event_date.slice(0, 10) : "",
      rain_date: event.rain_date ?? "",
      time_display: event.time_display,
      location: event.location,
      event_type: event.event_type,
      recurring: event.recurring ?? "",
      contact: event.contact ?? "",
      entry_fee: event.entry_fee ?? "",
      spectator_fee: event.spectator_fee ?? "",
      highlights: event.highlights ?? [],
    })
    setHighlightsText((event.highlights ?? []).join("\n"))
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      rain_date: form.rain_date || null,
      recurring: form.recurring || null,
      contact: form.contact || null,
      entry_fee: form.entry_fee || null,
      spectator_fee: form.spectator_fee || null,
      highlights: highlightsText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      updated_at: new Date().toISOString(),
    }

    if (editing) {
      await supabase.from("events").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("events").insert(payload)
    }

    setSaving(false)
    setDialogOpen(false)
    fetchEvents()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event permanently?")) return
    await supabase.from("events").delete().eq("id", id)
    fetchEvents()
  }

  const canEdit = role === "super_admin" || role === "admin"
  const canDelete = role === "super_admin" || role === "admin"

  function set(key: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Events</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage cruise nights, meetings, and car shows.
            </p>
          </div>
          {canEdit && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add Event
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No events yet. Add the first one above.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
              >
                {/* Date column */}
                <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 px-4 py-3 shrink-0 min-w-[60px]">
                  <span className="text-xl font-bold text-primary leading-none">
                    {event.event_date
                      ? format(new Date(event.event_date), "d")
                      : "—"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {event.event_date
                      ? format(new Date(event.event_date), "MMM")
                      : ""}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={TYPE_COLORS[event.event_type] ?? TYPE_COLORS.Other}
                    >
                      {event.event_type}
                    </Badge>
                    {event.recurring && (
                      <span className="text-xs text-muted-foreground">Recurring</span>
                    )}
                  </div>
                  <h3 className="mt-1.5 font-semibold text-foreground">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {event.time_display} · {event.location}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(event)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive hover:bg-destructive/5"
                      onClick={() => handleDelete(event.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                {editing ? "Edit Event" : "Add Event"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <Field label="Title *">
              <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Monthly Club Meeting" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date *">
                <input type="date" className={inputCls} value={form.event_date} onChange={(e) => set("event_date", e.target.value)} />
              </Field>
              <Field label="Rain Date">
                <input className={inputCls} value={form.rain_date ?? ""} onChange={(e) => set("rain_date", e.target.value)} placeholder="Sunday, May 5, 2026" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Time">
                <input className={inputCls} value={form.time_display} onChange={(e) => set("time_display", e.target.value)} placeholder="7:00 PM" />
              </Field>
              <Field label="Event Type">
                <select className={inputCls} value={form.event_type} onChange={(e) => set("event_type", e.target.value)}>
                  {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Location">
              <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Seaport Diner, Port Jefferson Station, NY" />
            </Field>

            <Field label="Description">
              <textarea className={`${inputCls} h-20 resize-none`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Event description..." />
            </Field>

            <Field label="Recurring (optional)">
              <input className={inputCls} value={form.recurring ?? ""} onChange={(e) => set("recurring", e.target.value)} placeholder="Second Thursday of every month" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Entry Fee">
                <input className={inputCls} value={form.entry_fee ?? ""} onChange={(e) => set("entry_fee", e.target.value)} placeholder="$20 per vehicle" />
              </Field>
              <Field label="Spectator Fee">
                <input className={inputCls} value={form.spectator_fee ?? ""} onChange={(e) => set("spectator_fee", e.target.value)} placeholder="$5 per spectator" />
              </Field>
            </div>

            <Field label="Contact Info">
              <input className={inputCls} value={form.contact ?? ""} onChange={(e) => set("contact", e.target.value)} placeholder="Arthur @ 631-463-4983" />
            </Field>

            <Field label="Highlights (one per line)">
              <textarea
                className={`${inputCls} h-24 resize-none`}
                value={highlightsText}
                onChange={(e) => setHighlightsText(e.target.value)}
                placeholder={"28 Trophy Classes\nRaffles & 50/50\nMusic by DJ Steve"}
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.title || !form.event_date}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save Event"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}
