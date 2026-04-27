import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import {
  defaultPermissionsForRole,
  normalizeAdminPermissions,
} from "@/lib/admin-permissions"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/admin"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const user = data.user
      if (user && !user.app_metadata?.role) {
        const service = await createServiceClient()
        const { data: roleRow } = await service
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle()

        const role = roleRow?.role as string | undefined
        if (role) {
          await service.auth.admin.updateUserById(user.id, {
            app_metadata: {
              role,
              admin_permissions:
                normalizeAdminPermissions(user.app_metadata?.admin_permissions) ??
                defaultPermissionsForRole(role),
            },
          })
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`)
}
