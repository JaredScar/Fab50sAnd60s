"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { defaultSiteContent, mergeSiteContent, type SiteContentMap } from "@/lib/site-content-defaults"
import { Loader2, Save, CheckCircle, FileText, Plus, Trash2, AlertCircle, ExternalLink } from "lucide-react"

interface ContentItem {
  section: string
  key: string
  value: Record<string, unknown>
}

type SaveState = "idle" | "saving" | "saved"
type PathPart = string | number

const PAGE_GROUPS = [
  {
    id: "home",
    label: "Home Page",
    previewPath: "/",
    items: [
      ["homepage", "hero"],
      ["homepage", "about"],
      ["homepage", "events"],
      ["homepage", "gallery"],
      ["homepage", "membership"],
      ["homepage", "contact"],
    ],
  },
  {
    id: "about",
    label: "About Page",
    previewPath: "/about",
    items: [["aboutPage", "main"]],
  },
  {
    id: "membership",
    label: "Membership Page",
    previewPath: "/membership",
    items: [["membershipPage", "main"]],
  },
  {
    id: "contact",
    label: "Contact Page",
    previewPath: "/contact",
    items: [
      ["contactPage", "main"],
      ["global", "contact"],
    ],
  },
  {
    id: "gallery",
    label: "Gallery Page",
    previewPath: "/gallery",
    items: [
      ["galleryPage", "main"],
      ["homepage", "gallery"],
    ],
  },
  {
    id: "board",
    label: "Board Page",
    previewPath: "/board",
    items: [["boardPage", "main"]],
  },
  {
    id: "memoriam",
    label: "In Memoriam",
    previewPath: "/memoriam",
    items: [["memoriamPage", "main"]],
  },
  {
    id: "global",
    label: "Site Settings",
    previewPath: "/",
    items: [
      ["site", "seo"],
      ["global", "identity"],
      ["global", "contact"],
    ],
  },
] satisfies Array<{
  id: string
  label: string
  previewPath: string
  items: Array<[string, string]>
}>

