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
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "48px 32px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 240px",
          gap: "56px",
          alignItems: "start",
        }}
      >
        {/* Main content */}
        <div>
          <div className="t-section-label" style={{ marginBottom: "24px" }}>Usage Guide</div>

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
            How To
            <br />
            <span style={{ color: "var(--t-amber)" }}>Use Sprolo</span>
          </h1>

          <Section id="quickstart" title="Quick Start">
            <Para>Use this flow when you want to create a portfolio from a broker CSV, review the results, and save it for later.</Para>
            <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Open Calculator from the home page.",
                "Choose your broker: CommSec, FP Markets, or Any Broker.",
                "Under Save to, choose New Portfolio or an existing portfolio.",
                "Upload CSV or paste trade data.",
                "Click Calculate Profit / Loss.",
                "The result is saved as a portfolio and opened automatically.",
              ].map((step, i) => (
                <li key={i} style={{ display: "flex", gap: "10px", color: "var(--t-muted)", fontSize: "12px", lineHeight: 1.7 }}>
                  <span style={{ color: "var(--t-amber)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="portfolio-modes" title="New, Replace, Or Append">
            <Para>The calculator supports three save patterns depending on what you are trying to do.</Para>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
              {[
                {
                  name: "New Portfolio",
                  note: "Creates a new saved portfolio from the uploaded trades.",
                },
                {
                  name: "Replace",
                  note: "Recalculates an existing portfolio using only the newly provided trade set.",
                },
                {
                  name: "Append Trades",
                  note: "Adds new trade rows into an existing portfolio, useful for dropping in the next financial year.",
                },
              ].map(({ name, note }) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    padding: "10px 14px",
                    background: "var(--t-surface)",
                    border: "1px solid var(--t-border)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--t-amber)", fontWeight: 600, letterSpacing: "0.04em" }}>{name}</span>
                  <span style={{ fontSize: "11px", color: "var(--t-muted)", textAlign: "right" }}>{note}</span>
                </div>
              ))}
            </div>
            <Para>From any saved portfolio page, click <strong style={{ color: "var(--t-text)" }}>+ Add Trades</strong> to jump straight into append mode for that portfolio.</Para>
          </Section>

          <Section id="financial-years" title="Financial Year View">
            <Para>The results page includes a Tax Year selector above the KPI cards.</Para>
            <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "All Years shows the full portfolio result.",
                "Selecting a specific financial year filters the KPI cards, By Symbol table, and All Trades table for that tax year.",
                "The All Trades tab label shows the filtered trade count for the selected year.",
                "Current Holdings remains the current portfolio position and is not limited to one year.",
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", gap: "10px", color: "var(--t-muted)", fontSize: "12px", lineHeight: 1.7 }}>
                  <span style={{ color: "var(--t-amber)", fontWeight: 700, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="sorting" title="Sorting And Tables">
            <Para>The results view has two main tables:</Para>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
              {[
                {
                  name: "By Symbol",
                  note: "Defaults to Net P&L descending. You can also click Symbol, Gain, or Loss to sort. Symbol toggles ascending first, then descending. Gain and Loss toggle descending first, then ascending.",
                },
                {
                  name: "All Trades",
                  note: "Shows each trade row with date and time. When a financial year is selected, only trades from that year are shown.",
                },
              ].map(({ name, note }) => (
                <div
                  key={name}
                  style={{
                    padding: "10px 14px",
                    background: "var(--t-surface)",
                    border: "1px solid var(--t-border)",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "var(--t-amber)", fontWeight: 600, marginBottom: "6px", letterSpacing: "0.04em" }}>{name}</div>
                  <div style={{ fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.7 }}>{note}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="required" title="Required Inputs">
            <Para>If you use Any Broker or paste your own generic data, make sure your fields are shaped like the app expects.</Para>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
              {[
                { col: "symbol", desc: "Ticker symbol, for example AAPL, CBA, or BTC-USD" },
                { col: "side", desc: "Trade direction: buy or sell" },
                { col: "quantity", desc: "Number of shares or units traded" },
                { col: "price", desc: "Execution price per unit, as a plain number" },
                { col: "date", desc: "Trade date. For best results use ISO format, and time is supported." },
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
            <Para>Use this format when working with generic trade input or paste mode:</Para>
            <CodeBlock>{`symbol,side,quantity,price,date
AAPL,buy,10,150.25,2023-01-15 09:30
AAPL,sell,10,165.50,2023-02-20 15:45
MSFT,buy,5,280.10,2023-01-10 10:15
MSFT,sell,5,300.75,2023-03-05 14:05`}</CodeBlock>
          </Section>

          <Section id="brokers" title="Broker Formats">
            <Para>Select the broker that matches your file so the importer can map fields correctly.</Para>
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
                "You can upload multiple CSV files in one calculation; the trade sets are merged before processing.",
                "Append Trades is the right workflow when you want to add a new financial year into an existing saved portfolio.",
                "The app calculates realized P&L with FIFO matching.",
                "If a broker export already contains times, the All Trades table will show HH:MM in the Date column.",
                "Use the portfolio sidebar to reopen saved portfolios later without recalculating from scratch.",
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
              background: "rgba(0,122,199,0.06)",
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--t-muted)" }}>
              Ready to create or extend a portfolio?
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
            { href: "#quickstart", label: "Quick Start" },
            { href: "#portfolio-modes", label: "New / Replace / Append" },
            { href: "#financial-years", label: "Financial Year View" },
            { href: "#sorting", label: "Sorting" },
            { href: "#required", label: "Required Inputs" },
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
