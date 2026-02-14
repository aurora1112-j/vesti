import React from "react"
import type { Metadata } from "next"
import { Lora } from "next/font/google"

import "./globals.css"

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
})

export const metadata: Metadata = {
  title: "Vesti — Local-first AI Memory",
  description:
    "Auto-capture your chatbot (ChatGPT, Claude, Gemini & DeepSeek) conversations. Searchable, quantified, and stored entirely in your browser.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={lora.variable}>
      <body className="font-serif antialiased">{children}</body>
    </html>
  )
}