export default function AdminContentPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<SiteContentMap>(defaultSiteContent)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activePageId, setActivePageId] = useState(PAGE_GROUPS[0].id)
  const [previewVersion, setPreviewVersion] = useState(0)
  const [pageSaveState, setPageSaveState] = useState<SaveState>("idle")
  const previewFrame = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    fetchContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (loading) return

    window.localStorage.setItem("fab-site-content-preview", JSON.stringify(drafts))
    previewFrame.current?.contentWindow?.postMessage(
      { type: "cms-preview-content", content: drafts },
      window.location.origin
    )
  }, [drafts, loading])

  async function fetchContent() {
    setLoading(true)
    const { data } = await supabase.from("site_content").select("*")

    const remote: SiteContentMap = {}
    if (data) {
      data.forEach((item: ContentItem) => {
        remote[item.section] ??= {}
        remote[item.section][item.key] = item.value
      })
    }

    setDrafts(mergeSiteContent(remote))
    setLoading(false)
  }

  function updateValue(section: string, key: string, path: PathPart[], value: unknown) {
    setDrafts((current) => {
      const next = cloneContent(current)
      const entry = next[section]?.[key]
      if (!entry) return current
      setNestedValue(entry, path, value)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const activePage = PAGE_GROUPS.find((page) => page.id === activePageId) ?? PAGE_GROUPS[0]
  const editableItems = activePage.items
    .map(([section, key]) => ({
      section,
      key,
      value: drafts[section]?.[key],
    }))
    .filter((item): item is { section: string; key: string; value: Record<string, unknown> } =>
      isPlainObject(item.value)
    )
  const previewUrl = previewSrc(activePage.previewPath, previewVersion)

  async function saveActivePage() {
    const rows = editableItems.map(({ section, key, value }) => ({
      section,
      key,
      value,
      updated_at: new Date().toISOString(),
    }))

    const invalid = rows.find((row) => !isPlainObject(row.value))
    if (invalid) {
      setErrors((current) => ({
        ...current,
        [contentId(invalid.section, invalid.key)]: "This content section is not valid.",
      }))
      return
    }

    setPageSaveState("saving")
    setErrors((current) => {
      const next = { ...current }
      rows.forEach((row) => {
        next[contentId(row.section, row.key)] = ""
      })
      return next
    })

    const { error } = await supabase
      .from("site_content")
      .upsert(rows, { onConflict: "section,key" })

    if (error) {
      setErrors((current) => ({
        ...current,
        [contentId(activePage.id, "save")]: error.message,
      }))
      setPageSaveState("idle")
      return
    }

    setPageSaveState("saved")
    setPreviewVersion((version) => version + 1)
    setTimeout(() => setPageSaveState("idle"), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">Site Content</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a page, edit the fields, and preview the live website beside your changes.
            Save once when you are ready to publish the page changes.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Pages</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {PAGE_GROUPS.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setActivePageId(page.id)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activePage.id === page.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{activePage.label}</h2>
              <p className="text-sm text-muted-foreground">
                Edit the content sections used on this page. The preview updates while you type.
              </p>
            </div>
            <div className="sticky top-4 z-10 rounded-xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Save all changes for {activePage.label}.
                </p>
                <SaveButton
                  state={pageSaveState}
                  onClick={saveActivePage}
                  label="Save Page Changes"
                />
              </div>
              {errors[contentId(activePage.id, "save")] && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" /> {errors[contentId(activePage.id, "save")]}
                </p>
              )}
            </div>

            {editableItems.map(({ section, key, value }) => {
                const stateKey = contentId(section, key)
                return (
                  <Section
                    key={stateKey}
                    title={sectionLabel(key)}
                    description={sectionDescription(section, key)}
                  >
                    <ObjectFields
                      value={value}
                      onChange={(path, nextValue) => updateValue(section, key, path, nextValue)}
                    />
                    {errors[stateKey] && (
                      <p className="flex items-center gap-1.5 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" /> {errors[stateKey]}
                      </p>
                    )}
                  </Section>
                )
              })}
          </div>
        </aside>

        <section className="sticky top-6 hidden h-[calc(100vh-3rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-sm xl:block">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Live Preview</h2>
              <p className="text-xs text-muted-foreground">{activePage.previewPath}</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href={activePage.previewPath} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                Open
              </a>
            </Button>
          </div>
          <iframe
            ref={previewFrame}
            key={previewUrl}
            title={`${activePage.label} preview`}
            src={previewUrl}
            className="h-full w-full bg-background"
          />
        </section>
      </div>
    </div>
  )
}

function ObjectFields({
  value,
  onChange,
  basePath = [],
}: {
  value: unknown
  onChange: (path: PathPart[], value: unknown) => void
  basePath?: PathPart[]
}) {
  if (!isPlainObject(value)) {
    return null
  }

  return (
    <div className="space-y-5">
      {Object.entries(value).map(([fieldKey, fieldValue]) => (
        <EditableField
          key={fieldKey}
          label={sectionLabel(fieldKey)}
          fieldKey={fieldKey}
          value={fieldValue}
          path={[...basePath, fieldKey]}
          onChange={onChange}
        />
      ))}
    </div>
  )
}

function EditableField({
  label,
  fieldKey,
  value,
  path,
  onChange,
}: {
  label: string
  fieldKey: string
  value: unknown
  path: PathPart[]
  onChange: (path: PathPart[], value: unknown) => void
}) {
  if (typeof value === "string") {
    return (
      <Field label={label}>
        {isLongTextField(fieldKey, value) ? (
          <textarea
            className={`${inputCls} min-h-28 resize-y leading-relaxed`}
            value={value}
            onChange={(event) => onChange(path, event.target.value)}
          />
        ) : (
          <input
            className={inputCls}
            value={value}
            onChange={(event) => onChange(path, event.target.value)}
          />
        )}
      </Field>
    )
  }

  if (typeof value === "number") {
    return (
      <Field label={label}>
        <input
          className={inputCls}
          type="number"
          value={value}
          onChange={(event) => onChange(path, Number(event.target.value))}
        />
      </Field>
    )
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(path, event.target.checked)}
        />
        {label}
      </label>
    )
  }

  if (Array.isArray(value)) {
    return (
      <ArrayField
        label={label}
        value={value}
        path={path}
        onChange={onChange}
      />
    )
  }

  if (isPlainObject(value)) {
    return (
      <div className="rounded-xl border border-border bg-background/40 p-4">
        <h4 className="mb-4 text-sm font-semibold text-foreground">{label}</h4>
        <ObjectFields value={value} onChange={onChange} basePath={path} />
      </div>
    )
  }

  return null
}

function ArrayField({
  label,
  value,
  path,
  onChange,
}: {
  label: string
  value: unknown[]
  path: PathPart[]
  onChange: (path: PathPart[], value: unknown) => void
}) {
  const isStringList = value.every((item) => typeof item === "string")
  const isObjectList = value.every((item) => isPlainObject(item))

  if (isStringList) {
    return (
      <Field label={`${label} (one per line)`}>
        <textarea
          className={`${inputCls} min-h-36 resize-y leading-relaxed`}
          value={(value as string[]).join("\n")}
          onChange={(event) =>
            onChange(
              path,
              event.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
            )
          }
        />
      </Field>
    )
  }

  if (isObjectList) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-medium text-foreground">{label}</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(path, [...value, blankArrayItem(value)])}
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>

        {value.map((item, index) => (
          <div key={index} className="rounded-xl border border-border bg-background/40 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h5 className="text-sm font-semibold text-foreground">
                {label} {index + 1}
              </h5>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
            <ObjectFields value={item} onChange={onChange} basePath={[...path, index]} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <Field label={label}>
      <textarea
        className={`${inputCls} min-h-36 resize-y leading-relaxed`}
        value={value.map(String).join("\n")}
        onChange={(event) =>
          onChange(
            path,
            event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          )
        }
      />
    </Field>
  )
}

function contentId(section: string, key: string) {
  return `${section}:${key}`
}

function previewSrc(path: string, version: number) {
  const [pathname, hash = ""] = path.split("#")
  const separator = pathname.includes("?") ? "&" : "?"
  return `${pathname}${separator}cmsPreview=1&cmsPreviewVersion=${version}${hash ? `#${hash}` : ""}`
}

function sectionLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_:]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function sectionDescription(section: string, key: string) {
  const labels: Record<string, string> = {
    "site:seo": "Browser title and search engine description.",
    "global:identity": "Club name, logo text, footer description, and site-wide labels.",
    "global:contact": "Email, Facebook, and meeting information reused across the site.",
    "homepage:hero": "The large first section on the home page.",
    "homepage:about": "The home page About section and feature cards.",
    "homepage:events": "The home page Events heading.",
    "homepage:gallery": "The home page Gallery heading.",
    "homepage:membership": "The home page Membership section.",
    "homepage:contact": "The home page Contact section.",
    "aboutPage:main": "Main copy for the About page.",
    "membershipPage:main": "Main copy for the Membership page.",
    "contactPage:main": "Main copy for the Contact page.",
    "galleryPage:main": "Main copy for the Gallery page.",
    "boardPage:main": "Main copy for the Board page.",
    "memoriamPage:main": "Main copy for the In Memoriam page.",
  }

  return labels[contentId(section, key)] ?? "Editable website text."
}

function isLongTextField(fieldKey: string, value: string) {
  return (
    value.length > 80 ||
    /description|paragraph|intro|note|quote|text|request/i.test(fieldKey)
  )
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function cloneContent(content: SiteContentMap): SiteContentMap {
  return JSON.parse(JSON.stringify(content)) as SiteContentMap
}

function setNestedValue(target: Record<string, unknown>, path: PathPart[], value: unknown) {
  let current: unknown = target

  path.forEach((part, index) => {
    if (index === path.length - 1) {
      if (Array.isArray(current) && typeof part === "number") {
        current[part] = value
      } else if (isPlainObject(current)) {
        current[part] = value
      }
      return
    }

    if (Array.isArray(current) && typeof part === "number") {
      current = current[part]
    } else if (isPlainObject(current)) {
      current = current[part]
    }
  })
}

function blankArrayItem(value: unknown[]) {
  const firstObject = value.find(isPlainObject)
  if (!firstObject) return {}

  return Object.fromEntries(
    Object.keys(firstObject).map((key) => [key, ""])
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

function SaveButton({
  state,
  onClick,
  label = "Save Changes",
}: {
  state: SaveState
  onClick: () => void
  label?: string
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button onClick={onClick} disabled={state === "saving"} size="sm">
        {state === "saving" ? (
          <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving…</>
        ) : (
          <><Save className="mr-2 h-3.5 w-3.5" /> {label}</>
        )}
      </Button>
      {state === "saved" && (
        <span className="flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" /> Saved!
        </span>
      )}
    </div>
  )
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
