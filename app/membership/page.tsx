import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Check,
  MapPin,
  Clock,
  Phone,
  Download,
  Car,
  Heart,
  Users,
  Star,
} from "lucide-react"

const firstYearBenefits = [
  "Club logo shirt or hat (one per person)",
  "Club Roster with all member contacts",
  "Copy of Club By-Laws",
  "Full car show schedule for the year",
  "Access to all club events and cruise nights",
  "Weekly Wednesday cruise nights at SmithHaven Mall",
  "Eligibility for the Annual Picnic and Holiday Party*",
  "Drag plates, flags, and accessories available for purchase",
]

const memberExpectations = [
  "Get donations for show raffles",
  "Sell raffle and 50/50 tickets at events",
  "Park and stage cars at shows",
  "Judge cars at our shows",
  "Participate in car shows",
  "Hand out and promote show flyers",
  "Help with setup and cleanup at car shows",
  "Promote events in your community",
]

const faqs = [
  {
    q: "Do I need a classic car to join?",
    a: "Absolutely not! We welcome all makes, models, and years — classics, hot rods, muscle cars, customs, trucks, and modern vehicles. If you love cars, you belong here.",
  },
  {
    q: "What is the probationary period?",
    a: "New members are on probation for 6 months. After 1 year of membership in good standing, you are eligible to run for a board office.",
  },
  {
    q: "When are dues due?",
    a: "Annual renewal dues are due on March 31st each year. Members with outstanding balances are given until April 30th to pay. After May 1st, the Board may drop a member for non-payment.",
  },
  {
    q: "Is the club open to everyone?",
    a: "Yes. We are a co-ed club and no prospect is refused because of race, color, creed, sex, or sexual orientation.",
  },
  {
    q: "How do I qualify for the Annual Picnic and Holiday Party?",
    a: "Members who have participated in at least 2 of our judging car shows per year attend the Annual Picnic and Holiday Party at no charge. Others are welcome to attend for a fee.",
  },
  {
    q: "Can the club help us run a charity car show?",
    a: "Absolutely! We are available to help charities, churches, and schools host fundraiser car shows. We can advertise, set up, stage and judge cars, and even supply a DJ.",
  },
]

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20">
        {/* Page Header */}
        <div className="bg-card border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                <Car className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Join the Club
                </h1>
                <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
                  We are delighted you are considering joining the Fabulous 50's & 60's
                  Nostalgia Car Club. On behalf of the Board of Directors — Welcome!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">

          {/* Welcome message */}
          <section className="rounded-2xl bg-primary/5 border border-primary/15 p-8">
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold text-foreground">About Our Club</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                The Fabulous 50's and 60's Nostalgia Car Club, Inc. is dedicated to promoting
                friendship and camaraderie for all persons who appreciate classic, antique,
                customized, and special-interest vehicles.{" "}
                <strong className="text-foreground">
                  We do not just accept 50's and 60's vehicles — all makes and models are
                  welcome.
                </strong>
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We are a not-for-profit corporation and support many community and national
                charities, as well as other Long Island car clubs. We travel as a group
                throughout Long Island to display our vehicles and help raise money for good
                causes. We do peer judging, as found in most car shows, and our members have
                years of experience building, restoring, and maintaining classic vehicles.
              </p>
            </div>
          </section>

          {/* Pricing */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">Membership Dues</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {/* First Year - Individual */}
              <Card className="border-primary/20 ring-2 ring-primary/10 relative overflow-hidden">
                <div className="h-1.5 w-full bg-primary" />
                <CardHeader className="pb-3">
                  <Badge className="mb-2 w-fit border-primary/20 bg-primary/10 text-primary" variant="outline">
                    First Year
                  </Badge>
                  <CardTitle className="text-foreground">Individual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary">$50</span>
                    <span className="text-muted-foreground"> / first year</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Includes a club logo shirt or hat.
                  </p>
                  <div className="mt-4 text-sm font-medium text-muted-foreground">
                    Renews at <span className="text-foreground font-semibold">$30/year</span> thereafter
                  </div>
                </CardContent>
              </Card>

              {/* First Year - Couple */}
              <Card className="border-accent/20 ring-2 ring-accent/10 relative overflow-hidden">
                <div className="h-1.5 w-full bg-accent" />
                <CardHeader className="pb-3">
                  <Badge className="mb-2 w-fit border-accent/20 bg-accent/10 text-accent" variant="outline">
                    First Year
                  </Badge>
                  <CardTitle className="text-foreground">Couple</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-accent">$100</span>
                    <span className="text-muted-foreground"> / first year</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Includes a club logo shirt or hat for each person.
                  </p>
                  <div className="mt-4 text-sm font-medium text-muted-foreground">
                    Renews at <span className="text-foreground font-semibold">$50/year</span> thereafter
                  </div>
                </CardContent>
              </Card>

              {/* Renewal */}
              <Card className="border-border relative overflow-hidden">
                <div className="h-1.5 w-full bg-muted-foreground/30" />
                <CardHeader className="pb-3">
                  <Badge className="mb-2 w-fit" variant="outline">
                    Annual Renewal
                  </Badge>
                  <CardTitle className="text-foreground">Returning Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-foreground">$30</span>
                    <span className="text-muted-foreground"> individual</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-foreground">$50</span>
                    <span className="text-muted-foreground"> couple</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Due on <strong className="text-foreground">March 31st</strong> each year.
                  </p>
                </CardContent>
              </Card>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              * Dues amounts can be changed by a membership vote.
            </p>
          </section>

          {/* Benefits + Expectations side by side */}
          <section className="grid gap-8 lg:grid-cols-2">
            {/* What you get */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">What You Get</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Card>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {firstYearBenefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0 rounded-full bg-primary/10 p-1">
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
                    * Members who participate in at least 2 judging car shows per year attend the Annual Picnic and Holiday Party at no charge.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* What we expect */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">Member Participation</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    We are a hands-on club. Because we are a not-for-profit, we support
                    ourselves by running car shows. Member participation keeps our club thriving.
                  </p>
                  <ul className="space-y-3">
                    {memberExpectations.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0 rounded-full bg-accent/10 p-1">
                          <Star className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-3">
                    Members are urged to attend at least half of the monthly meetings and as
                    many club functions as possible.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* How to Apply */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">How to Apply</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mb-2 text-3xl font-bold text-primary">1</div>
                  <h3 className="font-semibold text-foreground">Download the Form</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Download and print the membership application form below.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                    <a
                      href="https://fab5060carclub.com/wp-content/uploads/2024/01/club-application-form-pdf.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Form (PDF)
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mb-2 text-3xl font-bold text-primary">2</div>
                  <h3 className="font-semibold text-foreground">Fill It Out</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Complete the form with your information and vehicle details.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mb-2 text-3xl font-bold text-primary">3</div>
                  <h3 className="font-semibold text-foreground">Submit & Pay</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Hand in at a club event, or mail with payment to:
                  </p>
                  <address className="mt-3 not-italic text-sm text-foreground font-medium leading-relaxed">
                    The Fabulous 50's and 60's<br />
                    Nostalgia Car Club<br />
                    101 Shinnecock Avenue<br />
                    Mastic, NY 11950
                  </address>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Meeting info */}
          <section className="rounded-2xl bg-card border border-border p-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className="text-xl font-bold text-foreground">Monthly Meetings</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Come to a meeting and meet us in person! The best way to learn about the
                  club is to show up and say hello. New faces are always welcome.
                </p>
                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Second Thursday of every month</p>
                      <p className="text-sm text-muted-foreground">Starting at 7:00 PM (some arrive early for dinner)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Seaport Diner</p>
                      <p className="text-sm text-muted-foreground">5045 Nesconset Hwy, Port Jefferson Station, NY</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Questions?</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Our club secretary is happy to help answer any questions about membership.
                </p>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary shrink-0" />
                    <p className="font-medium text-foreground">Cathleen T. Somma, Club Secretary</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary shrink-0" />
                    <a
                      href="tel:6319262554"
                      className="text-primary hover:underline font-medium"
                    >
                      (631) 926-2554
                    </a>
                  </div>
                </div>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/contact">Send Us a Message</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {faqs.map((faq, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground">{faq.q}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
