import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Events } from "@/components/events"
import { Gallery } from "@/components/gallery"
import { Membership } from "@/components/membership"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Events />
        <Gallery />
        <Membership />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
