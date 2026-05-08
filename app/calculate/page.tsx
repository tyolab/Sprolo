"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ChevronDown, Plus } from "lucide-react"
import FileUploadForm from "@/components/file-upload-form"
import TextInputForm from "@/components/text-input-form"
import PortfolioSidebar from "@/components/portfolio-sidebar"
import type { CalculationResult, BrokerType } from "@/lib/types"
import {
  loadPortfolios,
  savePortfolio,
  createPortfolioFromResult,
  type Portfolio,
} from "@/lib/portfolio-store"

const BROKERS: { value: BrokerType; label: string }[] = [
  { value: "CommSec", label: "CommSec" },
  { value: "FPMarkets", label: "FP Markets" },
  { value: "Any", label: "Any Broker" },
]

type SaveMode = "replace" | "append"

function rebuildSourceTradesFromPortfolio(portfolio?: Portfolio | undefined) {
  const existingTrades = Array.isArray(portfolio?.result?.trades) ? portfolio.result.trades : []
  if (existingTrades.length === 0) {
    return null
  }

  const symbolsMap = new Map<string, any[]>()
  const years = new Set<number>()
  let first: string | null = null
  let last: string | null = null

  for (const trade of existingTrades) {
    const symbol = trade?.symbol
    const date = trade?.date
    if (!symbol || !date) continue

    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) continue

    years.add(parsedDate.getFullYear())
    const isoDate = parsedDate.toISOString()
    if (!first || parsedDate.getTime() < new Date(first).getTime()) first = isoDate
    if (!last || parsedDate.getTime() > new Date(last).getTime()) last = isoDate

    const current = symbolsMap.get(symbol) || []
    current.push({
      symbol,
      type: trade.side,
      quantity: trade.quantity,
      price: trade.price,
      date: isoDate,
    })
    symbolsMap.set(symbol, current)
  }

  if (symbolsMap.size === 0) {
    return null
  }

  return {
    count: existingTrades.length,
    broker: portfolio?.broker || null,
    trades: {
      count: existingTrades.length,
      broker: portfolio?.broker || null,
      years: Array.from(years).sort(),
      symbols: Array.from(symbolsMap.entries()),
      first,
      last,
    },
  }
}

function toSerializedTradeBundle(input: any) {
  const serializedTrades = input?.trades ? input.trades : input

  return {
    count: serializedTrades?.count ?? input?.count ?? 0,
    broker: serializedTrades?.broker ?? input?.broker ?? null,
    trades: {
      ...serializedTrades,
      count: serializedTrades?.count ?? input?.count ?? 0,
      broker: serializedTrades?.broker ?? input?.broker ?? null,
      years: Array.isArray(serializedTrades?.years) ? serializedTrades.years : [],
      symbols: Array.isArray(serializedTrades?.symbols) ? serializedTrades.symbols : [],
      first: serializedTrades?.first ?? null,
      last: serializedTrades?.last ?? null,
    },
  }
}

function mergeSerializedTradeInputs(existingInput: any, incomingInput: any) {
  const existing = toSerializedTradeBundle(existingInput)
  const incoming = toSerializedTradeBundle(incomingInput)

  const mergedSymbols = new Map<string, any[]>()

  for (const [symbol, transactions] of [...existing.trades.symbols, ...incoming.trades.symbols]) {
    const current = mergedSymbols.get(symbol) || []
    mergedSymbols.set(symbol, current.concat(transactions || []))
  }

  mergedSymbols.forEach((transactions, symbol) => {
    mergedSymbols.set(
      symbol,
      [...transactions].sort((a, b) => new Date(a?.date ?? 0).getTime() - new Date(b?.date ?? 0).getTime())
    )
  })

  const mergedYears = Array.from(new Set([...(existing.trades.years || []), ...(incoming.trades.years || [])])).sort()
  const firstDates = [existing.trades.first, incoming.trades.first].filter(Boolean).map((value) => new Date(value))
  const lastDates = [existing.trades.last, incoming.trades.last].filter(Boolean).map((value) => new Date(value))

  return {
    count: Number(existing.count || 0) + Number(incoming.count || 0),
    broker: incoming.broker || existing.broker,
    trades: {
      ...existing.trades,
      ...incoming.trades,
      count: Number(existing.count || 0) + Number(incoming.count || 0),
      broker: incoming.broker || existing.broker,
      years: mergedYears,
      symbols: Array.from(mergedSymbols.entries()),
      first: firstDates.length > 0 ? new Date(Math.min(...firstDates.map((date) => date.getTime()))).toISOString() : null,
      last: lastDates.length > 0 ? new Date(Math.max(...lastDates.map((date) => date.getTime()))).toISOString() : null,
    },
  }
}

function CalculateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedBroker, setSelectedBroker] = useState<BrokerType>("Any")
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload")
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  // "new" = create new portfolio, or a portfolio id = overwrite that one
  const [targetPortfolioId, setTargetPortfolioId] = useState<string>("new")
  const [saveMode, setSaveMode] = useState<SaveMode>("replace")

  useEffect(() => {
    const currentPortfolios = loadPortfolios()
    setPortfolios(currentPortfolios)

    const queryTarget = searchParams.get("target")
    const queryMode = searchParams.get("mode")

    if (queryTarget && currentPortfolios.some((portfolio) => portfolio.id === queryTarget)) {
      setTargetPortfolioId(queryTarget)
      if (queryMode === "append" || queryMode === "replace") {
        setSaveMode(queryMode)
      }
    }
  }, [searchParams])

  const handleCalculate = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const currentList = loadPortfolios()
      const isOverwrite = targetPortfolioId !== "new"
      const existing = isOverwrite ? currentList.find((p) => p.id === targetPortfolioId) : undefined

      let calculationInput = data
      if (isOverwrite && saveMode === "append") {
        const baseTrades = existing?.sourceTrades || rebuildSourceTradesFromPortfolio(existing)
        if (!baseTrades) {
          throw new Error("This portfolio does not contain usable trade history for append mode.")
        }
        calculationInput = mergeSerializedTradeInputs(baseTrades, data)
      }

      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trades: calculationInput, broker: selectedBroker }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody?.error || "Failed to calculate results")
      }

      const result: CalculationResult = await response.json()

      const portfolio = createPortfolioFromResult(
        result,
        selectedBroker,
        currentList,
        isOverwrite ? targetPortfolioId : undefined,
        existing?.name,
        calculationInput,
      )

      savePortfolio(portfolio)
      window.dispatchEvent(new CustomEvent("portfolios-updated"))
      router.push(`/portfolio/${portfolio.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const hasPortfolios = portfolios.length > 0
  const isExistingTarget = targetPortfolioId !== "new"

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      <PortfolioSidebar onPortfoliosChange={setPortfolios} />

      {/* Main content */}
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
              <ArrowLeft size={12} />
              HOME
            </Link>
            <span style={{ color: "var(--t-border)" }}>|</span>
            <span
              style={{
                fontFamily: "var(--font-display), Syne, sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--t-text)",
                letterSpacing: "-0.01em",
              }}
            >
              New Calculation
            </span>
          </div>

          {/* Broker selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "10px", color: "var(--t-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Broker
            </span>
            <div style={{ position: "relative" }}>
              <select
                value={selectedBroker}
                onChange={(e) => setSelectedBroker(e.target.value as BrokerType)}
                className="t-select"
                style={{ paddingRight: "28px", minWidth: "130px" }}
              >
                {BROKERS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
              <ChevronDown
                size={11}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--t-muted)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Form area */}
        <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", padding: "32px 32px" }}>
          {/* Portfolio target selector */}
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              border: "1px solid var(--t-border)",
              background: "var(--t-surface)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "var(--t-muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              Save to
            </span>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1 }}>
              {/* New portfolio option */}
              <button
                type="button"
                onClick={() => setTargetPortfolioId("new")}
                className={`t-btn t-btn-sm ${targetPortfolioId === "new" ? "t-btn-primary" : "t-btn-ghost"}`}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Plus size={11} />
                New Portfolio
              </button>

              {/* Existing portfolios */}
              {hasPortfolios && portfolios.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTargetPortfolioId(p.id)}
                  className={`t-btn t-btn-sm ${targetPortfolioId === p.id ? "t-btn-outline" : "t-btn-ghost"}`}
                  style={{
                    maxWidth: "180px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={p.name}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {isExistingTarget && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setSaveMode("replace")}
                  className={`t-btn t-btn-sm ${saveMode === "replace" ? "t-btn-primary" : "t-btn-ghost"}`}
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => setSaveMode("append")}
                  className={`t-btn t-btn-sm ${saveMode === "append" ? "t-btn-outline" : "t-btn-ghost"}`}
                >
                  Append Trades
                </button>
              </div>
            )}
          </div>

          {/* Terminal window */}
          <div className="t-card">
            {/* Window chrome */}
            <div className="t-card-header" style={{ background: "rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF5F56" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FFBD2E" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#27C93F" }} />
                <span style={{ marginLeft: "10px" }} className="label">INPUT TERMINAL</span>
              </div>
              <span className="t-badge t-badge-amber">
                {selectedBroker === "Any" ? "AUTO-DETECT" : selectedBroker.toUpperCase()}
              </span>
            </div>

            {/* Tabs */}
            <div className="t-tabs" style={{ background: "rgba(0,0,0,0.2)" }}>
              <button
                className={`t-tab ${activeTab === "upload" ? "active" : ""}`}
                onClick={() => setActiveTab("upload")}
              >
                Upload CSV
              </button>
              <button
                className={`t-tab ${activeTab === "paste" ? "active" : ""}`}
                onClick={() => setActiveTab("paste")}
              >
                Paste Data
              </button>
            </div>

            {/* Tab content */}
            <div style={{ padding: "24px" }}>
              {activeTab === "upload" ? (
                <FileUploadForm onCalculate={handleCalculate} isLoading={isLoading} brokerName={selectedBroker} />
              ) : (
                <TextInputForm onCalculate={handleCalculate} isLoading={isLoading} />
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: "16px",
                border: "1px solid rgba(224,52,152,0.4)",
                background: "rgba(224,52,152,0.06)",
                padding: "12px 16px",
                fontSize: "12px",
                color: "var(--t-red)",
                letterSpacing: "0.02em",
              }}
            >
              <span style={{ fontWeight: 600, marginRight: "8px" }}>ERROR:</span>
              {error}
            </div>
          )}

          {/* Processing */}
          {isLoading && (
            <div
              style={{
                marginTop: "16px",
                border: "1px solid var(--t-border)",
                background: "var(--t-surface)",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div
                className="t-cursor"
                style={{
                  fontFamily: "var(--font-display), Syne, sans-serif",
                  fontSize: "13px",
                  color: "var(--t-amber)",
                  letterSpacing: "0.1em",
                }}
              >
                PROCESSING TRADES
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CalculatePage() {
  return (
    <Suspense fallback={null}>
      <CalculateContent />
    </Suspense>
  )
}
