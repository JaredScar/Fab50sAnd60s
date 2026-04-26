"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Trash2,
  ImagePlus,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react"

const CATEGORIES = ["Car Shows", "Cruise Nights", "Member Cars", "Club Events", "Other"]

interface GalleryItem {
  id: string
  src: string
  caption: string
  category: string
  storage_path?: string
  created_at: string
}

type UploadStatus = "idle" | "uploading" | "success" | "error"

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function AdminGalleryPage() {
  const supabase = createClient()

  const [photos, setPhotos] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [caption, setCaption] = useState("")
  const [category, setCategory] = useState(CATEGORIES[0])
  const [status, setStatus] = useState<UploadStatus>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [pendingFile, setPending] = useState<File | null>(null)
  const [role, setRole] = useState<string>("")
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setRole(user?.app_metadata?.role ?? "")
    })
    fetchPhotos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchPhotos() {
    setLoading(true)
    const { data } = await supabase
      .from("gallery_items")
      .select("*")
      .order("created_at", { ascending: false })
    setPhotos(data ?? [])
    setLoading(false)
  }

  function handleFileSelect(file: File) {
    setPending(file)
    setPreview(URL.createObjectURL(file))
    if (!caption) setCaption(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "))
    setStatus("idle")
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caption]
  )

  async function handleUpload() {
    if (!pendingFile) return
    setStatus("uploading")
    setErrorMsg("")

    const ext = pendingFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const id = newId()
    const storagePath = `gallery/${id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(storagePath, pendingFile, { contentType: pendingFile.type })

    if (uploadError) {
      setErrorMsg(uploadError.message)
      setStatus("error")
      return
    }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(storagePath)

    const { error: dbError } = await supabase.from("gallery_items").insert({
      id,
      src: urlData.publicUrl,
      caption: caption || pendingFile.name.replace(/\.[^/.]+$/, ""),
      category,
      storage_path: storagePath,
    })

    if (dbError) {
      setErrorMsg(dbError.message)
      setStatus("error")
      return
    }

    setStatus("success")
    setPending(null)
    setPreview(null)
    setCaption("")
    setCategory(CATEGORIES[0])
    fetchPhotos()
    setTimeout(() => setStatus("idle"), 3000)
  }

  async function handleDelete(photo: GalleryItem) {
    if (!confirm("Delete this photo permanently?")) return

    // Remove from storage if it has a storage_path
    if (photo.storage_path) {
      await supabase.storage.from("media").remove([photo.storage_path])
    }

    await supabase.from("gallery_items").delete().eq("id", photo.id)
    fetchPhotos()
  }

  const canEdit = role === "super_admin" || role === "admin"

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload and manage club photos. Changes appear on the public gallery instantly.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">

        {/* Upload section — admins only */}
        {canEdit && (
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-foreground flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              Upload New Photo
            </h2>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInput.current?.click()}
              className={`relative mb-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors
                ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"}`}
            >
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
              />
              {preview ? (
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                  <Image src={preview} alt="Preview" fill className="object-contain" unoptimized />
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    Drag & drop a photo here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP, GIF — max 10 MB</p>
                </>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. 1957 Chevy Bel Air at Spring Show"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <Button onClick={handleUpload} disabled={!pendingFile || status === "uploading"} size="lg">
                {status === "uploading" ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Upload Photo</>
                )}
              </Button>
              {status === "success" && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> Photo uploaded!
                </span>
              )}
              {status === "error" && (
                <span className="flex items-center gap-1.5 text-sm text-destructive">
                  <XCircle className="h-4 w-4" /> {errorMsg}
                </span>
              )}
            </div>
          </section>
        )}

        {/* Editors see a notice */}
        {!canEdit && (
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              You have editor access. You can view the gallery but only admins can upload or delete photos.
            </p>
          </div>
        )}

        {/* Photo grid */}
        <section>
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            Gallery ({photos.length} photo{photos.length !== 1 ? "s" : ""})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : photos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              No photos yet. Upload the first one above.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={photo.src}
                      alt={photo.caption}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-foreground">{photo.caption}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{photo.category}</Badge>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(photo)}
                      className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                      title="Delete photo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
