"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X, Images, Loader2 } from "lucide-react"

const CATEGORIES = ["All", "Car Shows", "Cruise Nights", "Member Cars", "Club Events", "Other"]

interface GalleryItem {
  id: string
  src: string
  caption: string
  category: string
  uploadedAt: string
}

export default function GalleryPage() {
  const [photos, setPhotos]           = useState<GalleryItem[]>([])
  const [loading, setLoading]         = useState(true)
  const [activeCategory, setCategory] = useState("All")
  const [lightboxOpen, setLightbox]   = useState(false)
  const [currentIdx, setCurrentIdx]   = useState(0)

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => { setPhotos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = activeCategory === "All"
    ? photos
    : photos.filter((p) => p.category === activeCategory)

  function open(idx: number) { setCurrentIdx(idx); setLightbox(true) }
  function prev() { setCurrentIdx((i) => (i - 1 + filtered.length) % filtered.length) }
  function next() { setCurrentIdx((i) => (i + 1) % filtered.length) }

  const current = filtered[currentIdx]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20">
        {/* Page Header */}
        <div className="bg-card border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                <Images className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Photo Gallery
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  Memories from our car shows, cruise nights, and club events
                </p>
              </div>
            </div>

            {/* Category filter */}
            <div className="mt-8 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setCategory(cat); setCurrentIdx(0) }}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="py-24 text-center">
              <Images className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-lg font-medium text-foreground">No photos yet</p>
              <p className="mt-1 text-muted-foreground">
                {activeCategory === "All"
                  ? "The admin can upload photos from the admin panel."
                  : `No photos in the "${activeCategory}" category yet.`}
              </p>
            </div>
          )}

          {/* Photo grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => open(idx)}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <Image
                    src={photo.src}
                    alt={photo.caption}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/30" />
                  {/* Caption */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-foreground/80 to-transparent p-3 transition-transform group-hover:translate-y-0">
                    <p className="truncate text-sm font-medium text-white">{photo.caption}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Photo count */}
          {!loading && filtered.length > 0 && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {filtered.length} photo{filtered.length !== 1 ? "s" : ""}
              {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            </p>
          )}
        </div>
      </main>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightbox}>
        <DialogContent className="max-w-5xl border-0 bg-black/95 p-0">
          <DialogTitle className="sr-only">
            {current?.caption ?? "Photo"}
          </DialogTitle>
          {current && (
            <div className="relative flex flex-col">
              {/* Image */}
              <div className="relative max-h-[80vh] min-h-[50vh] w-full overflow-hidden">
                <Image
                  src={current.src}
                  alt={current.caption}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Caption */}
              <div className="bg-black/80 px-6 py-4">
                <p className="text-base font-medium text-white">{current.caption}</p>
                <p className="mt-0.5 text-sm text-white/60">{current.category}</p>
              </div>

              {/* Prev */}
              {filtered.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/75"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {/* Next */}
              {filtered.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); next() }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/75"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLightbox(false)}
                className="absolute right-2 top-2 bg-black/50 text-white hover:bg-black/75"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Counter */}
              {filtered.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  {currentIdx + 1} / {filtered.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
