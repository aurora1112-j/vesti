import { Lock, Search, TimerReset, WandSparkles } from "lucide-react"

const features = [
  {
    icon: TimerReset,
    title: "Auto-capture",
    description: "Save finished conversations without exporting anything.",
  },
  {
    icon: Search,
    title: "Fast search",
    description: "Find past prompts, notes, and decisions in seconds.",
  },
  {
    icon: Lock,
    title: "Local-first",
    description: "Keep your conversation history on your own machine.",
  },
  {
    icon: WandSparkles,
    title: "Clear recall",
    description: "Reopen the exact thread instead of starting over.",
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-24 px-6 py-12 md:px-8 md:py-14"
    >
      <div className="page-shell">
        <div className="mx-auto mb-8 max-w-[620px] text-center">
          <p className="section-kicker">Features</p>
          <h2 className="mt-4 text-balance text-[clamp(2.1rem,4.5vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.06em] text-text-primary">
            Short on ceremony, strong on recall.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <article key={feature.title} className="lovable-card p-6">
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border-subtle bg-[rgba(252,251,248,0.92)]">
                  <Icon className="h-4 w-4 text-text-primary" />
                </div>
                <h3 className="text-[1.15rem] font-medium leading-7 tracking-[-0.03em] text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {feature.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
