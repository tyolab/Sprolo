"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Check, X } from "lucide-react"
import PortfolioSidebar from "@/components/portfolio-sidebar"
import ResultsDisplay from "@/components/results-display"
import { getPortfolio, savePortfolio, type Portfolio } from "@/lib/portfolio-store"

export default function PortfolioPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState("")

  useEffect(() => {
    const p = getPortfolio(id)
    if (!p) {
      setNotFound(true)
    } else {
      setPortfolio(p)
      setNameInput(p.name)
    }
  }, [id])

  const commitRename = () => {
    if (!portfolio || !nameInput.trim()) return
    const updated = { ...portfolio, name: nameInput.trim(), updatedAt: new Date().toISOString() }
    savePortfolio(updated)
    setPortfolio(updated)
    setEditingName(false)
    window.dispatchEvent(new CustomEvent("portfolios-updated"))
  }

  const cancelRename = () => {
    setNameInput(portfolio?.name ?? "")
    setEditingName(false)
  }

  if (notFound) {
    return (
      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        <PortfolioSidebar />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            color: "var(--t-muted)",
          }}
        >
          <div style={{ fontSize: "48px", opacity: 0.2 }}>404</div>
          <div style={{ fontSize: "13px", letterSpacing: "0.06em" }}>Portfolio not found</div>
          <Link href="/calculate" className="t-btn t-btn-ghost t-btn-sm">
            Back to Calculator
          </Link>
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        <PortfolioSidebar />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--t-muted)",
            fontSize: "12px",
            letterSpacing: "0.08em",
          }}
          className="t-cursor"
        >
          LOADING
        </div>
      </div>
    )
  }

  const updatedDate = new Date(portfolio.updatedAt).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      <PortfolioSidebar activeId={id} />

      {/* Main panel */}
      <div style={{ flex: 1, background: "var(--t-bg)", display: "flex", flexDirection: "column" }}>
        {/* Sub-header */}
        <div
          style={{
            borderBottom: "1px solid var(--t-border)",
            background: "var(--t-surface)",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
            <Link
              href="/calculate"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--t-muted)",
                textDecoration: "none",
                fontSize: "11px",
                letterSpacing: "0.08em",
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={12} />
              NEW
            </Link>
            <span style={{ color: "var(--t-border)", flexShrink: 0 }}>|</span>

            {/* Portfolio name — editable */}
            {editingName ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename()
                    if (e.key === "Escape") cancelRename()
                  }}
                  style={{
                    background: "var(--t-bg)",
                    border: "1px solid var(--t-amber)",
                    color: "var(--t-text)",
                    fontFamily: "var(--font-display), Syne, sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    padding: "4px 8px",
                    flex: 1,
                    minWidth: 0,
                    outline: "none",
                    letterSpacing: "-0.01em",
                  }}
                />
                <button onClick={commitRename} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t-green)", display: "flex" }}>
                  <Check size={14} />
                </button>
                <button onClick={cancelRename} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t-muted)", display: "flex" }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display), Syne, sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--t-text)",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {portfolio.name}
                </span>
                <button
                  onClick={() => setEditingName(true)}
                  title="Rename portfolio"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--t-muted)",
                    display: "flex",
                    padding: "2px",
                    flexShrink: 0,
                  }}
                >
                  <Pencil size={11} />
                </button>
              </div>
            )}
          </div>

          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <span className="t-badge t-badge-amber">{portfolio.broker.toUpperCase()}</span>
            <span style={{ fontSize: "10px", color: "var(--t-muted)", letterSpacing: "0.06em" }}>
              Updated {updatedDate}
            </span>
            <Link
              href="/calculate"
              className="t-btn t-btn-ghost t-btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              + Recalculate
            </Link>
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
          <ResultsDisplay results={portfolio.result} />
        </div>
      </div>
    </div>
  )
}
