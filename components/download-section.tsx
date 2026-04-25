"use client"

import { useState } from "react"
import { ChevronDown, Download, ExternalLink } from "lucide-react"

import {
  getPrimaryInstallHref,
  isExternalPrimaryInstall,
  marketingLinks,
} from "@/lib/marketing-config"

export function DownloadSection() {
  const [isOpen, setIsOpen] = useState(false)
  const primaryHref = getPrimaryInstallHref()
  const isExternal = isExternalPrimaryInstall()

  return (
    <section
      id="download"
      className="scroll-mt-24 px-6 py-12 md:px-8 md:py-14"
    >
      <div className="page-shell">
        <div className="lovable-panel p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="max-w-[520px]">
              <p className="section-kicker">Install</p>
              <h2 className="mt-4 text-balance text-[clamp(2.1rem,4.5vw,3.4rem)] font-semibold leading-[1.03] tracking-[-0.06em] text-text-primary">
                Start with the official path.
              </h2>
              <p className="mt-4 max-w-[32ch] text-balance text-base leading-7 text-text-secondary">
                Use the Chrome Web Store when it is ready, or install the current build manually.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={primaryHref}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="lovable-button-primary gap-2"
              >
                {isExternal ? "Open store" : "Install now"}
                {isExternal ? (
                  <ExternalLink className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </a>
              <a
                href={marketingLinks.manualZipUrl}
                download="Vesti_MVP_v1.2.0-rc.8-b7cf816-2026-03-19.zip"
                className="lovable-button-secondary gap-2"
              >
                <Download className="h-4 w-4" />
                Manual zip
              </a>
            </div>
          </div>

          <div className="mt-5 border-t border-border-subtle pt-5">
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-expanded={isOpen}
            >
              Manual install steps
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-150 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <ol className="mt-4 space-y-2 text-sm leading-7 text-text-secondary">
                <li>Download and unzip the package.</li>
                <li>
                  Open{" "}
                  <code className="rounded bg-[rgba(252,251,248,0.92)] px-1.5 py-0.5 font-mono text-xs text-text-primary">
                    chrome://extensions
                  </code>
                  .
                </li>
                <li>Enable Developer mode.</li>
                <li>Choose Load unpacked and select the folder.</li>
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
