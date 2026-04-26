/**
 * Import photos from fb_content.json into the site gallery.
 * Run once from the project root:  node scripts/import-fb-photos.mjs
 */

import fs   from "fs"
import path from "path"
import https from "https"
import http  from "http"
import { randomUUID } from "crypto"
import { fileURLToPath } from "url"

const __dirname     = path.dirname(fileURLToPath(import.meta.url))
const ROOT          = path.join(__dirname, "..")
const FB_JSON       = path.join(ROOT, "fb_content.json")
const GALLERY_DIR   = path.join(ROOT, "public", "images", "gallery")
const MANIFEST_PATH = path.join(ROOT, "data", "gallery.json")

// ── helpers ──────────────────────────────────────────────────────────────────

function getImageUrl(att) {
  // Prefer image.uri (full-size), then photo_image.uri (may be cropped)
  return att.image?.uri ?? att.photo_image?.uri ?? null
}

function buildCaption(post) {
  const raw = (post.text ?? "").trim()
  if (raw.length > 3 && !raw.toLowerCase().startsWith("may be")) {
    return raw.length > 140 ? raw.slice(0, 137) + "…" : raw
  }
  return `Photo shared by ${post.user?.name ?? "a club member"}`
}

function guessCategory(post) {
  const t = ((post.text ?? "") + " " + (post.user?.name ?? "")).toLowerCase()
  if (/car show|trophy|judg|dust off|rock.n.roll|stony brook|paws/.test(t)) return "Car Shows"
  if (/cruise|cruising|cruise night|wednesday/.test(t))                      return "Cruise Nights"
  if (/meeting|board|holiday|party|picnic|bbq/.test(t))                     return "Club Events"
  return "Club Photos"
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http
    const file  = fs.createWriteStream(dest)

    proto.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      // follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.destroy()
        try { fs.unlinkSync(dest) } catch {}
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.destroy()
        try { fs.unlinkSync(dest) } catch {}
        return reject(new Error(`HTTP ${res.statusCode}`))
      }
      res.pipe(file)
      file.on("finish", () => { file.close(); resolve() })
    }).on("error", (err) => {
      file.destroy()
      try { fs.unlinkSync(dest) } catch {}
      reject(err)
    })
  })
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ── main ─────────────────────────────────────────────────────────────────────

const posts = JSON.parse(fs.readFileSync(FB_JSON, "utf-8"))

let manifest = []
try { manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) } catch {}

// Track IDs already in manifest so we never duplicate
const seenFbIds = new Set(manifest.map(p => p.fbPhotoId).filter(Boolean))
// Also track src to catch any previously downloaded duplicates
const seenSrcs  = new Set(manifest.map(p => p.src))

fs.mkdirSync(GALLERY_DIR, { recursive: true })

let added = 0, skipped = 0, failed = 0, total = 0

for (const post of posts) {
  if (!Array.isArray(post.attachments)) continue

  for (const att of post.attachments) {
    // Only process Photo attachments
    if (att.__typename !== "Photo") continue

    const photoId = att.id ?? att.photo_id
    const url     = getImageUrl(att)

    // Skip if we've already imported this photo id
    if (photoId && seenFbIds.has(String(photoId))) { skipped++; continue }
    if (!url) { skipped++; continue }

    total++
    const ext      = /\.png(\?|$)/i.test(url) ? "png" : "jpg"
    const id       = randomUUID()
    const filename = `fb-${id}.${ext}`
    const dest     = path.join(GALLERY_DIR, filename)
    const src      = `/images/gallery/${filename}`

    process.stdout.write(`[${total}] Downloading fb photo ${photoId ?? "?"} … `)

    try {
      await download(url, dest)

      // Verify the file has some content (not an error page)
      const size = fs.statSync(dest).size
      if (size < 2000) {
        fs.unlinkSync(dest)
        console.log(`SKIP (too small: ${size}B — URL likely expired)`)
        failed++
        continue
      }

      const entry = {
        id,
        filename,
        src,
        caption:    buildCaption(post),
        category:   guessCategory(post),
        fbPhotoId:  photoId ? String(photoId) : undefined,
        uploadedAt: new Date().toISOString(),
      }

      // Prepend so newest FB posts appear first
      manifest.unshift(entry)
      if (photoId) seenFbIds.add(String(photoId))
      seenSrcs.add(src)
      added++

      // Flush manifest after each photo so progress is saved
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))

      console.log(`OK (${(size / 1024).toFixed(0)} KB)`)
    } catch (err) {
      try { fs.unlinkSync(dest) } catch {}
      console.log(`FAIL — ${err.message}`)
      failed++
    }

    // Small pause so we don't hammer the CDN
    await sleep(150)
  }
}

console.log(`\n──────────────────────────────────────────`)
console.log(`  Photos added   : ${added}`)
console.log(`  Already existed: ${skipped}`)
console.log(`  Failed / expired: ${failed}`)
console.log(`  Gallery total  : ${manifest.length}`)
console.log(`──────────────────────────────────────────`)
