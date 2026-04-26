import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "./login-form"

export const metadata = { title: "Admin Login — Fab 50s & 60s Car Club" }

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  // If already authenticated with a role, go straight to dashboard
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user?.app_metadata?.role) redirect("/admin")

  return <LoginForm error={error} />
}
