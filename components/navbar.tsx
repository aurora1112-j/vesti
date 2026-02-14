import Image from "next/image"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 h-14 border-b border-border-subtle bg-bg-page/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[720px] items-center justify-between px-6 md:px-12">
        <a href="#" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Vesti logo"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="text-base font-semibold text-text-primary">
            Vesti
          </span>
        </a>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/abraxas914/VESTI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            GitHub
          </a>
          <a
            href="#download"
            className="text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            Download
          </a>
        </div>
      </div>
    </nav>
  )
}
