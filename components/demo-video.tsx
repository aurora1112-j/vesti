export function DemoVideo() {
  return (
    <section id="demo" className="px-6 pb-20 pt-24 text-center md:px-12 md:pt-[100px]">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          DEMO
        </p>
        <h2 className="mb-10 text-[28px] font-semibold text-text-primary">
          See it in action
        </h2>
        <div className="mx-auto max-w-[680px]">
          <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
            <video
              className="aspect-video w-full"
              autoPlay
              muted
              loop
              controls
              playsInline
              preload="metadata"
              poster="/screenshot.jpg"
            >
              <source
                src="/demo.MOV"
                type="video/quicktime"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}
