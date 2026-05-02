import { randomBytes } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import {
  defaultPermissionsForRole,
  isAdminPermission,
  normalizeAdminPermissions,
} from "@/lib/admin-permissions"
import { resolveAdminAccess } from "@/lib/admin-auth"

const VALID_ROLES = ["super_admin", "admin", "editor"]

function generateTemporaryPassword(): string {
  return randomBytes(15).toString("base64url")
}

async function requireSuperAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const access = await resolveAdminAccess(user)
  if (access.role !== "super_admin") return null
  return user
}

export async function GET() {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const service = await createServiceClient()

  const [{ data: authUsers, error: authErr }, { data: roles, error: rolesErr }] =
    await Promise.all([
      service.auth.admin.listUsers({ perPage: 500 }),
      service.from("user_roles").select("user_id, role"),
    ])

  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

  const roleMap = new Map(
    (roles ?? []).map((r: { user_id: string; role: string }) => [r.user_id, r.role])
  )

  return NextResponse.json(
    (authUsers?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email,
      name:
        (u.user_metadata?.full_name as string) ||
        (u.user_metadata?.name as string) ||
        null,
      avatar: (u.user_metadata?.avatar_url as string) || null,
      role: roleMap.get(u.id) ?? (u.app_metadata?.role as string | undefined) ?? null,
      permissions: normalizeAdminPermissions(u.app_metadata?.admin_permissions) ??
        defaultPermissionsForRole(roleMap.get(u.id) ?? (u.app_metadata?.role as string | undefined)),
      lastSignIn: u.last_sign_in_at ?? null,
      createdAt: u.created_at,
    }))
  )
}

export async function PUT(request: NextRequest) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId, role, permissions } = await request.json()
  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role are required" }, { status: 400 })
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const normalizedPermissions = Array.isArray(permissions)
    ? permissions.filter(isAdminPermission)
    : defaultPermissionsForRole(role)
  const nextPermissions = role === "super_admin"
    ? defaultPermissionsForRole("super_admin")
    : normalizedPermissions.filter((permission) => permission !== "users")

  const service = await createServiceClient()
  const { error } = await service
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: metadataError } = await service.auth.admin.updateUserById(userId, {
    app_metadata: { role, admin_permissions: nextPermissions },
  })

  if (metadataError) {
    return NextResponse.json({ error: metadataError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { email, role, permissions, displayName } = await request.json()
  const normalizedEmail = String(email ?? "").trim().toLowerCase()
  const displayNameTrimmed = String(displayName ?? "").trim().slice(0, 120) || undefined

  if (!normalizedEmail || !role) {
    return NextResponse.json({ error: "email and role are required" }, { status: 400 })
  }

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  if (!emailLooksValid) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const normalizedPermissions = Array.isArray(permissions)
    ? permissions.filter(isAdminPermission)
    : defaultPermissionsForRole(role)
  const nextPermissions = role === "super_admin"
    ? defaultPermissionsForRole("super_admin")
    : normalizedPermissions.filter((permission) => permission !== "users")

  const service = await createServiceClient()
  const { data: existingUsers, error: listError } = await service.auth.admin.listUsers({ perPage: 500 })
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })

  let authUser = existingUsers.users.find((user) => user.email?.toLowerCase() === normalizedEmail)
  let temporaryPassword: string | undefined

  if (!authUser) {
    const password = generateTemporaryPassword()
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      ...(displayNameTrimmed
        ? { user_metadata: { full_name: displayNameTrimmed } }
        : {}),
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }
    authUser = created.user
    temporaryPassword = password
  } else if (displayNameTrimmed) {
    const { error: nameError } = await service.auth.admin.updateUserById(authUser.id, {
      user_metadata: {
        ...((authUser.user_metadata ?? {}) as Record<string, unknown>),
        full_name: displayNameTrimmed,
      },
    })
    if (nameError) {
      return NextResponse.json({ error: nameError.message }, { status: 500 })
    }
  }

  if (!authUser?.id) {
    return NextResponse.json({ error: "Unable to create or find user." }, { status: 500 })
  }

  const { error: roleError } = await service
    .from("user_roles")
    .upsert({ user_id: authUser.id, role }, { onConflict: "user_id" })

  if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 })

  const { error: metadataError } = await service.auth.admin.updateUserById(authUser.id, {
    app_metadata: { role, admin_permissions: nextPermissions },
  })

  if (metadataError) {
    return NextResponse.json({ error: metadataError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    ...(temporaryPassword ? { temporaryPassword } : {}),
  })
}

export async function DELETE(request: NextRequest) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 })

  const service = await createServiceClient()
  const { error } = await service.from("user_roles").delete().eq("user_id", userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: metadataError } = await service.auth.admin.updateUserById(userId, {
    app_metadata: { role: null, admin_permissions: [] },
  })

  if (metadataError) {
    return NextResponse.json({ error: metadataError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
