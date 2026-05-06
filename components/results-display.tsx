"use client"

import { useState } from "react"
import {
  Download, ArrowUpRight, ArrowDownRight,
  TrendingUp, TrendingDown, Activity, Briefcase, Calendar,
} from "lucide-react"
import type { CalculationResult, HoldingEntry, FinancialYearResult } from "@/lib/types"

interface ResultsDisplayProps {
  results: CalculationResult
}

// Derive Australian financial year (ending June) from an ISO date string
function getFY(dateStr: string): string {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = d.getMonth() // 0-indexed; June = 5
  const fyStart = m >= 6 ? y : y - 1
  return `${fyStart}-${fyStart + 1}`
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  // ── Normalise data (before useState so we can derive the default year) ──
  const normalizedTrades = Array.isArray(results.trades) ? results.trades : []

  // Build financialYears — prefer serialized array; fall back to deriving from trades
  const financialYears: FinancialYearResult[] = (() => {
    if (Array.isArray(results.financialYears) && results.financialYears.length > 0) {
      return results.financialYears
    }
    // Fallback: derive unique FY keys from trade dates so the selector still appears
    const keys = new Set(normalizedTrades.map(t => t.date ? getFY(t.date) : null).filter(Boolean) as string[])
    return Array.from(keys)
      .sort()
      .map(key => {
        const [startYear] = key.split("-")
        const endYear = String(Number(startYear) + 1).slice(-2)
        return {
          key,
          label: `FY ${startYear}-${endYear}`,
          profit: 0, profitDiscount: 0,
          totalProfitGain: 0, totalProfitLoss: 0, netPnL: 0,
          totalTrades: 0, totalBuy: 0, totalSell: 0, totalCost: 0,
          symbols: [],
        } as FinancialYearResult
      })
  })()

  // Default to the latest (last) financial year
  const defaultYear = financialYears.length > 0
    ? financialYears[financialYears.length - 1].key
    : "all"

  const [activeTab, setActiveTab] = useState<"summary" | "trades">("summary")
  const [selectedYear, setSelectedYear] = useState<string>(defaultYear)

  const holdings: HoldingEntry[] = Array.isArray(results.holdings)
    ? (results.holdings as any[]).filter((h: any) => h.quantity !== undefined)
    : []

  // ── Year-aware derived values ─────────────────────────────────
  const activeYear: FinancialYearResult | null =
    selectedYear !== "all" ? (financialYears.find(y => y.key === selectedYear) ?? null) : null

  // For "All years" fall back to stored totals
  const financialYearEntries = Object.entries(results.financial_years || {})
  const primaryYear = financialYearEntries.length > 0
    ? financialYearEntries[financialYearEntries.length - 1][1] as any
    : null

  const rawTotalProfit = typeof results.totalProfit === "number"
    ? results.totalProfit : Number(primaryYear?.total_profit_gain || 0)
  const rawTotalLoss = typeof results.totalLoss === "number"
    ? results.totalLoss : Number(primaryYear?.total_profit_loss || 0)
  const rawNetPnL = typeof results.netPnL === "number"
    ? results.netPnL : Number(primaryYear?.profit || 0) + Number(primaryYear?.profit_discount || 0)

  const totalProfit   = activeYear ? activeYear.totalProfitGain : rawTotalProfit
  const totalLoss     = activeYear ? activeYear.totalProfitLoss : rawTotalLoss
  const netPnL        = activeYear ? activeYear.netPnL          : rawNetPnL
  const cgtDiscount   = activeYear ? activeYear.profitDiscount  : null
  const yearTrades    = activeYear ? activeYear.totalTrades      : null

  const isProfit = netPnL >= 0

  // ── Symbol summary (year-aware) ───────────────────────────────
  const yearSymbols = activeYear ? activeYear.symbols : null

  const normalizedSymbolSummary = yearSymbols
    ? yearSymbols.map(s => ({
        symbol: s.symbol,
        tradeCount: s.tradeCount,
        profitLoss: (s.profitGain || 0) + (s.profitLoss || 0),
      }))
    : Array.isArray(results.symbolSummary)
      ? results.symbolSummary
      : []

  // Win rate
  const winCount = normalizedSymbolSummary.filter(s => s.profitLoss >= 0).length
  const totalSymbols = normalizedSymbolSummary.length
  const winRate = totalSymbols > 0 ? Math.round((winCount / totalSymbols) * 100) : 0

  // ── Trades (year-aware) ───────────────────────────────────────
  const filteredTrades = activeYear
    ? normalizedTrades.filter(t => t.date && getFY(t.date) === activeYear.key)
    : normalizedTrades

  const tradesCount = yearTrades ?? (filteredTrades.length || Number((results.trades as any)?.count || 0))

  // ── Download ──────────────────────────────────────────────────
  const downloadResults = (format: "csv" | "json") => {
    const data = activeYear ? filteredTrades : normalizedTrades
    let content: string, filename: string, type: string
    if (format === "csv") {
      const headers = "symbol,side,quantity,price,date,profit_loss\n"
      const rows = data.map(t => `${t.symbol},${t.side},${t.quantity},${t.price},${t.date},${t.profitLoss || 0}`).join("\n")
      content = headers + rows
      filename = activeYear ? `trading-results-${activeYear.key}.csv` : "trading-results.csv"
      type = "text/csv"
    } else {
      content = JSON.stringify(activeYear ? { year: activeYear, trades: filteredTrades } : results, null, 2)
      filename = activeYear ? `trading-results-${activeYear.key}.json` : "trading-results.json"
      type = "application/json"
    }
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = filename
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Current Holdings ────────────────────────────────────── */}
      {holdings.length > 0 && (
        <div>
          <div
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              paddingBottom: "12px", borderBottom: "1px solid var(--t-border)", marginBottom: "12px",
            }}
          >
            <Briefcase size={14} style={{ color: "var(--t-green)" }} />
            <span style={{ fontFamily: "var(--font-display), Syne, sans-serif", fontSize: "16px", fontWeight: 700, color: "var(--t-text)", letterSpacing: "-0.01em" }}>
              Current Holdings
            </span>
            <span className="t-badge t-badge-green">
              {holdings.length} POSITION{holdings.length !== 1 ? "S" : ""}
            </span>
            {results.remaining_cost != null && results.remaining_cost > 0 && (
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--t-muted)" }}>
                Cost base:{" "}
                <span style={{ color: "var(--t-text)", fontVariantNumeric: "tabular-nums" }}>
                  ${Number(results.remaining_cost).toFixed(2)}
                </span>
              </span>
            )}
          </div>
          <div className="t-card" style={{ overflowX: "auto" }}>
            <table className="t-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th style={{ textAlign: "right" }}>Qty Held</th>
                  <th style={{ textAlign: "right" }}>Avg Cost</th>
                  <th style={{ textAlign: "right" }}>Cost Base</th>
                  <th style={{ textAlign: "right" }}>Realized P&amp;L</th>
                  <th style={{ textAlign: "right" }}>P&amp;L %</th>
                  <th>First Bought</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map(h => {
                  const isHoldingGain = h.profit >= 0
                  return (
                    <tr key={h.symbol}>
                      <td className="sym">{h.symbol}</td>
                      <td style={{ color: "var(--t-muted)", fontSize: "11px" }}>{h.company ?? <span style={{ opacity: 0.3 }}>—</span>}</td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{h.quantity.toLocaleString()}</td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {h.averagePrice > 0 ? `$${Number(h.averagePrice).toFixed(4)}` : <span style={{ opacity: 0.3 }}>—</span>}
                      </td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                        {h.cost > 0 ? `$${Number(h.cost).toFixed(2)}` : <span style={{ opacity: 0.3 }}>—</span>}
                      </td>
                      <td className={h.profit ? (isHoldingGain ? "gain" : "loss") : ""} style={{ textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                        {h.profit ? `${isHoldingGain ? "+" : ""}$${Number(h.profit).toFixed(2)}` : <span style={{ opacity: 0.3 }}>—</span>}
                      </td>
                      <td className={h.profitPercent ? (h.profitPercent >= 0 ? "gain" : "loss") : ""} style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: "11px" }}>
                        {h.profitPercent ? `${h.profitPercent >= 0 ? "+" : ""}${Number(h.profitPercent).toFixed(1)}%` : <span style={{ opacity: 0.3 }}>—</span>}
                      </td>
                      <td style={{ color: "var(--t-muted)", fontVariantNumeric: "tabular-nums", fontSize: "11px" }}>
                        {h.dateInit ?? <span style={{ opacity: 0.3 }}>—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Analysis Results ─────────────────────────────────────── */}
      <div>
        {/* Header row */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            paddingBottom: "12px", borderBottom: "1px solid var(--t-border)", marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Activity size={14} style={{ color: "var(--t-amber)" }} />
            <span style={{ fontFamily: "var(--font-display), Syne, sans-serif", fontSize: "16px", fontWeight: 700, color: "var(--t-text)", letterSpacing: "-0.01em" }}>
              Analysis Results
            </span>
            <span className="t-badge t-badge-amber">{tradesCount} TRADES</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="t-btn t-btn-ghost t-btn-sm" onClick={() => downloadResults("csv")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Download size={11} /> CSV
            </button>
            <button className="t-btn t-btn-ghost t-btn-sm" onClick={() => downloadResults("json")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Download size={11} /> JSON
            </button>
          </div>
        </div>

        {/* ── Year selector ───────────────────────────────────────── */}
        {financialYears.length > 0 && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 14px", marginBottom: "14px",
              background: "var(--t-surface)", border: "1px solid var(--t-border)",
              flexWrap: "wrap",
            }}
          >
            <Calendar size={12} style={{ color: "var(--t-muted)", flexShrink: 0 }} />
            <span style={{ fontSize: "10px", color: "var(--t-muted)", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
              Tax Year
            </span>
            <button
              onClick={() => setSelectedYear("all")}
              className={`t-btn t-btn-sm ${selectedYear === "all" ? "t-btn-primary" : "t-btn-ghost"}`}
            >
              All Years
            </button>
            {financialYears.map(fy => (
              <button
                key={fy.key}
                onClick={() => setSelectedYear(fy.key)}
                className={`t-btn t-btn-sm ${selectedYear === fy.key ? "t-btn-primary" : "t-btn-ghost"}`}
              >
                {fy.label}
              </button>
            ))}
          </div>
        )}

        {/* ── KPI row ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
            gap: "1px", background: "var(--t-border)", marginBottom: "16px",
          }}
        >
          <div className="t-metric">
            <div className="t-metric-label">Net P&amp;L</div>
            <div className={`t-metric-value ${isProfit ? "gain" : "loss"}`}>
              {isProfit ? "+" : ""}${netPnL.toFixed(2)}
            </div>
            <div className="t-metric-sub" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {isProfit
                ? <><TrendingUp size={10} style={{ color: "var(--t-green)" }} /> Profitable</>
                : <><TrendingDown size={10} style={{ color: "var(--t-red)" }} /> Net loss</>
              }
            </div>
          </div>

          <div className="t-metric">
            <div className="t-metric-label">Gross Profit</div>
            <div className="t-metric-value gain">+${totalProfit.toFixed(2)}</div>
            <div className="t-metric-sub">Realized gains</div>
          </div>

          <div className="t-metric">
            <div className="t-metric-label">Gross Loss</div>
            <div className="t-metric-value loss">-${Math.abs(totalLoss).toFixed(2)}</div>
            <div className="t-metric-sub">Realized losses</div>
          </div>

          <div className="t-metric">
            <div className="t-metric-label">Win Rate</div>
            <div className="t-metric-value neutral">{winRate}%</div>
            <div className="t-metric-sub">{winCount}/{totalSymbols} symbols profitable</div>
          </div>

          {/* CGT Discount — show when a year is selected and discount exists */}
          {cgtDiscount != null && cgtDiscount !== 0 && (
            <div className="t-metric">
              <div className="t-metric-label">CGT Discount</div>
              <div className="t-metric-value gain">+${Number(cgtDiscount).toFixed(2)}</div>
              <div className="t-metric-sub">&gt;12 month eligible</div>
            </div>
          )}

          {/* Buy / Sell volumes when year selected */}
          {activeYear && activeYear.totalBuy > 0 && (
            <div className="t-metric">
              <div className="t-metric-label">Total Buy</div>
              <div className="t-metric-value neutral">${activeYear.totalBuy.toFixed(2)}</div>
              <div className="t-metric-sub">Capital deployed</div>
            </div>
          )}
          {activeYear && activeYear.totalSell > 0 && (
            <div className="t-metric">
              <div className="t-metric-label">Total Sell</div>
              <div className="t-metric-value neutral">${activeYear.totalSell.toFixed(2)}</div>
              <div className="t-metric-sub">Capital returned</div>
            </div>
          )}
        </div>

        {/* ── Data tabs ───────────────────────────────────────────── */}
        <div className="t-card">
          <div className="t-card-header" style={{ padding: "0", borderBottom: "none" }}>
            <div className="t-tabs" style={{ border: "none", borderBottom: "1px solid var(--t-border)", width: "100%", margin: 0 }}>
              <button className={`t-tab ${activeTab === "summary" ? "active" : ""}`} onClick={() => setActiveTab("summary")}>
                By Symbol
              </button>
              <button className={`t-tab ${activeTab === "trades" ? "active" : ""}`} onClick={() => setActiveTab("trades")}>
                All Trades {activeYear ? `(${filteredTrades.length})` : ""}
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            {/* ── By Symbol ── */}
            {activeTab === "summary" && (
              <table className="t-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th style={{ textAlign: "right" }}>Trades</th>
                    <th style={{ textAlign: "right" }}>Gain</th>
                    <th style={{ textAlign: "right" }}>Loss</th>
                    <th style={{ textAlign: "right" }}>Net P&amp;L</th>
                    {activeYear && <th style={{ textAlign: "right" }}>CGT Disc.</th>}
                    <th style={{ textAlign: "right" }}>Direction</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizedSymbolSummary.length === 0 ? (
                    <tr><td colSpan={7} style={{ color: "var(--t-muted)", padding: "18px 12px" }}>No data for this period.</td></tr>
                  ) : (
                    normalizedSymbolSummary.map(s => {
                      // For year view, pull richer data from yearSymbols
                      const yr = yearSymbols?.find(y => y.symbol === s.symbol)
                      const gain = yr ? yr.profitGain : (s.profitLoss > 0 ? s.profitLoss : 0)
                      const loss = yr ? yr.profitLoss : (s.profitLoss < 0 ? s.profitLoss : 0)
                      const net  = (gain || 0) + (loss || 0)
                      const disc = yr?.discount ?? null
                      return (
                        <tr key={s.symbol}>
                          <td className="sym">{s.symbol}</td>
                          <td style={{ textAlign: "right", color: "var(--t-muted)" }}>{s.tradeCount || <span style={{ opacity: 0.3 }}>—</span>}</td>
                          <td className="gain" style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                            {gain ? `+$${gain.toFixed(2)}` : <span style={{ opacity: 0.3 }}>—</span>}
                          </td>
                          <td className="loss" style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                            {loss ? `$${loss.toFixed(2)}` : <span style={{ opacity: 0.3 }}>—</span>}
                          </td>
                          <td className={net >= 0 ? "gain" : "loss"} style={{ textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                            {net >= 0 ? "+" : ""}${net.toFixed(2)}
                          </td>
                          {activeYear && (
                            <td className={disc ? "gain" : ""} style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: "11px" }}>
                              {disc ? `+$${disc.toFixed(2)}` : <span style={{ opacity: 0.3 }}>—</span>}
                            </td>
                          )}
                          <td style={{ textAlign: "right" }}>
                            {net >= 0
                              ? <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }} className="gain"><ArrowUpRight size={12} /> GAIN</span>
                              : <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }} className="loss"><ArrowDownRight size={12} /> LOSS</span>
                            }
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* ── All Trades ── */}
            {activeTab === "trades" && (
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
                  {filteredTrades.length === 0 ? (
                    <tr><td colSpan={6} style={{ color: "var(--t-muted)", padding: "18px 12px" }}>No trades for this period.</td></tr>
                  ) : (
                    filteredTrades.map((trade, i) => (
                      <tr key={i}>
                        <td style={{ color: "var(--t-muted)", fontVariantNumeric: "tabular-nums" }}>{trade.date}</td>
                        <td className="sym">{trade.symbol}</td>
                        <td className={trade.side === "buy" ? "buy" : "sell"} style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
                          {trade.side?.toUpperCase()}
                        </td>
                        <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{trade.quantity}</td>
                        <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                          ${Number.parseFloat(trade.price?.toString() ?? "0").toFixed(2)}
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
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
