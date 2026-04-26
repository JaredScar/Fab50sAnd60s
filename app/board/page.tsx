import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Users, Shield } from "lucide-react"
import { getSiteContent } from "@/lib/site-content-server"

interface BoardMember {
  id: string
  name: string
  title: string
  member_role: string
  bio: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  sort_order: number
}

interface BoardPageContent {
  title: string
  description: string
  officersTitle: string
  emptyOfficersText: string
  contactTitle: string
  contactDescription: string
  committeesTitle: string
  committees: Array<{ name: string; description: string }>
  meetingTitle: string
  meetingDescription: string
}

export const revalidate = 60 // revalidate every minute

export default async function BoardPage() {
  const supabase = await createClient()
  const content = await getSiteContent()
  const page = content.boardPage.main as unknown as BoardPageContent
  const { data } = await supabase
    .from("board_members")
    .select("*")
    .order("sort_order", { ascending: true })

  const boardMembers: BoardMember[] = data ?? []
  const officers = boardMembers.filter((m) => m.member_role === "officer")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20">
        {/* Page Header */}
        <div className="bg-card border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                <Shield className="h-7 w-7 text-primary" />
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

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">

          {/* Officers */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">{page.officersTitle}</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            {officers.length === 0 ? (
              <p className="text-muted-foreground">{page.emptyOfficersText}</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {officers.map((member) => (
                  <Card
                    key={member.id}
                    className="overflow-hidden border-border hover:shadow-md transition-shadow"
                  >
                    <div className="h-1.5 w-full bg-primary" />
                    <CardContent className="p-6">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 overflow-hidden">
                        {member.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.photo_url}
                            alt={`${member.name} portrait`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Users className="h-9 w-9 text-primary/60" />
                        )}
                      </div>
                      <div className="text-center">
                        <Badge
                          variant="outline"
                          className="mb-2 border-primary/20 bg-primary/5 text-primary text-xs"
                        >
                          {member.title}
                        </Badge>
                        <h3 className="mt-1 text-lg font-bold text-foreground leading-tight">
                          {member.name}
                        </h3>
                        {member.bio && (
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            {member.bio}
                          </p>
                        )}
                        {(member.phone || member.email) && (
                          <div className="mt-4 space-y-1.5">
                            {member.phone && (
                              <a
                                href={`tel:${member.phone.replace(/\D/g, "")}`}
                                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                              >
                                <Phone className="h-3.5 w-3.5" />
                                {member.phone}
                              </a>
                            )}
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                {member.email}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-lg bg-accent/10 p-2">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{page.contactTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {page.contactDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Committees */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">{page.committeesTitle}</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {page.committees.map((committee, i) => (
                <Card key={i} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground">{committee.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {committee.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-primary/5 border border-primary/15 p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">{page.meetingTitle}</h2>
            <p className="mt-3 max-w-xl mx-auto text-muted-foreground leading-relaxed">
              {page.meetingDescription}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
