import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Sparkles, Car } from "lucide-react"

const features = [
  {
    icon: Car,
    title: "All Cars Welcome",
    description: "From vintage classics to modern marvels, hot rods to imports - if you love your car, we want to see it.",
  },
  {
    icon: Users,
    title: "Family Friendly",
    description: "We're a welcoming community for enthusiasts of all ages. Bring the whole family to our events!",
  },
  {
    icon: Heart,
    title: "Community First",
    description: "Beyond cars, we're about friendships. Many members have been with us for decades.",
  },
  {
    icon: Sparkles,
    title: "Fun Events",
    description: "Car shows, cruises, picnics, holiday parties, and more. There's always something happening.",
  },
]

export function About() {
  return (
    <section id="about" className="bg-card py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            More Than Just a Car Club
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Founded over 35 years ago on Long Island, we've grown into a tight-knit community 
            united by our love of automobiles. While our name celebrates the golden era of the 
            50s and 60s, our garage doors are open to <strong className="text-foreground">every vehicle and every enthusiast</strong>.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className="group border-border/50 bg-background transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emphasis Box */}
        <div className="mt-16 rounded-2xl bg-primary/5 border border-primary/10 p-8 text-center sm:p-12">
          <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
            Don't Have a Classic Car?
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            No problem! Many of our members drive daily drivers to meetings and events. 
            What matters is your passion for cars, not what's in your garage. 
            <strong className="text-foreground"> Everyone is welcome.</strong>
          </p>
        </div>
      </div>
    </section>
  )
}
