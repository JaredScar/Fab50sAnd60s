import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import {
  ImageIcon,
  CalendarDays,
  Users,
  Heart,
  FileText,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { type AdminPermission, hasAdminPermission } from "@/lib/admin-permissions"

export default async function AdminDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user?.app_metadata?.role as string
  const permissions = user?.app_metadata?.admin_permissions
  const name =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    "Admin"

  // Fetch counts for summary cards
  const [{ count: galleryCount }, { count: eventsCount }, { count: boardCount }, { count: memoriamCount }] =
    await Promise.all([
      supabase.from("gallery_items").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("board_members").select("*", { count: "exact", head: true }),
      supabase.from("memoriam_entries").select("*", { count: "exact", head: true }),
    ])

  const cards: Array<{
    href: string
    label: string
    description: string
    icon: typeof ImageIcon
    count: number | null
    unit: string
    permission: AdminPermission
  }> = [
    {
      href: "/admin/gallery",
      label: "Gallery",
      description: "Upload and manage club photos",
      icon: ImageIcon,
      count: galleryCount ?? 0,
      unit: "photo",
      permission: "gallery",
    },
    {
      href: "/admin/events",
      label: "Events",
      description: "Manage cruise nights, shows, and meetings",
      icon: CalendarDays,
      count: eventsCount ?? 0,
      unit: "event",
      permission: "events",
    },
    {
      href: "/admin/board",
      label: "Board Members",
      description: "Update officer info and photos",
      icon: Users,
      count: boardCount ?? 0,
      unit: "member",
      permission: "board",
    },
    {
      href: "/admin/memoriam",
      label: "In Memoriam",
      description: "Honor members who have passed",
      icon: Heart,
      count: memoriamCount ?? 0,
      unit: "entry",
      permission: "memoriam",
    },
    {
      href: "/admin/content",
      label: "Site Content",
      description: "Edit homepage and membership text",
      icon: FileText,
      count: null,
      unit: "",
      permission: "content",
    },
    ...(role === "super_admin"
      ? [
          {
            href: "/admin/users",
            label: "Users & Access",
            description: "Manage admin roles and permissions",
            icon: ShieldCheck,
            count: null,
            unit: "",
            permission: "users" as AdminPermission,
          },
        ]
      : []),
  ]

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage your club&apos;s website content from here.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Gallery Photos", value: galleryCount ?? 0 },
          { label: "Events", value: eventsCount ?? 0 },
          { label: "Board Members", value: boardCount ?? 0 },
          { label: "In Memoriam", value: memoriamCount ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* CMS cards */}
      <h2 className="text-base font-semibold text-foreground mb-4">
        Content Management
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards
          .filter((card) => hasAdminPermission(role, permissions, card.permission))
          .map(({ href, label, description, icon: Icon, count, unit }) => (
          <Link key={href} href={href}>
            <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{label}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
                {count !== null && (
                  <p className="mt-3 text-xs text-muted-foreground font-medium">
                    {count} {unit}{count !== 1 ? "s" : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
