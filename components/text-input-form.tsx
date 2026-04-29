"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, ClipboardPaste } from "lucide-react"
import Papa from "papaparse"
import type { Trade } from "@/lib/types"
import { normalizeTradeData } from "@/lib/utils"

interface TextInputFormProps {
  onCalculate: (data: Trade[]) => void
  isLoading: boolean
}

const SAMPLE_CSV = `symbol,side,quantity,price,date
AAPL,buy,10,150.25,2023-01-15
AAPL,sell,10,165.50,2023-02-20
MSFT,buy,5,280.10,2023-01-10
MSFT,sell,5,300.75,2023-03-05
TSLA,buy,3,190.25,2023-02-01
TSLA,sell,3,210.50,2023-04-10`

export default function TextInputForm({ onCalculate, isLoading }: TextInputFormProps) {
  const [csvText, setCsvText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvText.trim()) return

    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        const normalizedData = normalizeTradeData(results.data)
        onCalculate(normalizedData)
      },
      error: (error) => {
        console.error("Error parsing CSV:", error)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Label row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "10px", color: "var(--t-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            // Paste raw CSV
          </span>
          <button
            type="button"
            onClick={() => setCsvText(SAMPLE_CSV)}
            className="t-btn t-btn-ghost t-btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ClipboardPaste size={11} />
            Load Sample
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={`symbol,side,quantity,price,date\nAAPL,buy,10,150.25,2023-01-15\n...`}
          className="t-textarea"
          style={{ minHeight: "220px" }}
          spellCheck={false}
        />

        {/* Column hint */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {["symbol", "side", "quantity", "price", "date"].map((col) => (
            <span
              key={col}
              style={{
                fontSize: "9px",
                letterSpacing: "0.08em",
                color: "var(--t-muted)",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--t-border)",
                padding: "2px 8px",
              }}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !csvText.trim()}
          className="t-btn t-btn-primary"
          style={{ marginTop: "4px" }}
        >
          {isLoading ? (
            <>
              <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
              Processing...
            </>
          ) : (
            "Calculate Profit / Loss"
          )}
        </button>
      </div>
    </form>
  )
}
