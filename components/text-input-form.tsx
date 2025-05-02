"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import Papa from "papaparse"
import type { Trade } from "@/lib/types"
import { normalizeTradeData } from "@/lib/utils"

interface TextInputFormProps {
  onCalculate: (data: Trade[]) => void
  isLoading: boolean
}

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

  const loadSampleData = () => {
    const sampleData = `symbol,side,quantity,price,date
AAPL,buy,10,150.25,2023-01-15
AAPL,sell,10,165.50,2023-02-20
MSFT,buy,5,280.10,2023-01-10
MSFT,sell,5,300.75,2023-03-05
TSLA,buy,3,190.25,2023-02-01
TSLA,sell,3,210.50,2023-04-10`

    setCsvText(sampleData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label htmlFor="csv-input" className="text-sm font-medium">
            Paste your CSV data below
          </label>
          <Button type="button" variant="outline" size="sm" onClick={loadSampleData}>
            Load Sample Data
          </Button>
        </div>

        <Textarea
          id="csv-input"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="symbol,side,quantity,price,date"
          className="font-mono h-64"
        />

        <Button type="submit" disabled={isLoading || !csvText.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Calculate Profit/Loss"
          )}
        </Button>
      </div>
    </form>
  )
}
