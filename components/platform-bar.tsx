const platforms = [
  { name: "ChatGPT", bg: "#e9f7ec", text: "#257a45" },
  { name: "Claude", bg: "#fff1df", text: "#b5611d" },
  { name: "Gemini", bg: "#ecefff", text: "#4253ca" },
  { name: "DeepSeek", bg: "#e7f1ff", text: "#1767c2" },
]

export function PlatformBar() {
  return (
    <section className="px-6 py-8 md:px-12">
      <div className="mx-auto flex max-w-[1220px] flex-col gap-4 rounded-[1.75rem] border border-border-default/70 bg-white/66 px-5 py-5 backdrop-blur-md md:flex-row md:items-center md:justify-between md:px-7">
        <p className="max-w-[360px] font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
          One extension. Four platforms. Zero cloud. Built for people who think
          across multiple models.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {platforms.map((platform) => (
            <span
              key={platform.name}
              className="inline-flex rounded-full border border-white/60 px-4 py-2 text-[12px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
              style={{
                backgroundColor: platform.bg,
                color: platform.text,
              }}
            >
              {platform.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
