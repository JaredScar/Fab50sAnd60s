"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  Trash2,
  ImagePlus,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Pencil,
} from "lucide-react"

const CATEGORIES = ["Car Shows", "Cruise Nights", "Member Cars", "Club Events", "Other"]

interface GalleryItem {
  id: string
  src: string
  caption: string
  category: string
  storage_path?: string
  created_at?: string
  uploadedAt?: string
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
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [editCaption, setEditCaption] = useState("")
  const [editCategory, setEditCategory] = useState(CATEGORIES[0])
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editPreview, setEditPreview] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const editFileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setRole(user?.app_metadata?.role ?? "")
    })
    fetchPhotos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchPhotos() {
    setLoading(true)
    try {
      const response = await fetch("/api/gallery")
      if (!response.ok) throw new Error("Unable to load gallery photos")
      const data = await response.json()
      setPhotos(data ?? [])
    } catch {
      setPhotos([])
    }
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

  function openEditDialog(photo: GalleryItem) {
    if (!photo.created_at) {
      setErrorMsg("This legacy photo is not in Supabase yet, so it cannot be edited from this panel.")
      setStatus("error")
      return
    }

    setEditing(photo)
    setEditCaption(photo.caption)
    setEditCategory(photo.category)
    setEditFile(null)
    setEditPreview(photo.src)
    setErrorMsg("")
    setStatus("idle")
    setEditOpen(true)
  }

  function handleEditFileSelect(file: File) {
    setEditFile(file)
    setEditPreview(URL.createObjectURL(file))
  }

  async function handleSaveEdit() {
    if (!editing) return

    setSavingEdit(true)
    setErrorMsg("")

    let src = editing.src
    let storagePath = editing.storage_path

    if (editFile) {
      const ext = editFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
      const newStoragePath = `gallery/${newId()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(newStoragePath, editFile, { contentType: editFile.type })

      if (uploadError) {
        setErrorMsg(uploadError.message)
        setStatus("error")
        setSavingEdit(false)
        return
      }

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(newStoragePath)
      src = urlData.publicUrl
      storagePath = newStoragePath
    }

    const { error: updateError } = await supabase
      .from("gallery_items")
      .update({
        src,
        caption: editCaption.trim(),
        category: editCategory,
        storage_path: storagePath,
      })
      .eq("id", editing.id)

    if (updateError) {
      setErrorMsg(updateError.message)
      setStatus("error")
      setSavingEdit(false)
      return
    }

    if (editFile && editing.storage_path) {
      await supabase.storage.from("media").remove([editing.storage_path])
    }

    setSavingEdit(false)
    setEditOpen(false)
    setEditing(null)
    setEditFile(null)
    setEditPreview(null)
    fetchPhotos()
  }

  function openDeleteDialog(photo: GalleryItem) {
    if (!photo.created_at) {
      setErrorMsg("This legacy photo is not in Supabase yet, so it cannot be deleted from this panel.")
      setStatus("error")
      return
    }

    setDeleteTarget(photo)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setErrorMsg("")

    const { error } = await supabase.from("gallery_items").delete().eq("id", deleteTarget.id)
    if (error) {
      setErrorMsg(error.message)
      setStatus("error")
      setDeleting(false)
      return
    }

    // Remove from storage after the database row is gone, so a failed delete does not leave a broken image.
    if (deleteTarget.storage_path) {
      await supabase.storage.from("media").remove([deleteTarget.storage_path])
    }

    setDeleting(false)
    setDeleteTarget(null)
    fetchPhotos()
  }

  const canManage = role === "super_admin" || role === "admin"
  const canUpdate = canManage || role === "editor"

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
        {canManage && (
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
        {!canManage && (
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              You have editor access. You can edit gallery details, but only admins can upload or delete photos.
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
                  {photo.created_at && canUpdate && (
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => openEditDialog(photo)}
                        className="rounded-full bg-background/80 p-1.5 hover:bg-primary hover:text-primary-foreground"
                        title="Edit photo"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {canManage && (
                        <button
                          onClick={() => openDeleteDialog(photo)}
                          className="rounded-full bg-background/80 p-1.5 hover:bg-destructive hover:text-destructive-foreground"
                          title="Delete photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                Edit Photo
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {editPreview && (
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                <Image src={editPreview} alt={editCaption || "Photo preview"} fill className="object-contain" unoptimized />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Caption</label>
              <input
                type="text"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {canManage && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Replace Image</label>
                <input
                  ref={editFileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleEditFileSelect(file)
                  }}
                />
                <Button type="button" variant="outline" onClick={() => editFileInput.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Replacement
                </Button>
                {editFile && <p className="text-xs text-muted-foreground">{editFile.name}</p>}
              </div>
            )}

            {status === "error" && errorMsg && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <XCircle className="h-4 w-4" /> {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={savingEdit || !editCaption.trim()}>
                {savingEdit ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Photo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the photo from the gallery. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                handleDelete()
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete Photo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
