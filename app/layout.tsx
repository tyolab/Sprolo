import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Mono, Syne } from "next/font/google"
import Link from "next/link"
import Image from "next/image"
import "./globals.css"

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
})

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sprolo — Trading P&L Terminal",
  description: "Professional trading profit & loss calculator. Analyze CSV trade data instantly.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${ibmPlexMono.variable} ${syne.variable}`}>
      <body className={ibmPlexMono.className}>
        {/* Top navigation */}
        <nav className="t-nav">
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
              <Image src="/logo.png" alt="Sprolo bird logo" width={26} height={20} style={{ objectFit: "contain" }} />
              <span className="t-nav-logo">SPROLO</span>
            </Link>
            <span className="t-nav-tag">v2.0</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
            <Link href="/" className="t-nav-link">Home</Link>
            <Link href="/calculate" className="t-nav-link">Calculator</Link>
            <Link href="/help" className="t-nav-link">Docs</Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", letterSpacing: "0.1em", color: "var(--t-muted)" }}>
            <span className="t-status-dot" />
            LIVE
          </div>
        </nav>

        <main style={{ minHeight: "100vh", paddingTop: "64px" }}>
          {children}
        </main>
      </body>
    </html>
  )
}
