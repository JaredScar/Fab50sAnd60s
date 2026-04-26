import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  // Fetch from Supabase
  const supabase = await createClient()
  const { data: dbItems } = await supabase
    .from("gallery_items")
    .select("*")
    .order("created_at", { ascending: false })

  // Merge with any legacy filesystem items (data/gallery.json)
  let fileItems: unknown[] = []
  try {
    const manifest = path.join(process.cwd(), "data", "gallery.json")
    const raw = await fs.readFile(manifest, "utf-8")
    fileItems = JSON.parse(raw)
  } catch {
    // No legacy file — that's fine
  }

  // Deduplicate by id; Supabase items take priority
  const supabaseIds = new Set((dbItems ?? []).map((i: { id: string }) => i.id))
  const legacyOnly = (fileItems as Array<{ id: string }>).filter(
    (i) => !supabaseIds.has(i.id)
  )

  return NextResponse.json([...(dbItems ?? []), ...legacyOnly])
}
