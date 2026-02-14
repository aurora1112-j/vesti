import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-page px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Vesti logo"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <span className="text-sm font-semibold text-text-primary">
            Vesti
          </span>
          <span className="text-text-tertiary" aria-hidden="true">
            ·
          </span>
          <span className="text-[13px] text-text-tertiary">v0.1.0</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/abraxas914/VESTI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            GitHub
          </a>
          <span className="text-text-tertiary" aria-hidden="true">
            ·
          </span>
          <span className="text-[13px] text-text-tertiary">
            Built for those who think with AI.
          </span>
        </div>
      </div>
    </footer>
  )
}
