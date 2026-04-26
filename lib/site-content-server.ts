import { createClient } from "@/lib/supabase/server"
import { mergeSiteContent, type SiteContentMap } from "@/lib/site-content-defaults"

export async function getSiteContent() {
  const supabase = await createClient()
  const { data } = await supabase.from("site_content").select("section,key,value")

  const content: SiteContentMap = {}
  for (const item of data ?? []) {
    content[item.section] ??= {}
    content[item.section][item.key] = item.value
  }

  return mergeSiteContent(content)
}
