"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Car,
  LayoutDashboard,
  ImageIcon,
  CalendarDays,
  Users,
  Heart,
  FileText,
  ShieldCheck,
  KeyRound,
  LogOut,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  type AdminPermission,
  hasAdminPermission,
} from "@/lib/admin-permissions"

interface AdminUser {
  name: string
  email: string
  role: string
  avatar?: string
  permissions?: AdminPermission[]
}

interface Props {
  user: AdminUser
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, permission: "gallery" },
  { href: "/admin/events", label: "Events", icon: CalendarDays, permission: "events" },
  { href: "/admin/board", label: "Board Members", icon: Users, permission: "board" },
  { href: "/admin/memoriam", label: "In Memoriam", icon: Heart, permission: "memoriam" },
  { href: "/admin/content", label: "Site Content", icon: FileText, permission: "content" },
]

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  admin: "bg-primary/10 text-primary border-primary/20",
  editor: "bg-sky-500/10 text-sky-700 border-sky-500/20",
}

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card sticky top-0 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <Car className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate leading-tight">
            Fab 50s &amp; 60s
          </p>
          <p className="text-xs text-muted-foreground">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems
          .filter((item) =>
            !item.permission ||
            hasAdminPermission(user.role, user.permissions, item.permission as AdminPermission)
          )
          .map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group",
                isActive(href, exact)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive(href, exact) && (
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              )}
            </Link>
          ))}

        {/* Super admin only */}
        {user.role === "super_admin" && (
          <Link
            href="/admin/users"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group",
              isActive("/admin/users")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="flex-1">Users &amp; Access</span>
            {isActive("/admin/users") && (
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            )}
          </Link>
        )}

        <div className="pt-2 mt-2 border-t border-border space-y-1">
          <Link
            href="/admin/security"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group",
              isActive("/admin/security")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <KeyRound className="h-4 w-4 shrink-0" />
            <span className="flex-1">Security</span>
            {isActive("/admin/security") && (
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            )}
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span className="flex-1">View Public Site</span>
          </Link>
        </div>
      </nav>

      {/* User info + logout */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center gap-3 min-w-0">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate leading-tight">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn("text-xs w-full justify-center", ROLE_COLORS[user.role])}
        >
          {ROLE_LABELS[user.role] ?? user.role}
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
