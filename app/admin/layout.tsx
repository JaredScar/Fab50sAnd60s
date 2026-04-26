import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/sidebar"

export const metadata = { title: "Admin — Fab 50s & 60s Car Club" }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // No user → render bare (login page; middleware handles redirect for everything else)
  if (!user) {
    return <>{children}</>
  }

  const adminUser = {
    name:
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      user.email?.split("@")[0] ||
      "Admin",
    email: user.email ?? "",
    role: (user.app_metadata?.role as string) ?? "",
    avatar: (user.user_metadata?.avatar_url as string) || undefined,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar user={adminUser} />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  )
}
