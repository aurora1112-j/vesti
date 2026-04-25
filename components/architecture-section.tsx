import { LockKeyhole, ScanSearch, Sparkles } from "lucide-react"

const pillars = [
  {
    icon: LockKeyhole,
    overline: "On-device by default",
    title: "Your conversation history stays attached to your machine.",
    description:
      "Vesti writes to the browser's local storage layer, not to a hosted account. That keeps the product trustworthy and the interaction fast.",
  },
  {
    icon: ScanSearch,
    overline: "Retrieval before reinvention",
    title: "Search, jump back in, and re-enter the original thread.",
    description:
      "The goal is not another note-taking silo. It is instant recall across the tools you already use, with enough context to continue thinking.",
  },
  {
    icon: Sparkles,
    overline: "Useful structure",
    title: "Captured work becomes something you can browse and reuse.",
    description:
      "Threads become a timeline, queries become filters, and patterns become assets instead of disappearing into closed tabs and browser history.",
  },
]

const meterHeights = [34, 46, 52, 60, 68, 77, 92, 108]

export function ArchitectureSection() {
  return (
    <section id="architecture" className="px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1220px] overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#0d1017] text-white shadow-[0_45px_120px_rgba(7,10,18,0.38)]">
        <div className="dark-grid relative overflow-hidden px-6 py-8 md:px-10 md:py-10">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(88,127,255,0.2),transparent_48%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="max-w-[460px]">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/48">
                Architecture / privacy
              </p>
              <h2 className="mt-4 text-[clamp(2.4rem,4vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.06em] text-[hsl(var(--text-inverse))]">
                A memory product should feel private, legible, and hard to lose.
              </h2>
              <p className="mt-6 max-w-[42ch] text-base leading-7 text-white/70">
                This is the section where Vesti should feel different from a
                generic AI wrapper. The product story is storage discipline,
                retrieval quality, and ownership over your thinking trail.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">
                    Cloud sync
                  </p>
                  <p className="mt-3 text-2xl font-medium text-white">Off</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">
                    Search time
                  </p>
                  <p className="mt-3 text-2xl font-medium text-white">
                    Instant
                  </p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">
                    Export
                  </p>
                  <p className="mt-3 text-2xl font-medium text-white">
                    Anytime
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon

                return (
                  <div
                    key={pillar.overline}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
                  >
                    <div className="inline-flex rounded-full bg-white/10 p-2.5 text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/42">
                      {pillar.overline}
                    </p>
                    <h3 className="mt-3 text-xl font-medium leading-[1.15] tracking-[-0.03em] text-white">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-white/66">
                      {pillar.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-8 border-t border-white/10 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">
              Why this matters
            </p>
            <p className="mt-4 max-w-[58ch] text-base leading-8 text-white/72">
              Most AI tools optimize for the next answer. Vesti should optimize
              for the accumulated trail of work: drafts, dead ends, better
              prompts, recovered ideas, and everything worth finding again.
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">
                Memory intensity
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">
                Weekly retrieval
              </p>
            </div>
            <div className="flex h-32 items-end gap-3">
              {meterHeights.map((height, index) => (
                <div key={height} className="flex flex-1 flex-col justify-end">
                  <div
                    className="rounded-t-full bg-gradient-to-t from-[#4f7cff] via-[#88a6ff] to-[#dfe7ff]"
                    style={{ height }}
                  />
                  <div
                    className={`mt-2 h-1 rounded-full ${
                      index >= meterHeights.length - 2
                        ? "bg-[#ff9f5b]"
                        : "bg-white/12"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
