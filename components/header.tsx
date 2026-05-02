"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LayoutDashboard, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSiteContent } from "@/hooks/use-site-content"
import { createClient } from "@/lib/supabase/client"

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/calendar", label: "Calendar" },
  { href: "/gallery", label: "Gallery" },
  { href: "/board", label: "Board" },
  { href: "/membership", label: "Membership" },
  { href: "/memoriam", label: "In Memoriam" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    function syncSession() {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setSignedIn(!!user)
      })
    }

    syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const content = useSiteContent()
  const identity = content.global.identity as unknown as {
    brandTitle: string
    brandSubtitle: string
    logoAlt: string
    joinLabel: string
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {signedIn && (
        <div className="border-b border-border/50 bg-muted/40">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 sm:justify-end sm:px-6 lg:px-8">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="h-8 gap-2 text-xs font-semibold shadow-none"
            >
              <Link href="/admin">
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                Admin dashboard
              </Link>
            </Button>
          </div>
        </div>
      )}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt={identity.logoAlt}
            width={70}
            height={70}
            className="h-16 w-auto"
          />
          <div className="hidden sm:block">
            <p className="text-lg font-bold leading-tight text-foreground">{identity.brandTitle}</p>
            <p className="text-sm text-muted-foreground">{identity.brandSubtitle}</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/membership">{identity.joinLabel}</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm bg-background">
            <div className="flex flex-col gap-8 pt-8">
              <Image
                src="/images/logo.png"
                alt={identity.logoAlt}
                width={120}
                height={120}
                className="mx-auto h-24 w-auto"
              />
              <nav className="flex flex-col items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                {signedIn && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-xl font-semibold text-primary transition-colors hover:text-primary/90"
                  >
                    <LayoutDashboard className="h-5 w-5" aria-hidden />
                    Admin dashboard
                  </Link>
                )}
              </nav>
              <Button asChild size="lg" className="mx-auto w-fit bg-primary text-primary-foreground">
                <Link href="/membership" onClick={() => setIsOpen(false)}>
                  {identity.joinLabel}
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
