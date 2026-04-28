"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface Props {
  error?: string
}

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized:
    "Your account is not approved for admin access. Please contact the club president to be granted access.",
  auth_failed: "Authentication failed. Please try again.",
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function LoginForm({ error }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    const supabase = createClient()
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (signErr) {
      setFormError(signErr.message)
      setSubmitting(false)
      return
    }
    router.replace("/admin")
    router.refresh()
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <Car className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Portal</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Fabulous 50s &amp; 60s Nostalgia Car Club
          </p>
        </div>

        {error && ERROR_MESSAGES[error] && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Access Denied</p>
              <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                {ERROR_MESSAGES[error]}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-6">
          <Button
            type="button"
            onClick={signInWithGoogle}
            variant="outline"
            className="w-full gap-3 h-12 text-sm font-semibold border-2"
            size="lg"
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              or
            </span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={signInWithEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
                className="h-11"
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive leading-relaxed" role="alert">
                {formError}
              </p>
            )}
            <Button type="submit" className="w-full h-11" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in with email"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Only approved club administrators can sign in.
            <br />
            Contact the club president if you need access. Use Security in the admin sidebar to
            set up two-factor authentication after you sign in.
          </p>
        </div>
      </div>
    </div>
  )
}
