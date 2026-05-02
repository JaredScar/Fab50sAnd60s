"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, Loader2, ShieldCheck, UserX, RefreshCw, UserPlus, X } from "lucide-react"
import { format } from "date-fns"
import {
  ADMIN_PERMISSION_DESCRIPTIONS,
  ADMIN_PERMISSION_LABELS,
  ADMIN_PERMISSIONS,
  type AdminPermission,
  defaultPermissionsForRole,
} from "@/lib/admin-permissions"

interface AdminUser {
  id: string
  email: string | null
  name: string | null
  avatar: string | null
  role: string | null
  permissions: AdminPermission[]
  lastSignIn: string | null
  createdAt: string
}

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
]

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  admin: "bg-primary/10 text-primary border-primary/20",
  editor: "bg-sky-500/10 text-sky-700 border-sky-500/20",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState("")
  const [newDisplayName, setNewDisplayName] = useState("")
  const [newRole, setNewRole] = useState("editor")
  const [newPermissions, setNewPermissions] = useState<AdminPermission[]>(defaultPermissionsForRole("editor"))
  const [inviteError, setInviteError] = useState("")
  const [newUserCredentials, setNewUserCredentials] = useState<{
    email: string
    password: string
  } | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch("/api/admin/users")
    if (res.ok) {
      setUsers(await res.json())
    }
    setLoading(false)
  }

  async function handleRoleChange(userId: string, role: string) {
    const user = users.find((u) => u.id === userId)
    setUpdating(userId)
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        role,
        permissions: user?.role ? user.permissions : defaultPermissionsForRole(role),
      }),
    })
    setUpdating(null)
    fetchUsers()
  }

  async function handlePermissionToggle(
    user: AdminUser,
    permission: AdminPermission,
    enabled: boolean
  ) {
    if (!user.role) return

    const permissions = enabled
      ? Array.from(new Set([...user.permissions, permission]))
      : user.permissions.filter((item) => item !== permission)

    setUpdating(user.id)
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, role: user.role, permissions }),
    })
    setUpdating(null)
    fetchUsers()
  }

  async function handleRevokeAccess(user: AdminUser) {
    if (!confirm(`Revoke admin access for ${user.name ?? user.email}? They will be signed out on their next visit.`)) return
    setUpdating(user.id)
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
    setUpdating(null)
    fetchUsers()
  }

  async function handlePreApproveUser() {
    setInviteError("")
    setNewUserCredentials(null)
    setUpdating("new-user")

    const emailTrimmed = newEmail.trim()
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailTrimmed,
        displayName: newDisplayName.trim() || undefined,
        role: newRole,
        permissions: newPermissions,
      }),
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setInviteError(typeof body.error === "string" ? body.error : "Unable to add user.")
      setUpdating(null)
      return
    }

    if (typeof body.temporaryPassword === "string") {
      setNewUserCredentials({ email: emailTrimmed, password: body.temporaryPassword })
    }

    setNewEmail("")
    setNewDisplayName("")
    setNewRole("editor")
    setNewPermissions(defaultPermissionsForRole("editor"))
    setUpdating(null)
    fetchUsers()
  }

  async function copyPasswordOnly() {
    if (!newUserCredentials) return
    await navigator.clipboard.writeText(newUserCredentials.password)
  }

  function handleNewRoleChange(role: string) {
    setNewRole(role)
    setNewPermissions(defaultPermissionsForRole(role).filter((permission) => permission !== "users"))
  }

  function toggleNewPermission(permission: AdminPermission, enabled: boolean) {
    setNewPermissions((current) =>
      enabled
        ? Array.from(new Set([...current, permission]))
        : current.filter((item) => item !== permission)
    )
  }

  const approvedUsers = users.filter((u) => u.role)
  const pendingUsers = users.filter((u) => !u.role)

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users &amp; Access</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage who has access to the admin portal and their permissions.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-10">

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Role explanation */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { role: "super_admin", label: "Super Admin", desc: "Full access including user management" },
                { role: "admin", label: "Admin", desc: "Can create/delete in the tabs they are allowed to access" },
                { role: "editor", label: "Editor", desc: "Can edit in allowed tabs but cannot delete or manage users" },
              ].map(({ role, label, desc }) => (
                <div key={role} className="rounded-xl border border-border bg-card p-4">
                  <Badge variant="outline" className={ROLE_COLORS[role]}>{label}</Badge>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-3">
                <UserPlus className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-base font-semibold text-foreground">Pre-Approve admin user</h2>
                  <p className="text-sm text-muted-foreground">
                    Creates a confirmed account with a temporary password. Copy it from the banner below and share it
                    securely. They sign in on the admin login with email and password. If the address already belongs to
                    an account, we only update role and optional display name — we never reset an existing password.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_12rem]">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                    placeholder="admin@example.com"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <Select value={newRole} onValueChange={handleNewRoleChange}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Display name <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(event) => setNewDisplayName(event.target.value)}
                  placeholder="e.g. Pat Smith"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground">
                  Shown in the admin UI. You can set or update this even when adding access to someone who already has
                  an account.
                </p>
              </div>

              <div className="mt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Allowed admin tabs
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ADMIN_PERMISSIONS.filter((permission) => permission !== "users").map((permission) => (
                    <label
                      key={permission}
                      className="flex items-start gap-2 rounded-lg border border-border bg-background/50 p-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={newRole === "super_admin" || newPermissions.includes(permission)}
                        disabled={newRole === "super_admin"}
                        onChange={(event) => toggleNewPermission(permission, event.target.checked)}
                      />
                      <span>
                        <span className="block font-medium text-foreground">
                          {ADMIN_PERMISSION_LABELS[permission]}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {ADMIN_PERMISSION_DESCRIPTIONS[permission]}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {inviteError && <p className="mt-3 text-sm text-destructive">{inviteError}</p>}

              {newUserCredentials && (
                <div className="mt-4 rounded-xl border border-amber-500/35 bg-amber-500/8 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">New account — copy the temporary password</p>
                    <button
                      type="button"
                      onClick={() => setNewUserCredentials(null)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This password is shown only once. Share it securely with the user. After they sign in, they must
                    choose a new password before using the admin portal.
                  </p>
                  <dl className="grid gap-2 text-sm">
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Email</dt>
                      <dd className="font-mono text-foreground break-all">{newUserCredentials.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Temporary password</dt>
                      <dd className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-foreground break-all">{newUserCredentials.password}</span>
                        <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={copyPasswordOnly}>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </Button>
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              <div className="mt-5">
                <Button
                  onClick={handlePreApproveUser}
                  disabled={updating === "new-user" || !newEmail.trim()}
                  className="gap-2"
                >
                  {updating === "new-user" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Add User Access
                </Button>
              </div>
            </section>

            {/* Approved admins */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  Approved Admins ({approvedUsers.length})
                </h2>
              </div>

              {approvedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No approved admins yet.</p>
              ) : (
                <div className="space-y-2">
                  {approvedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        {user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatar} alt={user.name ?? ""} className="h-10 w-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground shrink-0">
                            {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">
                            {user.name ?? <span className="text-muted-foreground italic">No name</span>}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          {user.lastSignIn && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Last sign-in: {format(new Date(user.lastSignIn), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>

                        {/* Role selector */}
                        <div className="shrink-0 w-40">
                          <Select
                            value={user.role ?? ""}
                            onValueChange={(v) => handleRoleChange(user.id, v)}
                            disabled={updating === user.id}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value} className="text-xs">
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Revoke */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 hover:text-destructive hover:bg-destructive/5"
                          onClick={() => handleRevokeAccess(user)}
                          disabled={updating === user.id}
                          title="Revoke access"
                        >
                          {updating === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="mt-4 border-t border-border pt-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Allowed admin tabs
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {ADMIN_PERMISSIONS.filter((permission) => permission !== "users").map((permission) => (
                            <label
                              key={permission}
                              className="flex items-start gap-2 rounded-lg border border-border bg-background/50 p-3 text-sm"
                            >
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={user.role === "super_admin" || user.permissions.includes(permission)}
                                disabled={user.role === "super_admin" || updating === user.id}
                                onChange={(event) =>
                                  handlePermissionToggle(user, permission, event.target.checked)
                                }
                              />
                              <span>
                                <span className="block font-medium text-foreground">
                                  {ADMIN_PERMISSION_LABELS[permission]}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {ADMIN_PERMISSION_DESCRIPTIONS[permission]}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                        {user.role === "super_admin" && (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Super admins always have access to every tab, including Users & Access.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Users who signed in but have no role */}
            {pendingUsers.length > 0 && (
              <section>
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-foreground">
                    Signed In (No Role Assigned) — {pendingUsers.length}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    These accounts have signed in but have not been granted any role. Assign a role to grant access.
                  </p>
                </div>

                <div className="space-y-2">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 p-4"
                    >
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar} alt={user.name ?? ""} className="h-10 w-10 rounded-full object-cover shrink-0 opacity-60" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground shrink-0">
                          {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {user.name ?? <span className="text-muted-foreground italic">No name</span>}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        {user.lastSignIn && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Signed in: {format(new Date(user.lastSignIn), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>

                      <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                        No Access
                      </Badge>

                      <div className="shrink-0 w-40">
                        <Select
                          onValueChange={(v) => handleRoleChange(user.id, v)}
                          disabled={updating === user.id}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Grant role…" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value} className="text-xs">
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
