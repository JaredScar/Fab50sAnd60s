import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import {
  ADMIN_ROUTE_PERMISSIONS,
  defaultPermissionsForRole,
  hasAdminPermission,
  normalizeAdminPermissions,
} from "@/lib/admin-permissions"
import { resolveAdminRoleForMiddleware } from "@/lib/admin-middleware"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes; skip the login page and auth callback
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/auth")) {
    return NextResponse.next()
  }
  if (pathname === "/admin/login" || pathname === "/auth/callback") {
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

  let role = await resolveAdminRoleForMiddleware(supabase, user)
  let permissions = user.app_metadata?.admin_permissions

  if (role && !user.app_metadata?.role) {
    permissions = normalizeAdminPermissions(permissions) ?? defaultPermissionsForRole(role)
  }

  if (!role) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/admin/login"
    loginUrl.searchParams.set("error", "unauthorized")
    return NextResponse.redirect(loginUrl)
  }

  const { data: aalData, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const needsMfaStep =
    !aalError &&
    aalData?.currentLevel === "aal1" &&
    aalData?.nextLevel === "aal2"

  if (pathname === "/auth/mfa") {
    if (!needsMfaStep) {
      const adminUrl = request.nextUrl.clone()
      adminUrl.pathname = "/admin"
      adminUrl.search = ""
      return NextResponse.redirect(adminUrl)
    }
    return supabaseResponse
  }

  if (needsMfaStep) {
    const mfaUrl = request.nextUrl.clone()
    mfaUrl.pathname = "/auth/mfa"
    mfaUrl.search = ""
    return NextResponse.redirect(mfaUrl)
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
