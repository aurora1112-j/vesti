import Image from "next/image"

import {
  getPrimaryInstallHref,
  isExternalPrimaryInstall,
  marketingLinks,
} from "@/lib/marketing-config"

export function Navbar() {
  const installHref = getPrimaryInstallHref()
  const isExternal = isExternalPrimaryInstall()

  return (
    <nav className="sticky top-0 z-50 border-b border-border-subtle/80 bg-[rgba(247,244,237,0.82)] backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between px-6 md:px-8">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Vesti logo"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-text-primary">
            Vesti
          </span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          <a
            href="#features"
            className="text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            Features
          </a>
          <a
            href="#demo"
            className="text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            Demo
          </a>
          <a
            href={marketingLinks.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            GitHub
          </a>
        </div>

        <a
          href={installHref}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="lovable-button-secondary px-4 py-2.5 text-[13px]"
        >
          Install
        </a>
      </div>
    </nav>
  )
}
