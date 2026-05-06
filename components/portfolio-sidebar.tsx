"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Plus, TrendingUp, TrendingDown, Trash2, FolderOpen } from "lucide-react"
import { loadPortfolios, deletePortfolio, type Portfolio } from "@/lib/portfolio-store"

interface PortfolioSidebarProps {
  activeId?: string
  onPortfoliosChange?: (portfolios: Portfolio[]) => void
}

export default function PortfolioSidebar({ activeId, onPortfoliosChange }: PortfolioSidebarProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const router = useRouter()
  const pathname = usePathname()

  const refresh = () => {
    const list = loadPortfolios()
    setPortfolios(list)
    onPortfoliosChange?.(list)
  }

  useEffect(() => {
    refresh()
    // Re-sync from other tabs (storage event) or same-tab saves (portfolios-updated)
    const handler = () => refresh()
    window.addEventListener("storage", handler)
    window.addEventListener("portfolios-updated", handler)
    return () => {
      window.removeEventListener("storage", handler)
      window.removeEventListener("portfolios-updated", handler)
    }
  }, [])

  // Also refresh when route changes (new portfolio saved)
  useEffect(() => {
    refresh()
  }, [pathname])

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("Delete this portfolio?")) return
    deletePortfolio(id)
    refresh()
    window.dispatchEvent(new CustomEvent("portfolios-updated"))
    if (activeId === id) router.push("/calculate")
  }

  return (
    <aside
      style={{
        width: "240px",
        flexShrink: 0,
        borderRight: "1px solid var(--t-border)",
        background: "var(--t-surface)",
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Sidebar header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--t-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--t-muted)",
          }}
        >
          // Portfolios
        </span>
        <Link
          href="/calculate"
          title="New Portfolio"
          style={{
            display: "flex",
            alignItems: "center",
            color: "var(--t-amber)",
            textDecoration: "none",
            padding: "2px",
            transition: "opacity 0.15s",
          }}
        >
          <Plus size={14} />
        </Link>
      </div>

      {/* Portfolio list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {portfolios.length === 0 ? (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              color: "var(--t-muted)",
              fontSize: "11px",
              lineHeight: 1.7,
            }}
          >
            <FolderOpen size={22} style={{ margin: "0 auto 10px", opacity: 0.4, display: "block" }} />
            No portfolios yet.
            <br />
            Upload a CSV to get started.
          </div>
        ) : (
          portfolios.map((p) => {
            const isActive = p.id === activeId
            const isGain = p.netPnL >= 0
            return (
              <Link
                key={p.id}
                href={`/portfolio/${p.id}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: "10px 16px",
                  borderLeft: isActive ? "2px solid var(--t-amber)" : "2px solid transparent",
                  background: isActive ? "rgba(0,122,199,0.07)" : "transparent",
                  transition: "background 0.15s",
                  position: "relative",
                }}
              >
                {/* Name */}
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: isActive ? "var(--t-amber)" : "var(--t-text)",
                    letterSpacing: "0.02em",
                    marginBottom: "4px",
                    paddingRight: "20px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.name}
                </div>

                {/* Meta row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--t-muted)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {p.broker} · {p.tradeCount}T
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: isGain ? "var(--t-green)" : "var(--t-red)",
                      fontVariantNumeric: "tabular-nums",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    {isGain
                      ? <TrendingUp size={9} />
                      : <TrendingDown size={9} />
                    }
                    {isGain ? "+" : ""}${p.netPnL.toFixed(0)}
                  </span>
                </div>

                {/* Holdings chip */}
                {p.holdingCount > 0 && (
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "9px",
                      color: "var(--t-muted)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {p.holdingCount} holding{p.holdingCount !== 1 ? "s" : ""}
                  </div>
                )}

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, p.id)}
                  title="Delete portfolio"
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--t-muted)",
                    padding: "2px",
                    display: "flex",
                    opacity: 0,
                    transition: "opacity 0.15s",
                  }}
                  className="sidebar-delete-btn"
                >
                  <Trash2 size={11} />
                </button>
              </Link>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--t-border)",
          fontSize: "9px",
          color: "var(--t-muted)",
          letterSpacing: "0.08em",
        }}
      >
        {portfolios.length} portfolio{portfolios.length !== 1 ? "s" : ""} stored locally
      </div>

      <style>{`
        a:hover .sidebar-delete-btn,
        a .sidebar-delete-btn:focus {
          opacity: 1 !important;
        }
        a:hover .sidebar-delete-btn:hover {
          color: var(--t-red) !important;
        }
      `}</style>
    </aside>
  )
}
