"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Car, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ChangeRequiredPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("New password and confirmation do not match.")
      return
    }

    setSubmitting(true)
    const res = await fetch("/api/auth/required-password-change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password }),
    })

    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(typeof body.error === "string" ? body.error : "Unable to update password.")
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    const { error: refreshErr } = await supabase.auth.refreshSession()
    if (refreshErr) {
      setError("Password was saved but we could not refresh your session. Please sign in again.")
      setSubmitting(false)
      return
    }

    router.replace("/admin")
    router.refresh()
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Car className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-foreground">Choose a new password</h1>
        <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
          Your account was created with a temporary password. Set a new password before continuing to the admin portal.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm space-y-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              name="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
              minLength={8}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={submitting}
              required
              minLength={8}
              className="h-11"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive leading-relaxed" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full h-11" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save password and continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
