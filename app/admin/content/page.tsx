"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Save, CheckCircle, FileText } from "lucide-react"

interface ContentItem {
  section: string
  key: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Record<string, any>
}

type SaveState = "idle" | "saving" | "saved"

export default function AdminContentPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({})

  // Local form state for each section+key
  const [hero, setHero] = useState({ title: "", subtitle: "", description: "" })
  const [about, setAbout] = useState({ title: "", description: "" })
  const [membership, setMembership] = useState({
    title: "",
    dues: "",
    description: "",
    benefits: "",
  })

  useEffect(() => {
    fetchContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchContent() {
    setLoading(true)
    const { data } = await supabase.from("site_content").select("*")
    if (data) {
      data.forEach((item: ContentItem) => {
        if (item.section === "homepage" && item.key === "hero") {
          setHero({
            title: item.value.title ?? "",
            subtitle: item.value.subtitle ?? "",
            description: item.value.description ?? "",
          })
        }
        if (item.section === "homepage" && item.key === "about") {
          setAbout({
            title: item.value.title ?? "",
            description: item.value.description ?? "",
          })
        }
        if (item.section === "membership" && item.key === "info") {
          setMembership({
            title: item.value.title ?? "",
            dues: item.value.dues ?? "",
            description: item.value.description ?? "",
            benefits: Array.isArray(item.value.benefits)
              ? item.value.benefits.join("\n")
              : "",
          })
        }
      })
    }
    setLoading(false)
  }

  async function save(section: string, key: string, value: Record<string, unknown>) {
    const stateKey = `${section}:${key}`
    setSaveState((s) => ({ ...s, [stateKey]: "saving" }))
    await supabase
      .from("site_content")
      .upsert({ section, key, value, updated_at: new Date().toISOString() }, { onConflict: "section,key" })
    setSaveState((s) => ({ ...s, [stateKey]: "saved" }))
    setTimeout(() => setSaveState((s) => ({ ...s, [stateKey]: "idle" })), 3000)
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
            Edit the text displayed on the public website.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 space-y-10">

        {/* Homepage Hero */}
        <Section title="Homepage Hero" description="The large banner text shown at the top of the home page.">
          <Field label="Title">
            <input className={inputCls} value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
          </Field>
          <Field label="Subtitle">
            <input className={inputCls} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea className={`${inputCls} h-24 resize-none`} value={hero.description} onChange={(e) => setHero({ ...hero, description: e.target.value })} />
          </Field>
          <SaveButton
            state={saveState["homepage:hero"] ?? "idle"}
            onClick={() => save("homepage", "hero", { title: hero.title, subtitle: hero.subtitle, description: hero.description })}
          />
        </Section>

        {/* Homepage About */}
        <Section title="About Section" description="The 'About Our Club' section on the home page.">
          <Field label="Title">
            <input className={inputCls} value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea className={`${inputCls} h-32 resize-none`} value={about.description} onChange={(e) => setAbout({ ...about, description: e.target.value })} />
          </Field>
          <SaveButton
            state={saveState["homepage:about"] ?? "idle"}
            onClick={() => save("homepage", "about", { title: about.title, description: about.description })}
          />
        </Section>

        {/* Membership */}
        <Section title="Membership Info" description="Displayed on the Membership page and the home page membership section.">
          <Field label="Section Title">
            <input className={inputCls} value={membership.title} onChange={(e) => setMembership({ ...membership, title: e.target.value })} />
          </Field>
          <Field label="Annual Dues">
            <input className={inputCls} value={membership.dues} onChange={(e) => setMembership({ ...membership, dues: e.target.value })} placeholder="$35 per year" />
          </Field>
          <Field label="Description">
            <textarea className={`${inputCls} h-24 resize-none`} value={membership.description} onChange={(e) => setMembership({ ...membership, description: e.target.value })} />
          </Field>
          <Field label="Benefits (one per line)">
            <textarea
              className={`${inputCls} h-28 resize-none`}
              value={membership.benefits}
              onChange={(e) => setMembership({ ...membership, benefits: e.target.value })}
              placeholder={"Access to all club events\nMonthly meetings\nClub newsletter"}
            />
          </Field>
          <SaveButton
            state={saveState["membership:info"] ?? "idle"}
            onClick={() =>
              save("membership", "info", {
                title: membership.title,
                dues: membership.dues,
                description: membership.description,
                benefits: membership.benefits.split("\n").map((l) => l.trim()).filter(Boolean),
              })
            }
          />
        </Section>
      </div>
    </div>
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
