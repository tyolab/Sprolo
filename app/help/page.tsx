import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      style={{
        background: "var(--t-bg)",
        border: "1px solid var(--t-border)",
        padding: "16px",
        fontFamily: "var(--font-mono), monospace",
        fontSize: "11px",
        color: "var(--t-text)",
        overflowX: "auto",
        lineHeight: 1.6,
        margin: "12px 0",
      }}
    >
      <code>{children}</code>
    </pre>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      style={{
        paddingBottom: "36px",
        borderBottom: "1px solid var(--t-border)",
        marginBottom: "36px",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display), Syne, sans-serif",
          fontSize: "20px",
          fontWeight: 700,
          color: "var(--t-text)",
          letterSpacing: "-0.01em",
          marginBottom: "16px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.8, marginBottom: "10px" }}>
      {children}
    </p>
  )
}

function ColTag({ children }: { children: string }) {
  return (
    <span
      style={{
        fontSize: "10px",
        background: "rgba(245,163,28,0.08)",
        border: "1px solid rgba(245,163,28,0.3)",
        color: "var(--t-amber)",
        padding: "2px 8px",
        letterSpacing: "0.06em",
        fontFamily: "var(--font-mono), monospace",
      }}
    >
      {children}
    </span>
  )
}

import type React from "react"

export default function HelpPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--t-bg)" }}>
      {/* Page header */}
      <div
        style={{
          borderBottom: "1px solid var(--t-border)",
          background: "var(--t-surface)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--t-muted)",
            textDecoration: "none",
            fontSize: "11px",
            letterSpacing: "0.08em",
          }}
        >
          <ArrowLeft size={13} />
          HOME
        </Link>
        <span style={{ color: "var(--t-border)" }}>|</span>
        <span
          style={{
            fontFamily: "var(--font-display), Syne, sans-serif",
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--t-text)",
            letterSpacing: "-0.01em",
          }}
        >
          Documentation
        </span>
      </div>

      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "48px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 200px",
          gap: "48px",
          alignItems: "start",
        }}
      >
        {/* Main content */}
        <div>
          <div className="t-section-label" style={{ marginBottom: "24px" }}>CSV Format Guide</div>

          <h1
            style={{
              fontFamily: "var(--font-display), Syne, sans-serif",
              fontSize: "36px",
              fontWeight: 800,
              color: "var(--t-text)",
              letterSpacing: "-0.03em",
              marginBottom: "32px",
              lineHeight: 1.1,
            }}
          >
            Data
            <br />
            <span style={{ color: "var(--t-amber)" }}>Format</span>
          </h1>

          <Section id="required" title="Required Columns">
            <Para>Your CSV must include these five columns. Column names are case-insensitive.</Para>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
              {[
                { col: "symbol", desc: "Ticker symbol (e.g. AAPL, BTC-USD, CBA.AX)" },
                { col: "side", desc: "Direction — buy or sell" },
                { col: "quantity", desc: "Number of shares or units traded" },
                { col: "price", desc: "Execution price per unit (no currency symbols)" },
                { col: "date", desc: "Trade date in YYYY-MM-DD format" },
              ].map(({ col, desc }) => (
                <div
                  key={col}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    padding: "10px 14px",
                    background: "var(--t-surface)",
                    border: "1px solid var(--t-border)",
                  }}
                >
                  <ColTag>{col}</ColTag>
                  <span style={{ fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.5 }}>{desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="example" title="Example CSV">
            <Para>Copy-paste this into the calculator to try it out:</Para>
            <CodeBlock>{`symbol,side,quantity,price,date
AAPL,buy,10,150.25,2023-01-15
AAPL,sell,10,165.50,2023-02-20
MSFT,buy,5,280.10,2023-01-10
MSFT,sell,5,300.75,2023-03-05
TSLA,buy,3,190.25,2023-02-01
TSLA,sell,3,210.50,2023-04-10`}</CodeBlock>
          </Section>

          <Section id="brokers" title="Broker Formats">
            <Para>Select the matching broker to automatically map non-standard column names:</Para>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "12px 0" }}>
              {[
                { name: "CommSec", note: "ASX trades export from CommSec's portfolio CSV" },
                { name: "FP Markets", note: "MT4/MT5 statement exports" },
                { name: "Any Broker", note: "Generic format — standard column names required" },
              ].map(({ name, note }) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "var(--t-surface)",
                    border: "1px solid var(--t-border)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--t-amber)", fontWeight: 600, letterSpacing: "0.04em" }}>{name}</span>
                  <span style={{ fontSize: "11px", color: "var(--t-muted)" }}>{note}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="tips" title="Tips">
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Ensure your CSV has a header row with exact column names",
                "Numeric values must be plain numbers — no $, commas, or % symbols",
                "Dates must be YYYY-MM-DD for reliable parsing",
                "You can upload multiple CSV files — results are merged",
                "P&L is calculated FIFO: earliest buy is matched first",
              ].map((tip, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "12px",
                    color: "var(--t-muted)",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ color: "var(--t-amber)", fontWeight: 700, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </Section>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              border: "1px solid var(--t-border)",
              background: "rgba(245,163,28,0.03)",
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--t-muted)" }}>
              Ready to analyze your trades?
            </span>
            <Link href="/calculate" className="t-btn t-btn-outline t-btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              Open Calculator <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Sidebar TOC */}
        <div
          style={{
            position: "sticky",
            top: "64px",
            background: "var(--t-surface)",
            border: "1px solid var(--t-border)",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--t-muted)",
              marginBottom: "12px",
            }}
          >
            Contents
          </div>
          {[
            { href: "#required", label: "Required Columns" },
            { href: "#example", label: "Example CSV" },
            { href: "#brokers", label: "Broker Formats" },
            { href: "#tips", label: "Tips" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                display: "block",
                padding: "6px 0",
                fontSize: "11px",
                color: "var(--t-muted)",
                textDecoration: "none",
                borderBottom: "1px solid var(--t-border)",
                letterSpacing: "0.02em",
                transition: "color 0.15s",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
