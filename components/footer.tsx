"use client"

import Image from "next/image"
import Link from "next/link"
import { Facebook, Mail } from "lucide-react"
import { useSiteContent } from "@/hooks/use-site-content"

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/calendar", label: "Events Calendar" },
  { href: "/gallery", label: "Gallery" },
  { href: "/board", label: "Board of Directors" },
  { href: "/membership", label: "Join the Club" },
  { href: "/memoriam", label: "In Memoriam" },
  { href: "/contact", label: "Contact" },
]

export function Footer() {
  const content = useSiteContent()
  const identity = content.global.identity as unknown as {
    brandTitle: string
    brandSubtitle: string
    logoAlt: string
    footerDescription: string
    footerLocation: string
    copyrightName: string
  }
  const contact = content.global.contact as unknown as {
    email: string
    facebookUrl: string
    meetingTitle: string
    meetingLines: string[]
    meetingNote: string
  }

  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt={identity.logoAlt}
                width={60}
                height={60}
                className="h-14 w-auto brightness-110"
              />
              <div>
                <p className="text-lg font-bold">{identity.brandTitle}</p>
                <p className="text-sm text-background/70">{identity.brandSubtitle}</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-background/70 leading-relaxed">
              {identity.footerDescription}
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href={contact.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                aria-label="Email us"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-background">Quick Links</h4>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/70 transition-colors hover:text-background"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Meeting Info */}
          <div>
            <h4 className="font-semibold text-background">{contact.meetingTitle}</h4>
            <div className="mt-4 space-y-2 text-background/70">
              {contact.meetingLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-4 text-sm text-background/50">
              {contact.meetingNote}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-background/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-background/50">
              &copy; {new Date().getFullYear()} {identity.copyrightName}. All rights reserved.
            </p>
            <p className="text-sm text-background/50">
              {identity.footerLocation}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
