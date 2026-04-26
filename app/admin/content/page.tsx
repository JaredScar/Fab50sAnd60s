"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { defaultSiteContent, mergeSiteContent, type SiteContentMap } from "@/lib/site-content-defaults"
import { Loader2, Save, CheckCircle, FileText, Plus, Trash2, AlertCircle } from "lucide-react"

interface ContentItem {
  section: string
  key: string
  value: Record<string, unknown>
}

type SaveState = "idle" | "saving" | "saved"
type PathPart = string | number

export default function AdminContentPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({})
  const [drafts, setDrafts] = useState<SiteContentMap>(defaultSiteContent)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  async function save(section: string, key: string) {
    const stateKey = `${section}:${key}`
    const value = drafts[section]?.[key]

    if (!isPlainObject(value)) {
      setErrors((current) => ({ ...current, [stateKey]: "This content section is not valid." }))
      return
    }

    setErrors((current) => ({ ...current, [stateKey]: "" }))
    setSaveState((s) => ({ ...s, [stateKey]: "saving" }))
    const { error } = await supabase
      .from("site_content")
      .upsert({ section, key, value, updated_at: new Date().toISOString() }, { onConflict: "section,key" })

    if (error) {
      setErrors((current) => ({ ...current, [stateKey]: error.message }))
      setSaveState((s) => ({ ...s, [stateKey]: "idle" }))
      return
    }

    setSaveState((s) => ({ ...s, [stateKey]: "saved" }))
    setTimeout(() => setSaveState((s) => ({ ...s, [stateKey]: "idle" })), 3000)
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">Site Content</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit the public website text using simple fields. Lists can be edited one item at a time.
            Events, gallery photos, board members, and memorial entries still have their own Admin pages.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 space-y-10">
        {Object.entries(drafts).map(([section, entries]) => (
          <div key={section} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold capitalize text-foreground">{sectionLabel(section)}</h2>
              <p className="text-sm text-muted-foreground">
                These fields update the matching public site sections.
              </p>
            </div>

            {Object.entries(entries).map(([key, value]) => {
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
                  <SaveButton
                    state={saveState[stateKey] ?? "idle"}
                    onClick={() => save(section, key)}
                  />
                </Section>
              )
            })}
          </div>
        ))}
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

function SaveButton({ state, onClick }: { state: SaveState; onClick: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button onClick={onClick} disabled={state === "saving"} size="sm">
        {state === "saving" ? (
          <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving…</>
        ) : (
          <><Save className="mr-2 h-3.5 w-3.5" /> Save Changes</>
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
