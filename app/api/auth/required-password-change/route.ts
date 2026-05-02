import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

const MIN_PASSWORD_LENGTH = 8

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  }

  if (user.app_metadata?.must_change_password !== true) {
    return NextResponse.json({ error: "Password change is not required." }, { status: 403 })
  }

  const { newPassword } = await request.json()
  if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    )
  }

  const service = await createServiceClient()
  const nextMeta = {
    ...(user.app_metadata ?? {}) as Record<string, unknown>,
    must_change_password: false,
  }

  const { error } = await service.auth.admin.updateUserById(user.id, {
    password: newPassword,
    app_metadata: nextMeta,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
