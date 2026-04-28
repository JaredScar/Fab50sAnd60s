import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { resolveAdminAccess } from "@/lib/admin-auth"
import { LoginForm } from "./login-form"

export const metadata = { title: "Admin Login — Fab 50s & 60s Car Club" }

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const access = await resolveAdminAccess(user)
    if (access.role) redirect("/admin")
  }

  return <LoginForm error={error} />
}
