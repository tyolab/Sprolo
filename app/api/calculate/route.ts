import { NextResponse } from "next/server"
import type { Trade, CalculationResult, SymbolSummary, BrokerType } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { trades, broker = "Any" } = await request.json()

    // if (!trades || !Array.isArray(trades) || trades.length === 0) {
    //   return NextResponse.json({ error: "Invalid or empty trades data" }, { status: 400 })
    // }

    // Process the trades to calculate profit/loss
    const result = calculateProfitLoss(trades, broker)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calculating profit/loss:", error)
    return NextResponse.json({ error: "Failed to calculate profit/loss" }, { status: 500 })
  }
}

function calculateProfitLoss(trades: any, broker: BrokerType = "Any"): CalculationResult {
  console.log(`Calculating profit/loss using broker: ${broker}`)
  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Track positions and calculate P&L
  const positions: Record<string, { quantity: number; avgPrice: number }> = {}
  let totalProfit = 0
  let totalLoss = 0

  // Process each trade
  const processedTrades = sortedTrades.map((trade) => {
    const { symbol, side, quantity, price } = trade
    let profitLoss: number | undefined = undefined

    if (side === "buy") {
      // Update position when buying
      if (!positions[symbol]) {
        positions[symbol] = { quantity: 0, avgPrice: 0 }
      }

      const currentPosition = positions[symbol]
      const totalCost = currentPosition.quantity * currentPosition.avgPrice + quantity * price
      const newQuantity = currentPosition.quantity + quantity

      positions[symbol] = {
        quantity: newQuantity,
        avgPrice: totalCost / newQuantity,
      }
    } else if (side === "sell") {
      // Calculate profit/loss when selling
      if (positions[symbol] && positions[symbol].quantity > 0) {
        const avgPrice = positions[symbol].avgPrice
        profitLoss = (price - avgPrice) * quantity

        if (profitLoss >= 0) {
          totalProfit += profitLoss
        } else {
          totalLoss += profitLoss
        }

        // Update remaining position
        positions[symbol].quantity -= quantity
      }
    }

    return {
      ...trade,
      profitLoss,
    }
  })

  // Calculate symbol summary
  const symbolMap: Record<string, SymbolSummary> = {}

  processedTrades.forEach((trade) => {
    if (!symbolMap[trade.symbol]) {
      symbolMap[trade.symbol] = {
        symbol: trade.symbol,
        tradeCount: 0,
        profitLoss: 0,
      }
    }

    symbolMap[trade.symbol].tradeCount++

    if (trade.profitLoss) {
      symbolMap[trade.symbol].profitLoss += trade.profitLoss
    }
  })

  const symbolSummary = Object.values(symbolMap).sort((a, b) => b.profitLoss - a.profitLoss)

  return {
    trades: processedTrades,
    totalProfit,
    totalLoss,
    netPnL: totalProfit + totalLoss,
    symbolSummary,
  }
}
