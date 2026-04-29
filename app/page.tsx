import Link from "next/link"
import { ArrowRight, BarChart2, Upload, FileText } from "lucide-react"

const TICKER_ITEMS = [
  { sym: "AAPL", val: "+2.34%", up: true },
  { sym: "MSFT", val: "-0.87%", up: false },
  { sym: "TSLA", val: "+5.12%", up: true },
  { sym: "BTC-USD", val: "+1.44%", up: true },
  { sym: "NVDA", val: "+3.71%", up: true },
  { sym: "AMZN", val: "-1.23%", up: false },
  { sym: "GOOGL", val: "+0.94%", up: true },
  { sym: "META", val: "-2.11%", up: false },
  { sym: "SPY", val: "+0.62%", up: true },
  { sym: "QQQ", val: "+1.05%", up: true },
  { sym: "ETH-USD", val: "-0.33%", up: false },
  { sym: "NFLX", val: "+4.20%", up: true },
  { sym: "AMD", val: "+2.88%", up: true },
  { sym: "DIS", val: "-1.57%", up: false },
  { sym: "COIN", val: "+6.34%", up: true },
]

function TickerItem({ sym, val, up }: { sym: string; val: string; up: boolean }) {
  return (
    <span className="ticker-item">
      <span className="sym">{sym}</span>
      <span className={up ? "up" : "dn"}>{val}</span>
    </span>
  )
}

export default function Home() {
  // Duplicate items for seamless loop
  const allItems = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div>
      {/* Ticker tape
      <div className="ticker-tape">
        <div className="ticker-inner">
          {allItems.map((item, i) => (
            <TickerItem key={i} {...item} />
          ))}
        </div>
      </div>
      */}

      {/* Hero */}
      <div
        className="t-grid-bg"
        style={{
          minHeight: "calc(100vh - 74px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "30%",
            width: "600px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(245,163,28,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
          {/* Label */}
          <div className="t-section-label anim-fade-up anim-delay-1" style={{ marginBottom: "28px" }}>
            Trading Profit &amp; Loss Calculator
          </div>

          {/* Main heading */}
          <h1
            className="anim-fade-up anim-delay-2"
            style={{
              fontFamily: "var(--font-display), Syne, sans-serif",
              fontSize: "clamp(52px, 8vw, 96px)",
              fontWeight: 800,
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
              color: "var(--t-text)",
              marginBottom: "0",
            }}
          >
            ANALYZE
            <br />
            <span style={{ color: "var(--t-amber)" }}>YOUR</span>
            <br />
            TRADES
          </h1>

          {/* Subheading */}
          <p
            className="anim-fade-up anim-delay-3"
            style={{
              fontSize: "13px",
              color: "var(--t-muted)",
              maxWidth: "400px",
              marginTop: "28px",
              marginBottom: "40px",
              lineHeight: 1.7,
            }}
          >
            Upload your CSV trade history. Get instant P&L metrics,
            per-symbol breakdowns, and a full trade-by-trade audit.
            Supports CommSec, FP Markets, and any broker format.
          </p>

          {/* CTAs */}
          <div className="anim-fade-up anim-delay-4" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/calculate" className="t-btn t-btn-primary">
              Check Your P/L Now
              <ArrowRight size={14} />
            </Link>
            <Link href="/help" className="t-btn t-btn-ghost">
              Read Docs
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="anim-fade-up anim-delay-5"
            style={{
              display: "flex",
              gap: "0",
              marginTop: "64px",
              borderTop: "1px solid var(--t-border)",
              paddingTop: "28px",
            }}
          >
            {[
              { n: "3", label: "Broker formats" },
              { n: "CSV", label: "Multi-file upload" },
              { n: "∞", label: "Trade rows" },
              { n: "0", label: "External dependencies" },
            ].map(({ n, label }, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  padding: "0 24px 0 0",
                  borderRight: i < 3 ? "1px solid var(--t-border)" : "none",
                  marginRight: i < 3 ? "24px" : "0",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display), Syne, sans-serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "var(--t-amber)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {n}
                </div>
                <div style={{ fontSize: "10px", color: "var(--t-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "4px" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div
        style={{
          borderTop: "1px solid var(--t-border)",
          background: "var(--t-surface)",
          padding: "60px 40px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div className="t-section-label" style={{ marginBottom: "36px" }}>
            Capabilities
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1px", background: "var(--t-border)" }}>
            {[
              {
                icon: <Upload size={20} />,
                title: "CSV Ingestion",
                body: "Drag-and-drop or paste raw CSV. Multi-file supported. Auto-detects broker format columns.",
              },
              {
                icon: <BarChart2 size={20} />,
                title: "P&L Analysis",
                body: "FIFO-matched buys and sells. Net P&L, realized gains, per-symbol breakdown, win/loss ratio.",
              },
              {
                icon: <FileText size={20} />,
                title: "Export Results",
                body: "Download your annotated trade data as CSV or JSON for tax reporting or further analysis.",
              },
            ].map(({ icon, title, body }, i) => (
              <div
                key={i}
                style={{
                  background: "var(--t-bg)",
                  padding: "28px 24px",
                }}
              >
                <div style={{ color: "var(--t-amber)", marginBottom: "14px" }}>{icon}</div>
                <h3
                  style={{
                    fontFamily: "var(--font-display), Syne, sans-serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--t-text)",
                    marginBottom: "10px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "40px",
              padding: "20px 24px",
              border: "1px solid var(--t-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(245,163,28,0.03)",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "var(--t-amber)", letterSpacing: "0.08em", marginBottom: "4px" }}>
                READY TO CALCULATE?
              </div>
              <div style={{ fontSize: "12px", color: "var(--t-muted)" }}>
                Upload your first CSV and see your P&L in seconds.
              </div>
            </div>
            <Link href="/calculate" className="t-btn t-btn-outline t-btn-sm">
              Start Now <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid var(--t-border)",
          padding: "16px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--t-bg)",
        }}
      >
        <span style={{ fontSize: "10px", color: "var(--t-muted)", letterSpacing: "0.08em" }}>
          SPROLO © {new Date().getFullYear()}
        </span>
        <span style={{ fontSize: "10px", color: "var(--t-muted)", letterSpacing: "0.06em" }}>
          Trading P&amp;L Terminal
        </span>
      </div>
    </div>
  )
}
