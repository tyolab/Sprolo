import Link from "next/link"
import type React from "react"
import { ArrowLeft } from "lucide-react"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        paddingBottom: "32px",
        borderBottom: "1px solid var(--t-border)",
        marginBottom: "32px",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display), Syne, sans-serif",
          fontSize: "20px",
          fontWeight: 700,
          color: "var(--t-text)",
          letterSpacing: "-0.01em",
          marginBottom: "14px",
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

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--t-bg)" }}>
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
          Privacy
        </span>
      </div>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "48px 32px",
        }}
      >
        <div className="t-section-label" style={{ marginBottom: "24px" }}>Privacy Policy</div>

        <h1
          style={{
            fontFamily: "var(--font-display), Syne, sans-serif",
            fontSize: "36px",
            fontWeight: 800,
            color: "var(--t-text)",
            letterSpacing: "-0.03em",
            marginBottom: "28px",
            lineHeight: 1.1,
          }}
        >
          Your Data
          <br />
          <span style={{ color: "var(--t-amber)" }}>Stays Yours</span>
        </h1>

        <Section title="Overview">
          <Para>
            This privacy page follows the same core principle described by TYO Lab at
            {" "}
            <a href="https://www.tyo.com.au/privacy/" style={{ color: "var(--t-amber)", textDecoration: "none" }}>
              tyo.com.au/privacy
            </a>
            :
            your data belongs to you.
          </Para>
          <Para>
            Sprolo is designed to process trading CSV data for profit and loss calculations without keeping that data on our server after the calculation request completes.
          </Para>
        </Section>

        <Section title="What We Process">
          <Para>
            When you upload or paste trade data and run a calculation, the application sends that trade data to the calculation endpoint so the server can compute the result.
          </Para>
          <Para>
            The data may include symbols, dates, quantities, prices, broker-specific trade rows, and derived calculation results.
          </Para>
        </Section>

        <Section title="What We Do Not Store On The Server">
          <Para>
            We do not maintain a server-side user account database for this tool.
          </Para>
          <Para>
            We do not persist uploaded trade files, pasted trade content, or completed calculation payloads on the server after the request finishes.
          </Para>
          <Para>
            The calculation route clears in-memory request data after completion or error handling. That means the server processes the request and then discards the trade payload.
          </Para>
        </Section>

        <Section title="Local Browser Storage">
          <Para>
            If you save portfolios in the app, those saved portfolios are stored in your own browser local storage on your device so you can reopen them later.
          </Para>
          <Para>
            That local storage is under your control and is separate from server storage. Deleting browser storage or clearing saved portfolios removes that local copy.
          </Para>
        </Section>

        <Section title="Permissions And Transfers">
          <Para>
            Your data is only sent to the server when you explicitly choose to calculate a result.
          </Para>
          <Para>
            We do not use your submitted trade data for profiling, advertising, or training.
          </Para>
        </Section>

        <Section title="Policy Changes">
          <Para>
            This privacy page may change as the product evolves. If future features require different handling of user data, the policy should be updated to reflect that change clearly.
          </Para>
        </Section>
      </div>
    </div>
  )
}
