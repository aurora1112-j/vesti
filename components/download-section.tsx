"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function DownloadSection() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section
      id="download"
      className="bg-bg-surface px-6 py-24 md:px-12 md:py-[100px]"
    >
      <div className="mx-auto max-w-[720px]">
        <h2 className="mb-3 text-center text-[28px] font-semibold text-text-primary">
          Get Started
        </h2>
        <p className="mb-12 text-center text-base text-text-secondary">
          Install Vesti in under a minute.
        </p>
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Block A — Chrome Web Store */}
          <div className="flex-1 rounded-xl border border-border-default bg-bg-page p-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.06em] text-text-tertiary">
              RECOMMENDED
            </p>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              Chrome Web Store
            </h3>
            <p className="mb-6 text-sm text-text-secondary">
              One-click install from the official store.
            </p>
            {/* DOWNLOAD: Replace href with Chrome Web Store URL */}
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-md bg-vesti-accent px-7 py-3 text-[15px] font-medium text-white transition-colors duration-150 hover:bg-vesti-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vesti-accent focus-visible:ring-offset-2"
            >
              Install Extension
            </a>
          </div>

          {/* Block B — Manual Install */}
          <div className="flex-1 rounded-xl border border-border-default bg-bg-page p-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.06em] text-text-tertiary">
              DEVELOPER
            </p>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              Manual Install
            </h3>
            <p className="mb-6 text-sm text-text-secondary">
              Download the build and load it yourself.
            </p>
            {/* DOWNLOAD: Replace href with actual .zip download URL */}
            <a
              href="/Vesti-MVP.zip"
              download
              className="inline-flex items-center justify-center rounded-md border border-border-default bg-transparent px-7 py-3 text-[15px] font-medium text-text-secondary transition-all duration-150 hover:border-vesti-accent hover:bg-[rgba(50,102,173,0.08)] hover:text-vesti-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vesti-accent focus-visible:ring-offset-2"
            >
              Download .zip
            </a>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vesti-accent focus-visible:ring-offset-2"
                aria-expanded={isOpen}
              >
                Installation steps
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <ol className="mt-3 list-inside list-decimal space-y-1.5 text-sm leading-relaxed text-text-secondary">
                  <li>Download and unzip the file</li>
                  <li>
                    Open{" "}
                    <code className="rounded bg-bg-surface px-1.5 py-0.5 font-mono text-xs text-text-primary">
                      chrome://extensions
                    </code>{" "}
                    in your browser
                  </li>
                  <li>
                    Enable &ldquo;Developer mode&rdquo; (top right toggle)
                  </li>
                  <li>
                    Click &ldquo;Load unpacked&rdquo; and select the unzipped
                    folder
                  </li>
                </ol>
              )}
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-[13px] text-text-tertiary">
          Compatible with Chrome, Edge, Arc, Brave, and all Chromium browsers.
        </p>
      </div>
    </section>
  )
}
