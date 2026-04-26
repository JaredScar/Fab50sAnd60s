"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Pencil, Trash2, Heart, Upload } from "lucide-react"

interface MemoriamEntry {
  id: string
  name: string
  passed_on: string
  tribute: string | null
  photo_url: string | null
  storage_path: string | null
  created_at: string
}

const EMPTY: Omit<MemoriamEntry, "id" | "created_at"> = {
  name: "",
  passed_on: "",
  tribute: "",
  photo_url: null,
  storage_path: null,
}

function newId() {
  return crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
}

export default function AdminMemoriamPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<MemoriamEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MemoriamEntry | null>(null)
  const [form, setForm] = useState<Omit<MemoriamEntry, "id" | "created_at">>(EMPTY)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) =>
      setRole(user?.app_metadata?.role ?? "")
    )
    fetchEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchEntries() {
    setLoading(true)
    const { data } = await supabase
      .from("memoriam_entries")
      .select("*")
      .order("created_at", { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setPhotoFile(null)
    setPhotoPreview(null)
    setDialogOpen(true)
  }

  function openEdit(entry: MemoriamEntry) {
    setEditing(entry)
    setForm({
      name: entry.name,
      passed_on: entry.passed_on,
      tribute: entry.tribute ?? "",
      photo_url: entry.photo_url,
      storage_path: entry.storage_path,
    })
    setPhotoFile(null)
    setPhotoPreview(entry.photo_url)
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)

    let photoUrl = form.photo_url
    let storagePath = form.storage_path

    if (photoFile) {
      const ext = photoFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
      const id = newId()
      storagePath = `memoriam/${id}.${ext}`
      const { error } = await supabase.storage
        .from("media")
        .upload(storagePath, photoFile, { contentType: photoFile.type })
      if (!error) {
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(storagePath)
        photoUrl = urlData.publicUrl
      }
    }

    const payload = {
      ...form,
      tribute: form.tribute || null,
      photo_url: photoUrl,
      storage_path: storagePath,
    }

    if (editing) {
      await supabase.from("memoriam_entries").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("memoriam_entries").insert(payload)
    }

    setSaving(false)
    setDialogOpen(false)
    fetchEntries()
  }

  async function handleDelete(entry: MemoriamEntry) {
    if (!confirm(`Remove ${entry.name} from In Memoriam?`)) return
    if (entry.storage_path) {
      await supabase.storage.from("media").remove([entry.storage_path])
    }
    await supabase.from("memoriam_entries").delete().eq("id", entry.id)
    fetchEntries()
  }

  const canEdit = role === "super_admin" || role === "admin"

  function set(key: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">In Memoriam</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Honor members who have passed away.
            </p>
          </div>
          {canEdit && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add Entry
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No entries yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="relative rounded-2xl border border-border bg-card p-6 text-center shadow-sm group"
              >
                <div className="mx-auto mb-4 h-28 w-28 rounded-full overflow-hidden border-4 border-muted bg-muted">
                  {entry.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.photo_url}
                      alt={entry.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Heart className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground">{entry.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  Passed away {entry.passed_on}
                </p>
                {entry.tribute && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {entry.tribute}
                  </p>
                )}

                {/* Actions overlay */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80" onClick={() => openEdit(entry)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-background/80 hover:text-destructive"
                      onClick={() => handleDelete(entry)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                {editing ? "Edit Entry" : "Add Entry"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Photo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Photo</label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-muted border-2 border-border shrink-0">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Heart className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4" /> Choose Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)) }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jim Cornwell" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Date Passed *</label>
              <input className={inputCls} value={form.passed_on} onChange={(e) => set("passed_on", e.target.value)} placeholder="February 15, 2026" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Tribute</label>
              <textarea
                className={`${inputCls} h-28 resize-none`}
                value={form.tribute ?? ""}
                onChange={(e) => set("tribute", e.target.value)}
                placeholder="A heartfelt tribute to this member..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.passed_on}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save Entry"}
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
