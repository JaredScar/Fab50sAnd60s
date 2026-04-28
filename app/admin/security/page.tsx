import { SecurityMfaPanel } from "@/components/admin/security-mfa-panel"

export const metadata = { title: "Security — Admin" }

export default function AdminSecurityPage() {
  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage two-factor authentication for your admin account.
        </p>
      </div>
      <SecurityMfaPanel />
    </div>
  )
}
