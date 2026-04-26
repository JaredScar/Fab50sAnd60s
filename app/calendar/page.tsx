import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CalendarClient } from "./calendar-client"

export const revalidate = 60

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        <CalendarClient events={data ?? []} />
      </main>
      <Footer />
    </div>
  )
}
