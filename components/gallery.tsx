"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { useSiteContent } from "@/hooks/use-site-content"

const galleryImages = [
  {
    src: "/images/gallery-1.jpg",
    alt: "Classic 1957 Chevrolet Bel Air at our annual car show",
    caption: "1957 Chevrolet Bel Air",
  },
  {
    src: "/images/gallery-2.jpg",
    alt: "Row of classic muscle cars at cruise night",
    caption: "Cruise Night Lineup",
  },
  {
    src: "/images/gallery-3.jpg",
    alt: "Club members gathered at monthly meeting",
    caption: "Club Meeting",
  },
  {
    src: "/images/gallery-4.jpg",
    alt: "Restored Ford Mustang at local show",
    caption: "1965 Ford Mustang",
  },
  {
    src: "/images/gallery-5.jpg",
    alt: "Modern sports car alongside classics",
    caption: "All Generations Welcome",
  },
  {
    src: "/images/gallery-6.jpg",
    alt: "Annual BBQ and car show",
    caption: "Annual BBQ Event",
  },
]

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const content = useSiteContent()
  const section = content.homepage.gallery as unknown as {
    title: string
    description: string
    buttonLabel: string
  }

  const openImage = (index: number) => setSelectedImage(index)
  const closeImage = () => setSelectedImage(null)
  
  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % galleryImages.length)
    }
  }
  
  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + galleryImages.length) % galleryImages.length)
    }
  }

  return (
    <section id="gallery" className="bg-card py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {section.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {section.description}
          </p>
          <Button asChild variant="outline" size="lg" className="mt-6">
            <Link href="/gallery">
              {section.buttonLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Gallery Grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((image, index) => (
            <Card
              key={index}
              className="group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              onClick={() => openImage(index)}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                  <div className="text-center p-4">
                    <div className="text-4xl text-primary mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground">{image.caption}</p>
                    <p className="text-xs text-muted-foreground mt-1">Photo coming soon</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
              </div>
              <div className="p-4">
                <p className="font-medium text-foreground">{image.caption}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={selectedImage !== null} onOpenChange={() => closeImage()}>
          <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
            <DialogTitle className="sr-only">
              {selectedImage !== null ? galleryImages[selectedImage].caption : "Gallery Image"}
            </DialogTitle>
            {selectedImage !== null && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -left-16 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                  <span className="sr-only">Previous image</span>
                </Button>
                
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-card">
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                    <div className="text-center p-8">
                      <div className="text-6xl text-primary mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                      </div>
                      <p className="text-xl font-medium text-foreground">{galleryImages[selectedImage].caption}</p>
                      <p className="text-muted-foreground mt-2">Full gallery coming soon</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-16 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                  <span className="sr-only">Next image</span>
                </Button>
                
                <div className="mt-4 text-center">
                  <p className="text-lg font-medium text-primary-foreground">
                    {galleryImages[selectedImage].caption}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
