import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Users, Shield } from "lucide-react"

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

const committees = [
  {
    name: "Car Show Committee",
    description:
      "Plans and executes all club-hosted and judged car shows. Handles staging, judging, trophies, and vendor coordination.",
  },
  {
    name: "Cruise Night Committee",
    description:
      "Organizes the weekly Wednesday cruise nights at SmithHaven Mall from May through October.",
  },
  {
    name: "Membership Committee",
    description:
      "Welcomes new members, processes applications, and ensures a positive experience for all club members.",
  },
  {
    name: "Charity & Community",
    description:
      "Coordinates the club's participation in charity car shows, fundraisers, and community events across Long Island.",
  },
]

export const revalidate = 60 // revalidate every minute

export default async function BoardPage() {
  const supabase = await createClient()
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
                  Board of Directors
                </h1>
                <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
                  Meet the dedicated volunteers who keep the Fabulous 50s & 60s Nostalgia
                  Car Club running. Our board is elected by the membership and serves the
                  entire club community.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">

          {/* Officers */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">Club Officers</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            {officers.length === 0 ? (
              <p className="text-muted-foreground">No board members listed yet.</p>
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
                <h3 className="font-semibold text-foreground">Contact a Board Member</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  You can reach any board member by phone using the contact information
                  above. For general club inquiries, please visit our{" "}
                  <a href="/contact" className="text-primary underline hover:no-underline">
                    Contact page
                  </a>{" "}
                  or attend a monthly meeting to speak with board members in person.
                </p>
              </div>
            </div>
          </div>

          {/* Committees */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">Club Committees</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {committees.map((committee, i) => (
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
            <h2 className="text-2xl font-bold text-foreground">Attend a Meeting</h2>
            <p className="mt-3 max-w-xl mx-auto text-muted-foreground leading-relaxed">
              The best way to meet the board is to come to a monthly meeting. Meetings are
              held the <strong className="text-foreground">second Thursday of every month</strong> at{" "}
              <strong className="text-foreground">
                Seaport Diner, 5045 Nesconset Hwy, Port Jefferson Station, NY
              </strong>{" "}
              starting at <strong className="text-foreground">7:00 PM</strong>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
