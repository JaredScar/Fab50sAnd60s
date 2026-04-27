import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import {
  ADMIN_ROUTE_PERMISSIONS,
  defaultPermissionsForRole,
  hasAdminPermission,
  normalizeAdminPermissions,
} from "@/lib/admin-permissions"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes; skip the login page and auth callback
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/auth")) {
    return NextResponse.next()
  }
  if (pathname === "/admin/login" || pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update the request cookies (name+value only — options not accepted here)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          // Propagate full cookie options to the response
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: use getUser() not getSession() to validate token server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/admin/login"
    loginUrl.searchParams.delete("error")
    return NextResponse.redirect(loginUrl)
  }

  let role = user.app_metadata?.role as string | undefined
  let permissions = user.app_metadata?.admin_permissions

  if (!role) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()

    role = data?.role as string | undefined
    permissions = normalizeAdminPermissions(permissions) ?? defaultPermissionsForRole(role)
  }

  if (!role) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/admin/login"
    loginUrl.searchParams.set("error", "unauthorized")
    return NextResponse.redirect(loginUrl)
  }

  // Only super_admin may access /admin/users
  if (pathname.startsWith("/admin/users") && role !== "super_admin") {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = "/admin"
    dashboardUrl.search = ""
    return NextResponse.redirect(dashboardUrl)
  }

  const routePermission = ADMIN_ROUTE_PERMISSIONS.find(({ prefix }) =>
    pathname.startsWith(prefix)
  )
  if (
    routePermission &&
    !hasAdminPermission(role, permissions, routePermission.permission)
  ) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = "/admin"
    dashboardUrl.search = ""
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
}
