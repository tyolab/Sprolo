"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { CalculationResult } from "@/lib/types"

interface ResultsDisplayProps {
  results: CalculationResult
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState("summary")

  const downloadResults = (format: "csv" | "json") => {
    let content: string
    let filename: string
    let type: string

    if (format === "csv") {
      // Create CSV content
      const headers = "symbol,side,quantity,price,date,profit_loss\n"
      const rows = results.trades
        .map(
          (trade) =>
            `${trade.symbol},${trade.side},${trade.quantity},${trade.price},${trade.date},${trade.profitLoss || 0}`,
        )
        .join("\n")
      content = headers + rows
      filename = "trading-results.csv"
      type = "text/csv"
    } else {
      // Create JSON content
      content = JSON.stringify(results, null, 2)
      filename = "trading-results.json"
      type = "application/json"
    }

    // Create download link
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Results</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadResults("csv")}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadResults("json")}>
            <Download className="mr-2 h-4 w-4" />
            Download JSON
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className={results.netPnL >= 0 ? "border-green-500/50" : "border-red-500/50"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${results.netPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
              ${results.netPnL.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${results.totalProfit.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-red-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">${Math.abs(results.totalLoss).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="trades">All Trades</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Trades</TableHead>
                    <TableHead>Profit/Loss</TableHead>
                    <TableHead className="text-right">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.symbolSummary.map((summary) => (
                    <TableRow key={summary.symbol}>
                      <TableCell className="font-medium">{summary.symbol}</TableCell>
                      <TableCell>{summary.tradeCount}</TableCell>
                      <TableCell className={summary.profitLoss >= 0 ? "text-green-500" : "text-red-500"}>
                        ${summary.profitLoss.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {summary.profitLoss >= 0 ? (
                          <ArrowUpRight className="ml-auto h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="ml-auto h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Profit/Loss</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.trades.map((trade, index) => (
                    <TableRow
                      key={index}
                      className={trade.profitLoss ? (trade.profitLoss >= 0 ? "bg-green-500/5" : "bg-red-500/5") : ""}
                    >
                      <TableCell>{trade.date}</TableCell>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell className={trade.side === "buy" ? "text-blue-500" : "text-orange-500"}>
                        {trade.side.toUpperCase()}
                      </TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell>${Number.parseFloat(trade.price.toString()).toFixed(2)}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          trade.profitLoss ? (trade.profitLoss >= 0 ? "text-green-500" : "text-red-500") : ""
                        }`}
                      >
                        {trade.profitLoss ? `$${trade.profitLoss.toFixed(2)}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
