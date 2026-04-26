"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Users,
  ChevronUp,
  ChevronDown,
  Upload,
} from "lucide-react"

interface BoardMember {
  id: string
  name: string
  title: string
  member_role: string
  bio: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  storage_path: string | null
  sort_order: number
}

const EMPTY: Omit<BoardMember, "id" | "sort_order"> = {
  name: "",
  title: "",
  member_role: "officer",
  bio: "",
  phone: "",
  email: "",
  photo_url: null,
  storage_path: null,
}

function newId() {
  return crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
}

export default function AdminBoardPage() {
  const supabase = createClient()
  const [members, setMembers] = useState<BoardMember[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BoardMember | null>(null)
  const [form, setForm] = useState<Omit<BoardMember, "id" | "sort_order">>(EMPTY)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) =>
      setRole(user?.app_metadata?.role ?? "")
    )
    fetchMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchMembers() {
    setLoading(true)
    const { data } = await supabase
      .from("board_members")
      .select("*")
      .order("sort_order", { ascending: true })
    setMembers(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setPhotoFile(null)
    setPhotoPreview(null)
    setDialogOpen(true)
  }

  function openEdit(m: BoardMember) {
    setEditing(m)
    setForm({
      name: m.name,
      title: m.title,
      member_role: m.member_role,
      bio: m.bio ?? "",
      phone: m.phone ?? "",
      email: m.email ?? "",
      photo_url: m.photo_url,
      storage_path: m.storage_path,
    })
    setPhotoFile(null)
    setPhotoPreview(m.photo_url)
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)

    let photoUrl = form.photo_url
    let storagePath = form.storage_path

    if (photoFile) {
      const ext = photoFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
      const id = newId()
      storagePath = `board/${id}.${ext}`

      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(storagePath, photoFile, { contentType: photoFile.type })

      if (!upErr) {
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(storagePath)
        photoUrl = urlData.publicUrl
      }
    }

    const payload = {
      ...form,
      bio: form.bio || null,
      phone: form.phone || null,
      email: form.email || null,
      photo_url: photoUrl,
      storage_path: storagePath,
    }

    if (editing) {
      await supabase.from("board_members").update(payload).eq("id", editing.id)
    } else {
      const maxOrder = members.length > 0 ? Math.max(...members.map((m) => m.sort_order)) + 1 : 0
      await supabase.from("board_members").insert({ ...payload, sort_order: maxOrder })
    }

    setSaving(false)
    setDialogOpen(false)
    fetchMembers()
  }

  async function handleDelete(member: BoardMember) {
    if (!confirm(`Delete ${member.name}?`)) return
    if (member.storage_path) {
      await supabase.storage.from("media").remove([member.storage_path])
    }
    await supabase.from("board_members").delete().eq("id", member.id)
    fetchMembers()
  }

  async function moveOrder(member: BoardMember, direction: "up" | "down") {
    const idx = members.findIndex((m) => m.id === member.id)
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= members.length) return
    const swap = members[swapIdx]
    await Promise.all([
      supabase.from("board_members").update({ sort_order: swap.sort_order }).eq("id", member.id),
      supabase.from("board_members").update({ sort_order: member.sort_order }).eq("id", swap.id),
    ])
    fetchMembers()
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
            <h1 className="text-2xl font-bold text-foreground">Board Members</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage officer info shown on the public Board page.
            </p>
          </div>
          {canEdit && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add Member
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No board members yet. Add the first one above.
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member, idx) => (
              <div
                key={member.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                {/* Photo */}
                <div className="h-12 w-12 rounded-full overflow-hidden bg-muted border-2 border-border shrink-0">
                  {member.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{member.name}</span>
                    <Badge variant="outline" className="text-xs">{member.title}</Badge>
                  </div>
                  {member.phone && (
                    <p className="text-sm text-muted-foreground mt-0.5">{member.phone}</p>
                  )}
                </div>

                {/* Order controls */}
                {canEdit && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveOrder(member, "up")}
                      className="rounded p-1 hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      disabled={idx === members.length - 1}
                      onClick={() => moveOrder(member, "down")}
                      className="rounded p-1 hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(member)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive hover:bg-destructive/5"
                      onClick={() => handleDelete(member)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {editing ? "Edit Member" : "Add Member"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Photo upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Photo</label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-muted border-2 border-border shrink-0">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Users className="h-7 w-7 text-muted-foreground/40" />
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
                      if (f) {
                        setPhotoFile(f)
                        setPhotoPreview(URL.createObjectURL(f))
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <Field label="Full Name *">
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="John Forlenza" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Title *">
                <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="President" />
              </Field>
              <Field label="Role">
                <select className={inputCls} value={form.member_role} onChange={(e) => set("member_role", e.target.value)}>
                  <option value="officer">Officer</option>
                  <option value="director">Director</option>
                  <option value="committee">Committee</option>
                </select>
              </Field>
            </div>

            <Field label="Bio">
              <textarea className={`${inputCls} h-20 resize-none`} value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} placeholder="Short description of their role..." />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <input className={inputCls} value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="(631) 555-1234" />
              </Field>
              <Field label="Email">
                <input className={inputCls} value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="john@example.com" />
              </Field>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.title}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save Member"}
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
