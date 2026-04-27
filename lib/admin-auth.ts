import type { User } from "@supabase/supabase-js"
import { createServiceClient } from "@/lib/supabase/server"
import {
  type AdminPermission,
  defaultPermissionsForRole,
  normalizeAdminPermissions,
  resolveAdminPermissions,
} from "@/lib/admin-permissions"

export interface ResolvedAdminAccess {
  role: string | null
  permissions: AdminPermission[]
}

export async function resolveAdminAccess(user: User): Promise<ResolvedAdminAccess> {
  const metadataRole = user.app_metadata?.role as string | undefined
  const metadataPermissions = user.app_metadata?.admin_permissions

  if (metadataRole) {
    return {
      role: metadataRole,
      permissions: resolveAdminPermissions(metadataRole, metadataPermissions),
    }
  }

  const service = await createServiceClient()
  const { data } = await service
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  const role = data?.role as string | undefined
  if (!role) {
    return { role: null, permissions: [] }
  }

  const permissions = normalizeAdminPermissions(metadataPermissions) ?? defaultPermissionsForRole(role)

  await service.auth.admin.updateUserById(user.id, {
    app_metadata: { role, admin_permissions: permissions },
  })

  return { role, permissions }
}
