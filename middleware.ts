import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

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

  const role = user.app_metadata?.role as string | undefined

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

  return supabaseResponse
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
}
