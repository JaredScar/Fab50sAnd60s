import type { SupabaseClient, User } from "@supabase/supabase-js"

export async function resolveAdminRoleForMiddleware(
  supabase: SupabaseClient,
  user: User
): Promise<string | null> {
  let role = user.app_metadata?.role as string | undefined
  if (role) return role

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  return (data?.role as string | undefined) ?? null
}
