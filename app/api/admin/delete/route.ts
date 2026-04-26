import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const MANIFEST    = path.join(process.cwd(), "data", "gallery.json")
const GALLERY_DIR = path.join(process.cwd(), "public", "images", "gallery")

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

export async function DELETE(request: NextRequest) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "No id provided" }, { status: 400 })

  let manifest: { id: string; filename: string }[] = []
  try { manifest = JSON.parse(await fs.readFile(MANIFEST, "utf-8")) } catch { /* empty */ }

  const entry = manifest.find((p) => p.id === id)
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Delete the file
  try {
    await fs.unlink(path.join(GALLERY_DIR, entry.filename))
  } catch {
    // File may already be missing — continue and clean manifest anyway
  }

  const updated = manifest.filter((p) => p.id !== id)
  await fs.writeFile(MANIFEST, JSON.stringify(updated, null, 2))

  return NextResponse.json({ success: true })
}
