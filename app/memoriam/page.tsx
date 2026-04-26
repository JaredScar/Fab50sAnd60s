import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Heart } from "lucide-react"
import { getSiteContent } from "@/lib/site-content-server"

interface MemoriamEntry {
  id: string
  name: string
  passed_on: string
  tribute: string | null
  photo_url: string | null
}

interface MemoriamPageContent {
  title: string
  description: string
  quote: string
  emptyText: string
  tributeRequest: string
}

export const revalidate = 60

export default async function InMemoriamPage() {
  const supabase = await createClient()
  const content = await getSiteContent()
  const page = content.memoriamPage.main as unknown as MemoriamPageContent
  const { data } = await supabase
    .from("memoriam_entries")
    .select("*")
    .order("created_at", { ascending: false })

  const members: MemoriamEntry[] = data ?? []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20">
        {/* Page Header */}
        <div className="bg-card border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-muted p-3 shrink-0">
                <Heart className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {page.title}
                </h1>
                <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
                  {page.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <blockquote className="mb-14 border-l-4 border-muted-foreground/30 pl-6 text-muted-foreground italic">
            &ldquo;{page.quote}&rdquo;
          </blockquote>

          {members.length === 0 ? (
            <p className="text-center text-muted-foreground">{page.emptyText}</p>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
                >
                  <div className="mb-6 h-40 w-40 overflow-hidden rounded-full border-4 border-muted bg-muted shadow-inner">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={`${member.name} — In Memoriam`}
                        width={160}
                        height={160}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Heart className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-foreground">{member.name}</h2>
                  <p className="mt-1 text-sm font-medium text-muted-foreground tracking-wide uppercase">
                    Passed away {member.passed_on}
                  </p>

                  <div className="my-5 flex items-center gap-3 w-full">
                    <div className="h-px flex-1 bg-border" />
                    <Heart className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {member.tribute && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {member.tribute}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-8 text-center">
            <Heart className="mx-auto mb-4 h-8 w-8 text-muted-foreground/50" />
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {page.tributeRequest}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
