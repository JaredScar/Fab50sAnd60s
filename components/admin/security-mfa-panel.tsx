"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Shield } from "lucide-react"

function qrToDataUrl(qr: string) {
  if (qr.startsWith("data:")) return qr
  return `data:image/svg+xml;utf8,${encodeURIComponent(qr)}`
}

async function clearUnverifiedTotp() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) throw error
  for (const f of data.totp) {
    if (f.status !== "verified") {
      const { error: u } = await supabase.auth.mfa.unenroll({ factorId: f.id })
      if (u) throw u
    }
  }
}

export function SecurityMfaPanel() {
  const [totpFactors, setTotpFactors] = useState<
    Array<{ id: string; friendly_name?: string; status: string }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [pendingFactorId, setPendingFactorId] = useState("")
  const [qrSrc, setQrSrc] = useState("")
  const [verifyCode, setVerifyCode] = useState("")
  const [busy, setBusy] = useState(false)

  const refreshFactors = useCallback(async () => {
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.mfa.listFactors()
    if (err) {
      setError(err.message)
      return
    }
    setTotpFactors(
      data.totp.map((f) => ({
        id: f.id,
        friendly_name: f.friendly_name,
        status: f.status,
      }))
    )
  }, [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      await refreshFactors()
      setLoading(false)
    })()
  }, [refreshFactors])

  const verifiedFactors = totpFactors.filter((f) => f.status === "verified")

  async function startEnrollment() {
    setError(null)
    setBusy(true)
    try {
      await clearUnverifiedTotp()
      const supabase = createClient()
      const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator app",
      })
      if (enrollErr) throw enrollErr
      setPendingFactorId(data.id)
      setQrSrc(qrToDataUrl(data.totp.qr_code))
      setEnrolling(true)
      setVerifyCode("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start authenticator setup.")
    } finally {
      setBusy(false)
    }
  }

  async function confirmEnrollment() {
    setError(null)
    setBusy(true)
    try {
      const supabase = createClient()
      const challenge = await supabase.auth.mfa.challenge({ factorId: pendingFactorId })
      if (challenge.error) throw challenge.error
      const verify = await supabase.auth.mfa.verify({
        factorId: pendingFactorId,
        challengeId: challenge.data.id,
        code: verifyCode.replace(/\s/g, ""),
      })
      if (verify.error) throw verify.error
      setEnrolling(false)
      setPendingFactorId("")
      setQrSrc("")
      await refreshFactors()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code. Try again.")
    } finally {
      setBusy(false)
    }
  }

  async function cancelEnrollment() {
    setBusy(true)
    if (pendingFactorId) {
      const supabase = createClient()
      await supabase.auth.mfa.unenroll({ factorId: pendingFactorId })
    }
    setEnrolling(false)
    setPendingFactorId("")
    setQrSrc("")
    setVerifyCode("")
    await refreshFactors()
    setBusy(false)
  }

  async function removeFactor(id: string) {
    if (
      !confirm(
        "Remove this authenticator? You will need it to sign in until you set up a new one."
      )
    ) {
      return
    }
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.auth.mfa.unenroll({ factorId: id })
    if (err) setError(err.message)
    await refreshFactors()
    setBusy(false)
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading security settings…</p>
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">Authenticator app (TOTP)</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use Google Authenticator, 1Password, Authy, or any TOTP app. After you enroll, you
            will enter a code when signing in.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
        </div>
      )}

      {verifiedFactors.length > 0 && (
        <ul className="space-y-2">
          {verifiedFactors.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {f.friendly_name || "Authenticator app"}
                </p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/5"
                disabled={busy}
                onClick={() => removeFactor(f.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      {!enrolling && verifiedFactors.length === 0 && (
        <Button type="button" onClick={startEnrollment} disabled={busy}>
          Set up authenticator
        </Button>
      )}

      {!enrolling && verifiedFactors.length > 0 && (
        <p className="text-xs text-muted-foreground">
          To replace your authenticator, remove the existing one first, then add a new device.
        </p>
      )}

      {enrolling && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Scan this QR code with your authenticator app, or enter the setup key manually if you
            cannot scan.
          </p>
          {qrSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrSrc} alt="" className="mx-auto max-w-[200px] rounded-lg border bg-white p-2" />
          )}
          <div className="space-y-2">
            <Label htmlFor="mfa-enroll-code">Verification code</Label>
            <Input
              id="mfa-enroll-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="font-mono tracking-widest"
              disabled={busy}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={confirmEnrollment}
              disabled={busy || verifyCode.replace(/\s/g, "").length < 6}
            >
              Enable 2FA
            </Button>
            <Button type="button" variant="ghost" onClick={cancelEnrollment} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
