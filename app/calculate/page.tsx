"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronDown } from "lucide-react"
import FileUploadForm from "@/components/file-upload-form"
import TextInputForm from "@/components/text-input-form"
import ResultsDisplay from "@/components/results-display"
import type { CalculationResult, BrokerType } from "@/lib/types"

const BROKERS: { value: BrokerType; label: string }[] = [
  { value: "CommSec", label: "CommSec" },
  { value: "FPMarkets", label: "FP Markets" },
  { value: "Any", label: "Any Broker" },
]

export default function CalculatePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedBroker, setSelectedBroker] = useState<BrokerType>("Any")
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload")

  const handleCalculate = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trades: data, broker: selectedBroker }),
      })

      if (!response.ok) throw new Error("Failed to calculate results")

      const result = await response.json()
      setResults(result)
      localStorage.setItem("lastResult", JSON.stringify(result))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

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
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
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
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--t-text)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--t-muted)")}
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
            P&L Calculator
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
              size={12}
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

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Terminal window */}
        <div className="t-card" style={{ marginBottom: "24px" }}>
          {/* Window chrome */}
          <div
            className="t-card-header"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
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
          <div className="t-tabs" style={{ background: "rgba(0,0,0,0.2)", padding: "0 0" }}>
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

        {/* Error display */}
        {error && (
          <div
            style={{
              border: "1px solid rgba(255,53,80,0.4)",
              background: "rgba(255,53,80,0.06)",
              padding: "14px 16px",
              marginBottom: "24px",
              fontSize: "12px",
              color: "var(--t-red)",
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ fontWeight: 600, marginRight: "8px" }}>ERROR:</span>
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div
            style={{
              border: "1px solid var(--t-border)",
              background: "var(--t-surface)",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display), Syne, sans-serif",
                fontSize: "13px",
                color: "var(--t-amber)",
                letterSpacing: "0.1em",
              }}
              className="t-cursor"
            >
              PROCESSING TRADES
            </div>
          </div>
        )}

        {/* Results */}
        {results && !isLoading && (
          <div style={{ marginTop: "8px" }}>
            <ResultsDisplay results={results} />
          </div>
        )}
      </div>
    </div>
  )
}
