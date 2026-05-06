import { NextResponse } from "next/server"
import type { Trade, CalculationResult, SymbolSummary, BrokerType } from "@/lib/types"
import { processTradesWithRecords, brokers } from '../../../shares-profit-loss-tax/lib'
import { normalizeBrokerName } from "@/lib/utils"

function hydrateTrades(input: any) {
  const serializedTrades = input?.trades ? input.trades : input

  if (!serializedTrades) {
    throw new Error("Missing trade records")
  }

  const hydratedSymbols = new Map(
    (serializedTrades.symbols || []).map(([symbol, transactions]: [string, any[]]) => [
      symbol,
      (transactions || []).map((transaction) => ({
        ...transaction,
        date: transaction?.date ? new Date(transaction.date) : transaction?.date,
      })),
    ])
  )

  return {
    ...serializedTrades,
    symbols: hydratedSymbols,
    years: new Set(serializedTrades.years || []),
    first: serializedTrades.first ? new Date(serializedTrades.first) : null,
    last: serializedTrades.last ? new Date(serializedTrades.last) : null,
    count: serializedTrades.count ?? input?.count ?? 0,
    broker: serializedTrades.broker ?? input?.broker ?? null,
  }
}

function flattenTrades(hydratedTrades: any): Trade[] {
  return Array.from(hydratedTrades.symbols.entries())
    .flatMap(([symbol, transactions]: [string, any[]]) =>
      (transactions || []).map((transaction) => ({
        symbol,
        side: transaction.type,
        quantity: transaction.quantity,
        price: transaction.price,
        date: transaction.date instanceof Date ? transaction.date.toISOString().slice(0, 10) : String(transaction.date),
        profitLoss: undefined,
      }))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function buildSymbolSummary(result: any, hydratedTrades: any): SymbolSummary[] {
  const holdingsMap =
    result?.portfolio?.holdings instanceof Map
      ? result.portfolio.holdings
      : new Map()

  const symbolTradeCounts = new Map(
    Array.from(hydratedTrades.symbols?.entries?.() || []).map(([symbol, transactions]: [string, any[]]) => [
      symbol,
      (transactions || []).length,
    ])
  )

  return Array.from(holdingsMap.entries())
    .map(([symbol, holding]: [string, any]) => ({
      symbol,
      tradeCount:
        symbolTradeCounts.get(symbol) ||
        Array.from(holding?.trade_values?.values?.() || []).reduce(
          (sum: number, tradeValue: any) => sum + ((tradeValue?.transactions || []).length),
          0
        ) ||
        0,
      profitLoss: Number(holding?.profit || 0),
    }))
    .sort((a, b) => b.profitLoss - a.profitLoss)
}

function toCalculationResult(result: any, hydratedTrades: any): CalculationResult {
  const financialYearEntries = Object.entries(result?.financial_years || {})
  const primaryYear = financialYearEntries.length > 0
    ? financialYearEntries[financialYearEntries.length - 1][1] as any
    : null

  const trades = flattenTrades(hydratedTrades)
  const symbolSummary = buildSymbolSummary(result, hydratedTrades)
  const summaryProfit = symbolSummary
    .filter((item) => item.profitLoss > 0)
    .reduce((sum, item) => sum + item.profitLoss, 0)
  const summaryLoss = symbolSummary
    .filter((item) => item.profitLoss < 0)
    .reduce((sum, item) => sum + item.profitLoss, 0)
  const summaryNetPnL = symbolSummary.reduce((sum, item) => sum + item.profitLoss, 0)

  const financialYearProfit = Number(primaryYear?.total_profit_gain || 0)
  const financialYearLoss = Number(primaryYear?.total_profit_loss || 0)
  const financialYearNetPnL = Number(primaryYear?.profit || 0) + Number(primaryYear?.profit_discount || 0)
  const shouldUseSummaryTotals =
    symbolSummary.length > 0 &&
    financialYearProfit === 0 &&
    financialYearLoss === 0 &&
    financialYearNetPnL === 0

  const totalProfit = shouldUseSummaryTotals ? summaryProfit : financialYearProfit
  const totalLoss = shouldUseSummaryTotals ? summaryLoss : financialYearLoss
  const netPnL = shouldUseSummaryTotals ? summaryNetPnL : financialYearNetPnL

  const holdingsMap: Map<string, any> =
    result?.portfolio?.holdings instanceof Map
      ? result.portfolio.holdings
      : new Map()

  const holdings = Array.from(holdingsMap.entries() as Iterable<[string, any]>).map(([symbol, h]) => ({
    symbol,
    company: h?.company ?? null,
    quantity: Number(h?.quantity ?? 0),
    averagePrice: Number(h?.average_price ?? 0),
    cost: Number(h?.cost ?? 0),
    profit: Number(h?.profit ?? 0),
    profitPercent: Number(h?.profit_percent ?? 0),
    dateInit: h?.date_init instanceof Date ? h.date_init.toISOString().slice(0, 10) : (h?.date_init ?? null),
  })).filter((h) => h.quantity > 0)

  const remainingCost = holdings.reduce((sum, h) => sum + h.cost, 0)

  // Serialize financial_years — each year's total_symbols is a Map, convert to array
  const financialYears = Object.entries(result?.financial_years || {})
    .map(([key, fy]: [string, any]) => {
      const symbolsMap: Map<string, any> = fy?.total_symbols instanceof Map
        ? fy.total_symbols
        : new Map()
      const symbols = Array.from(symbolsMap.entries() as Iterable<[string, any]>).map(([symbol, s]) => ({
        symbol,
        profit: Number(s?.total_pl ?? 0),
        profitGain: Number(s?.total_profit_gain ?? 0),
        profitLoss: Number(s?.total_profit_loss ?? 0),
        discount: Number(s?.total_discount ?? 0),
        tradeCount: Number(s?.total_trades ?? 0),
        cost: Number(s?.total_cost ?? 0),
      })).sort((a, b) => b.profitGain - a.profitGain || a.profitLoss - b.profitLoss)

      const [startYear] = key.split("-")
      const endYear = String(Number(startYear) + 1).slice(-2)
      return {
        key,
        label: `FY ${startYear}-${endYear}`,
        profit: Number(fy?.profit ?? 0),
        profitDiscount: Number(fy?.profit_discount ?? 0),
        totalProfitGain: Number(fy?.total_profit_gain ?? 0),
        totalProfitLoss: Number(fy?.total_profit_loss ?? 0),
        netPnL: Number(fy?.profit ?? 0) + Number(fy?.profit_discount ?? 0),
        totalTrades: Number(fy?.total_trades ?? 0),
        totalBuy: Number(fy?.total_buy ?? 0),
        totalSell: Number(fy?.total_sell ?? 0),
        totalCost: Number(fy?.total_cost ?? 0),
        symbols,
      }
    })
    .sort((a, b) => a.key.localeCompare(b.key))

  return {
    ...result,
    trades,
    totalProfit,
    totalLoss,
    netPnL,
    symbolSummary,
    financialYears,
    holdings,
    symbols_count: result?.symbols_count || symbolSummary.length,
    first_trade: result?.first_trade,
    last_trade: result?.last_trade,
    remaining_cost: remainingCost || result?.remaining_cost || 0,
  }
}

export async function POST(request: Request) {
  try {
    const { trades, broker = "Any", options } = await request.json()
    const hydratedTrades = hydrateTrades(trades)
    const requestedBrokerName = normalizeBrokerName(broker)
    const parsedBrokerName = normalizeBrokerName(hydratedTrades?.broker)
    const resolvedBrokerName = requestedBrokerName ?? parsedBrokerName
    const resolvedBroker = brokers.get_broker(resolvedBrokerName, options)

    if (!resolvedBroker) {
      throw new Error(`Unsupported broker: ${broker}`)
    }

    // if (!trades || !Array.isArray(trades) || trades.length === 0) {
    //   return NextResponse.json({ error: "Invalid or empty trades data" }, { status: 400 })
    // }

    // Process the trades to calculate profit/loss
    // const result = calculateProfitLoss(trades, broker)
    const rawResult = processTradesWithRecords(hydratedTrades, resolvedBroker, options)
    const result = toCalculationResult(rawResult, hydratedTrades)

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
