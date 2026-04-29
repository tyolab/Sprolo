"use client"

import { useState } from "react"
import { Download, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Activity } from "lucide-react"
import type { CalculationResult } from "@/lib/types"

interface ResultsDisplayProps {
  results: CalculationResult
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "trades">("summary")

  const downloadResults = (format: "csv" | "json") => {
    let content: string
    let filename: string
    let type: string

    if (format === "csv") {
      const headers = "symbol,side,quantity,price,date,profit_loss\n"
      const rows = results.trades
        .map((t) => `${t.symbol},${t.side},${t.quantity},${t.price},${t.date},${t.profitLoss || 0}`)
        .join("\n")
      content = headers + rows
      filename = "trading-results.csv"
      type = "text/csv"
    } else {
      content = JSON.stringify(results, null, 2)
      filename = "trading-results.json"
      type = "application/json"
    }

    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const isProfit = results.netPnL >= 0
  const winCount = results.symbolSummary.filter((s) => s.profitLoss >= 0).length
  const totalSymbols = results.symbolSummary.length
  const winRate = totalSymbols > 0 ? Math.round((winCount / totalSymbols) * 100) : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Output header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "12px",
          borderBottom: "1px solid var(--t-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Activity size={14} style={{ color: "var(--t-amber)" }} />
          <span
            style={{
              fontFamily: "var(--font-display), Syne, sans-serif",
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--t-text)",
              letterSpacing: "-0.01em",
            }}
          >
            Analysis Results
          </span>
          <span className="t-badge t-badge-amber">{results.trades.length} TRADES</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="t-btn t-btn-ghost t-btn-sm"
            onClick={() => downloadResults("csv")}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={11} /> CSV
          </button>
          <button
            className="t-btn t-btn-ghost t-btn-sm"
            onClick={() => downloadResults("json")}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={11} /> JSON
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1px", background: "var(--t-border)" }}>
        {/* Net P&L */}
        <div className="t-metric">
          <div className="t-metric-label">Net P&amp;L</div>
          <div className={`t-metric-value ${isProfit ? "gain" : "loss"}`}>
            {isProfit ? "+" : ""}${results.netPnL.toFixed(2)}
          </div>
          <div className="t-metric-sub" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {isProfit
              ? <><TrendingUp size={10} style={{ color: "var(--t-green)" }} /> Profitable</>
              : <><TrendingDown size={10} style={{ color: "var(--t-red)" }} /> Net loss</>
            }
          </div>
        </div>

        {/* Total Profit */}
        <div className="t-metric">
          <div className="t-metric-label">Gross Profit</div>
          <div className="t-metric-value gain">+${results.totalProfit.toFixed(2)}</div>
          <div className="t-metric-sub">Realized gains</div>
        </div>

        {/* Total Loss */}
        <div className="t-metric">
          <div className="t-metric-label">Gross Loss</div>
          <div className="t-metric-value loss">-${Math.abs(results.totalLoss).toFixed(2)}</div>
          <div className="t-metric-sub">Realized losses</div>
        </div>

        {/* Win rate */}
        <div className="t-metric">
          <div className="t-metric-label">Win Rate</div>
          <div className="t-metric-value neutral">{winRate}%</div>
          <div className="t-metric-sub">{winCount}/{totalSymbols} symbols profitable</div>
        </div>
      </div>

      {/* Data tabs */}
      <div className="t-card">
        <div className="t-card-header">
          <div className="t-tabs" style={{ border: "none", borderBottom: "none", margin: "0 -14px -10px" }}>
            <button
              className={`t-tab ${activeTab === "summary" ? "active" : ""}`}
              onClick={() => setActiveTab("summary")}
            >
              Symbol Summary
            </button>
            <button
              className={`t-tab ${activeTab === "trades" ? "active" : ""}`}
              onClick={() => setActiveTab("trades")}
            >
              All Trades
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          {activeTab === "summary" ? (
            <table className="t-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Trades</th>
                  <th style={{ textAlign: "right" }}>P&amp;L</th>
                  <th style={{ textAlign: "right" }}>Direction</th>
                </tr>
              </thead>
              <tbody>
                {results.symbolSummary.map((s) => (
                  <tr key={s.symbol}>
                    <td className="sym">{s.symbol}</td>
                    <td style={{ color: "var(--t-muted)" }}>{s.tradeCount}</td>
                    <td
                      className={s.profitLoss >= 0 ? "gain" : "loss"}
                      style={{ textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                    >
                      {s.profitLoss >= 0 ? "+" : ""}${s.profitLoss.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {s.profitLoss >= 0 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }} className="gain">
                          <ArrowUpRight size={12} /> GAIN
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }} className="loss">
                          <ArrowDownRight size={12} /> LOSS
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="t-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th style={{ textAlign: "right" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                  <th style={{ textAlign: "right" }}>P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {results.trades.map((trade, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--t-muted)", fontVariantNumeric: "tabular-nums" }}>{trade.date}</td>
                    <td className="sym">{trade.symbol}</td>
                    <td className={trade.side === "buy" ? "buy" : "sell"} style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
                      {trade.side.toUpperCase()}
                    </td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{trade.quantity}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      ${Number.parseFloat(trade.price.toString()).toFixed(2)}
                    </td>
                    <td
                      className={trade.profitLoss ? (trade.profitLoss >= 0 ? "gain" : "loss") : ""}
                      style={{ textAlign: "right", fontWeight: trade.profitLoss ? 600 : 400, fontVariantNumeric: "tabular-nums" }}
                    >
                      {trade.profitLoss
                        ? `${trade.profitLoss >= 0 ? "+" : ""}$${trade.profitLoss.toFixed(2)}`
                        : <span style={{ color: "var(--t-muted)" }}>—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
