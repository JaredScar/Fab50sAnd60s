import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

const MANIFEST    = path.join(process.cwd(), "data", "gallery.json")
const GALLERY_DIR = path.join(process.cwd(), "public", "images", "gallery")

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_BYTES     = 10 * 1024 * 1024 // 10 MB

function isAuthorised(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? ""
  const [type, credentials = ""] = auth.split(" ")
  if (type !== "Basic") return false
  try {
    const decoded   = Buffer.from(credentials, "base64").toString("utf-8")
    const colonIdx  = decoded.indexOf(":")
    const password  = colonIdx !== -1 ? decoded.slice(colonIdx + 1) : ""
    return Boolean(password && password === process.env.ADMIN_PASSWORD)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const formData = await request.formData()
  const file     = formData.get("file") as File | null
  const caption  = String(formData.get("caption") ?? "").trim()
  const category = String(formData.get("category") ?? "Club Photos").trim()

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  if (bytes.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 })
  }

  // Sanitise filename and make it unique
  const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const id       = randomUUID()
  const filename = `${id}.${ext}`
  const dest     = path.join(GALLERY_DIR, filename)

  await fs.mkdir(GALLERY_DIR, { recursive: true })
  await fs.writeFile(dest, Buffer.from(bytes))

  // Update manifest
  let manifest: GalleryItem[] = []
  try { manifest = JSON.parse(await fs.readFile(MANIFEST, "utf-8")) } catch { /* empty */ }

  const entry: GalleryItem = {
    id,
    filename,
    src: `/images/gallery/${filename}`,
    caption: caption || file.name.replace(/\.[^/.]+$/, ""),
    category,
    uploadedAt: new Date().toISOString(),
  }
  manifest.unshift(entry) // newest first
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2))

  return NextResponse.json(entry, { status: 201 })
}

interface GalleryItem {
  id: string
  filename: string
  src: string
  caption: string
  category: string
  uploadedAt: string
}
