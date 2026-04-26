/**
 * Import data/gallery.json into Supabase gallery_items.
 *
 * Usage:
 *   npm run import:legacy-gallery
 *
 * The script upserts by id, so it is safe to run more than once. If the
 * referenced image exists under public/images/gallery, it is uploaded to the
 * public media bucket and the database row points at that Supabase Storage URL.
 * If the file is not present locally, the row keeps its existing public src.
 */

import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const MANIFEST_PATH = path.join(ROOT, "data", "gallery.json")
const ENV_PATH = path.join(ROOT, ".env.local")
const PUBLIC_DIR = path.join(ROOT, "public")
const BUCKET = "media"

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const raw = fs.readFileSync(filePath, "utf-8")
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const equalsIndex = trimmed.indexOf("=")
    if (equalsIndex === -1) continue

    const key = trimmed.slice(0, equalsIndex).trim()
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, "")
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

function contentTypeFor(filename) {
  const ext = path.extname(filename).toLowerCase()
  if (ext === ".png") return "image/png"
  if (ext === ".webp") return "image/webp"
  if (ext === ".gif") return "image/gif"
  return "image/jpeg"
}

function localFilePathFor(src) {
  if (!src.startsWith("/")) return null
  return path.join(PUBLIC_DIR, src)
}

function toRow(item, src, storagePath) {
  return {
    id: item.id,
    src,
    caption: item.caption ?? "",
    category: item.category ?? "Club Events",
    storage_path: storagePath,
    created_at: item.uploadedAt ?? new Date().toISOString(),
  }
}

loadEnvFile(ENV_PATH)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")
  console.error("Add them to .env.local, then run npm run import:legacy-gallery again.")
  process.exit(1)
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"))
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

let uploaded = 0
let inserted = 0
let keptExistingSrc = 0
let failed = 0

for (const item of manifest) {
  let src = item.src
  let storagePath = null
  const localPath = localFilePathFor(item.src)

  try {
    if (localPath && fs.existsSync(localPath)) {
      storagePath = `gallery/${item.filename ?? path.basename(localPath)}`
      const bytes = fs.readFileSync(localPath)

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, bytes, {
          contentType: contentTypeFor(localPath),
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
      src = data.publicUrl
      uploaded++
    } else {
      keptExistingSrc++
    }

    const { error: upsertError } = await supabase
      .from("gallery_items")
      .upsert(toRow(item, src, storagePath), { onConflict: "id" })

    if (upsertError) throw upsertError
    inserted++
    console.log(`Imported ${item.id}`)
  } catch (error) {
    failed++
    console.error(`Failed ${item.id}: ${error.message}`)
  }
}

console.log("\nLegacy gallery import complete")
console.log(`Rows upserted       : ${inserted}`)
console.log(`Files uploaded      : ${uploaded}`)
console.log(`Kept existing src   : ${keptExistingSrc}`)
console.log(`Failures            : ${failed}`)

process.exit(failed > 0 ? 1 : 0)
