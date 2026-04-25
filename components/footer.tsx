import Image from "next/image"

import { marketingLinks } from "@/lib/marketing-config"

export function Footer() {
  return (
    <footer className="px-6 pb-10 pt-2 md:px-8 md:pb-12">
      <div className="page-shell">
        <div className="flex flex-col gap-4 border-t border-border-subtle pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Vesti logo"
              width={20}
              height={20}
              className="h-5 w-5"
            />
            <span className="text-sm font-medium text-text-primary">Vesti</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            <a
              href={marketingLinks.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150 hover:text-text-primary"
            >
              GitHub
            </a>
            <a
              href="#download"
              className="transition-colors duration-150 hover:text-text-primary"
            >
              Install
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
