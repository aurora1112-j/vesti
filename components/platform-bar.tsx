const platforms = [
  { name: "ChatGPT", bg: "#E8F5E9", text: "#2E7D32" },
  { name: "Claude", bg: "#FFF3E0", text: "#BF5B15" },
  { name: "Gemini", bg: "#E8EAF6", text: "#3949AB" },
  { name: "DeepSeek", bg: "#E3F2FD", text: "#1565C0" },
]

export function PlatformBar() {
  return (
    <section className="px-6 pb-10 pt-16 text-center md:px-12">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-5 text-sm font-medium text-text-secondary">
          One extension. Four platforms. Zero cloud.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {platforms.map((platform) => (
            <span
              key={platform.name}
              className="inline-flex rounded-full px-4 py-1.5 text-[13px] font-medium"
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
