import React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Mono, Manrope } from "next/font/google"

import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
})

export const metadata: Metadata = {
  title: "Vesti — Local-first AI Memory",
  description:
    "Auto-capture your chatbot (ChatGPT, Claude, Gemini & DeepSeek) conversations. Searchable, quantified, and stored entirely in your browser.",
  generator: "v0.app",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
