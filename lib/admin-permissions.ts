export const ADMIN_PERMISSIONS = [
  "gallery",
  "events",
  "board",
  "memoriam",
  "content",
  "users",
] as const

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]

export const ADMIN_PERMISSION_LABELS: Record<AdminPermission, string> = {
  gallery: "Gallery",
  events: "Events",
  board: "Board Members",
  memoriam: "In Memoriam",
  content: "Site Content",
  users: "Users & Access",
}

export const ADMIN_PERMISSION_DESCRIPTIONS: Record<AdminPermission, string> = {
  gallery: "Upload, edit, and manage gallery photos.",
  events: "Manage cruise nights, meetings, shows, and calendar entries.",
  board: "Manage board member names, titles, photos, and ordering.",
  memoriam: "Manage In Memoriam entries and tribute photos.",
  content: "Edit public site copy using the Site Content CMS.",
  users: "Manage administrator roles and section access.",
}

export const ADMIN_ROUTE_PERMISSIONS: Array<{
  prefix: string
  permission: AdminPermission
}> = [
  { prefix: "/admin/gallery", permission: "gallery" },
  { prefix: "/admin/events", permission: "events" },
  { prefix: "/admin/board", permission: "board" },
  { prefix: "/admin/memoriam", permission: "memoriam" },
  { prefix: "/admin/content", permission: "content" },
  { prefix: "/admin/users", permission: "users" },
]

export function defaultPermissionsForRole(role: string | null | undefined): AdminPermission[] {
  if (role === "super_admin") return [...ADMIN_PERMISSIONS]
  if (role === "admin" || role === "editor") {
    return ["gallery", "events", "board", "memoriam", "content"]
  }
  return []
}

export function isAdminPermission(value: unknown): value is AdminPermission {
  return typeof value === "string" && ADMIN_PERMISSIONS.includes(value as AdminPermission)
}

export function normalizeAdminPermissions(value: unknown): AdminPermission[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter(isAdminPermission)
}

export function resolveAdminPermissions(
  role: string | null | undefined,
  permissions: unknown
): AdminPermission[] {
  return normalizeAdminPermissions(permissions) ?? defaultPermissionsForRole(role)
}

export function hasAdminPermission(
  role: string | null | undefined,
  permissions: unknown,
  permission: AdminPermission
) {
  if (role === "super_admin") return true
  return resolveAdminPermissions(role, permissions).includes(permission)
}
