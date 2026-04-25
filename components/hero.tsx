import Image from "next/image"
import { ArrowRight, Play } from "lucide-react"

import {
  getPrimaryInstallHref,
  isExternalPrimaryInstall,
  marketingLinks,
} from "@/lib/marketing-config"

export function Hero() {
  const installHref = getPrimaryInstallHref()
  const isExternal = isExternalPrimaryInstall()

  return (
    <section className="px-6 pb-14 pt-16 md:px-8 md:pb-16 md:pt-20">
      <div className="page-shell">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="section-kicker">Local-first AI memory</p>
          <h1 className="mt-4 text-balance text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[1.02] tracking-[-0.07em] text-text-primary">
            Keep the AI threads you will want back.
          </h1>
          <p className="mx-auto mt-5 max-w-[32ch] text-balance text-[1.05rem] leading-7 text-text-secondary">
            Vesti saves your browser conversations into one searchable local library.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={installHref}
              {...(isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="lovable-button-primary min-w-[148px] gap-2"
            >
              Install
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#demo" className="lovable-button-secondary min-w-[148px] gap-2">
              <Play className="h-4 w-4" />
              Watch demo
            </a>
          </div>
        </div>

        <div className="mt-10 lovable-media-frame p-3 md:mt-12 md:p-4">
          <div className="mb-3 flex items-center justify-between rounded-xl border border-border-subtle bg-[rgba(252,251,248,0.9)] px-4 py-3">
            <p className="text-sm font-medium text-text-primary">Vesti library</p>
            <p className="text-sm text-text-tertiary">Search and reopen</p>
          </div>
          <Image
            src={marketingLinks.libraryScreenshotUrl}
            alt="Vesti side panel showing saved AI conversations in a searchable timeline."
            width={1388}
            height={868}
            className="w-full rounded-[1.1rem] border border-border-subtle"
            priority
          />
        </div>
      </div>
    </section>
  )
}
