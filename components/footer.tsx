import Image from "next/image"
import Link from "next/link"
import { Facebook, Mail } from "lucide-react"

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
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Fab 50s & 60s Nostalgia Car Club"
                width={60}
                height={60}
                className="h-14 w-auto brightness-110"
              />
              <div>
                <p className="text-lg font-bold">Fab 50s & 60s</p>
                <p className="text-sm text-background/70">Nostalgia Car Club</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-background/70 leading-relaxed">
              Long Island's friendliest car club, welcoming enthusiasts of ALL makes, 
              models, and years since 1989. If you love cars, you belong here.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://facebook.com/fab5060carclub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="mailto:info@fab5060carclub.com"
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
            <h4 className="font-semibold text-background">Monthly Meetings</h4>
            <div className="mt-4 space-y-2 text-background/70">
              <p>Second Thursday of Every Month</p>
              <p>7:00 PM</p>
              <p>Seaport Diner</p>
              <p>Port Jefferson Station, NY</p>
            </div>
            <p className="mt-4 text-sm text-background/50">
              Visitors always welcome!
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-background/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-background/50">
              &copy; {new Date().getFullYear()} Fabulous 50s & 60s Nostalgia Car Club. All rights reserved.
            </p>
            <p className="text-sm text-background/50">
              Long Island, New York
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
