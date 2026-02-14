const features = [
  {
    overline: "CAPTURE",
    title: "It records so you don\u2019t have to.",
    description:
      "Vesti watches for new messages on your chatbot (ChatGPT, Claude, Gemini, and DeepSeek). When a conversation finishes, it\u2019s saved \u2014 automatically, silently, with no manual steps.",
  },
  {
    overline: "TIMELINE",
    title: "Every conversation, one scroll away.",
    description:
      "A unified feed sorted by time. Platform tags tell you where each conversation happened. Hover to preview, click to read the full thread.",
  },
  {
    overline: "SEARCH",
    title: "Find anything you\u2019ve ever asked.",
    description:
      "Full-text search across all your saved conversations. Filter by platform or date range. Results are instant \u2014 everything runs locally in your browser.",
  },
  {
    overline: "PRIVACY",
    title: "Your data never leaves your machine.",
    description:
      "No servers. No accounts. No cloud sync. Vesti stores everything in your browser\u2019s local IndexedDB. Export anytime. Delete anytime. It\u2019s your data.",
  },
]

export function Features() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-[100px]">
      <div className="mx-auto max-w-[720px] space-y-20">
        {features.map((feature) => (
          <div key={feature.overline}>
            <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.06em] text-text-tertiary">
              {feature.overline}
            </p>
            <h2 className="mb-3 text-2xl font-semibold leading-snug text-text-primary">
              {feature.title}
            </h2>
            <p className="max-w-[600px] text-base leading-[1.65] text-text-secondary">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
