import Image from "next/image"

export function ProductScreenshot() {
  return (
    <section className="px-6 pb-16 md:px-12">
      <div className="mx-auto max-w-[680px]">
        <div className="overflow-hidden rounded-xl bg-bg-surface p-3 shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">
          <Image
            src="/library.png"
            alt="Vesti Chrome extension showing captured conversations from ChatGPT and Claude alongside the Claude chat interface"
            width={1388}
            height={868}
            className="rounded-lg"
            priority
          />
        </div>
      </div>
    </section>
  )
}
