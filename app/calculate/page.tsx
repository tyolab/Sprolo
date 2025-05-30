"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import FileUploadForm from "@/components/file-upload-form"
import TextInputForm from "@/components/text-input-form"
import ResultsDisplay from "@/components/results-display"
import type { Trade, CalculationResult, BrokerType } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CalculatePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedBroker, setSelectedBroker] = useState<BrokerType>("Any")

  const handleCalculate = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trades: data, broker: selectedBroker }),
      })

      if (!response.ok) {
        throw new Error("Failed to calculate results")
      }

      const result = await response.json()
      setResults(result)

      // Save to localStorage for quick re-access
      localStorage.setItem("lastResult", JSON.stringify(result))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Load last result from localStorage on component mount
  useState(() => {
    const savedResult = localStorage.getItem("lastResult")
    if (savedResult) {
      try {
        setResults(JSON.parse(savedResult))
      } catch (e) {
        console.error("Failed to parse saved result")
      }
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Calculate Profit/Loss</h1>

        <Card>
          <CardContent className="pt-6">
          <div className="flex justify-end items-center mt-4">
              <div className="mr-4">
                <Select value={selectedBroker} onValueChange={(value) => setSelectedBroker(value as BrokerType)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select broker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CommSec">CommSec</SelectItem>
                    <SelectItem value="FPMarkets">FP Markets</SelectItem>
                    <SelectItem value="Any">Any Broker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
              <Tabs defaultValue="upload" className="flex-1">
                <TabsList>
                  <TabsTrigger value="upload">Upload CSV</TabsTrigger>
                  <TabsTrigger value="paste">Paste Data</TabsTrigger>
                </TabsList>
              

              <TabsContent value="upload">
                <FileUploadForm onCalculate={handleCalculate} isLoading={isLoading} brokerName={selectedBroker} />
              </TabsContent>

              <TabsContent value="paste">
                <TextInputForm onCalculate={handleCalculate} isLoading={isLoading} />
            </TabsContent>
            </Tabs>

          </CardContent>
        </Card>

        {error && <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-md">{error}</div>}

        {results && !isLoading && (
          <div className="mt-8">
            <ResultsDisplay results={results} />
          </div>
        )}
      </div>
    </div>
  )
}
