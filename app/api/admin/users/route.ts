import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

async function requireSuperAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== "super_admin") return null
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
      lastSignIn: u.last_sign_in_at ?? null,
      createdAt: u.created_at,
    }))
  )
}

export async function PUT(request: NextRequest) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId, role } = await request.json()
  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role are required" }, { status: 400 })
  }

  const VALID_ROLES = ["super_admin", "admin", "editor"]
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const service = await createServiceClient()
  const { error } = await service
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: metadataError } = await service.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  })

  if (metadataError) {
    return NextResponse.json({ error: metadataError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
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
    app_metadata: { role: null },
  })

  if (metadataError) {
    return NextResponse.json({ error: metadataError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
