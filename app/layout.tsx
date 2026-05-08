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

const siteUrl = "https://sprolo.com"
const siteTitle = "Sprolo — Trading P&L Calculator | Instant Profit & Loss Analysis"
const siteDescription =
  "Free trading profit & loss calculator. Upload your CSV trade history from CommSec, FP Markets, or any broker and get instant P&L metrics, per-symbol breakdowns, financial year tax summaries, CGT discount calculations, and a full trade-by-trade audit. No sign-up required."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "trading profit loss calculator",
    "P&L calculator",
    "share trading calculator",
    "stock profit calculator",
    "CommSec P&L",
    "FP Markets profit loss",
    "CSV trade history analyzer",
    "capital gains tax calculator Australia",
    "CGT discount calculator",
    "financial year trading summary",
    "FIFO trade matching",
    "realized gains calculator",
    "per symbol trade breakdown",
    "Australian tax trading report",
    "trade history CSV upload",
    "stock portfolio analyzer",
    "day trading P&L",
    "brokerage trade analyzer",
    "multi-broker CSV calculator",
    "free stock tax calculator",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: "Sprolo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sprolo — Trading P&L Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"],
    creator: "@TYOLab",
    site: "@TYOLab",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
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
            <Link href="/support" className="t-nav-link">Support</Link>
            <Link href="/privacy" className="t-nav-link">Privacy</Link>
          </div>

          {/* <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", letterSpacing: "0.1em", color: "var(--t-muted)" }}>
            <span className="t-status-dot" />
            LIVE
          </div> */}
        </nav>

        <main style={{ minHeight: "calc(100vh - 116px)", paddingTop: "64px" }}>
          {children}
        </main>

        <footer
          style={{
            borderTop: "1px solid var(--t-border)",
            padding: "16px 40px",
            background: "var(--t-bg)",
            color: "var(--t-muted)",
            fontSize: "11px",
            letterSpacing: "0.06em",
            textAlign: "center",
          }}
        >
          Copyright (c) 2026 TYO Lab. All rights reserved.
        </footer>
      </body>
    </html>
  )
}
