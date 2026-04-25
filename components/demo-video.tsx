import { marketingLinks } from "@/lib/marketing-config"

export function DemoVideo() {
  return (
    <section
      id="demo"
      className="scroll-mt-24 px-6 py-12 md:px-8 md:py-14"
    >
      <div className="page-shell">
        <div className="mx-auto mb-8 max-w-[620px] text-center">
          <p className="section-kicker">Demo</p>
          <h2 className="mt-4 text-balance text-[clamp(2.1rem,4.5vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.06em] text-text-primary">
            See the memory loop in one pass.
          </h2>
          <p className="mx-auto mt-4 max-w-[32ch] text-balance text-base leading-7 text-text-secondary">
            Capture the thread, search it later, and reopen the context fast.
          </p>
        </div>

        <div className="lovable-media-frame p-3 md:p-4">
          <video
            className="aspect-video w-full rounded-[1.1rem] border border-border-subtle"
            autoPlay
            muted
            loop
            controls
            playsInline
            preload="metadata"
            poster="/library.png"
          >
            <source src={marketingLinks.demoVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  )
}
