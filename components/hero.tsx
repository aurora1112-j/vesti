"use client"

export function Hero() {
  return (
    <section className="px-6 pb-20 pt-36 text-center md:px-12 md:pt-[140px]">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          Local-first AI memory
        </p>
        <h1 className="mx-auto mb-6 whitespace-nowrap text-4xl font-semibold leading-[1.15] tracking-tight text-text-primary md:text-[48px]">
          Every thought deserves a home.
        </h1>
        <p className="mx-auto mb-10 max-w-[520px] text-base leading-relaxed text-text-secondary md:text-lg">
          Vesti auto-captures your chatbot (ChatGPT, Claude, Gemini, and
          DeepSeek) conversations — searchable, quantified, and stored entirely
          in your browser.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {/* DOWNLOAD: Replace href with Chrome Web Store URL */}
          <a
            href="#download"
            className="inline-flex items-center justify-center rounded-md bg-vesti-accent px-7 py-3 text-[15px] font-medium text-white transition-colors duration-150 hover:bg-vesti-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vesti-accent focus-visible:ring-offset-2"
            onClick={(e) => {
              e.preventDefault()
              document
                .getElementById("download")
                ?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Download
          </a>
          <a
            href="#demo"
            className="inline-flex items-center justify-center rounded-md border border-border-default bg-transparent px-7 py-3 text-[15px] font-medium text-text-secondary transition-all duration-150 hover:border-vesti-accent hover:bg-[rgba(50,102,173,0.08)] hover:text-vesti-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vesti-accent focus-visible:ring-offset-2"
            onClick={(e) => {
              e.preventDefault()
              document
                .getElementById("demo")
                ?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Watch Demo
          </a>
        </div>
      </div>
    </section>
  )
}
