export type BrokerType = "CommSec" | "FPMarkets" | "Any"

export interface Trade {
  symbol: string
  side: "buy" | "sell"
  quantity: number
  price: number
  date: string
  profitLoss?: number
}

export interface SymbolSummary {
  symbol: string
  tradeCount: number
  profitLoss: number
}

export interface Trades {
  count: any
  symbols: Map<string, any>
  years: Set<number>
  first: any
  last: any
  broker: string
}

export interface HoldingEntry {
  symbol: string
  company: string | null
  quantity: number
  averagePrice: number
  cost: number
  profit: number
  profitPercent: number
  dateInit: string | null
}

export interface YearSymbolEntry {
  symbol: string
  profit: number
  profitGain: number
  profitLoss: number
  discount: number
  tradeCount: number
  cost: number
}

export interface FinancialYearResult {
  key: string           // e.g. "2023-2024"
  label: string         // e.g. "FY 2023-24"
  profit: number
  profitDiscount: number
  totalProfitGain: number
  totalProfitLoss: number
  netPnL: number
  totalTrades: number
  totalBuy: number
  totalSell: number
  totalCost: number
  symbols: YearSymbolEntry[]
}

export interface CalculationResult {
  trades: any
  totalProfit?: number
  totalLoss?: number
  netPnL?: number
  symbolSummary?: SymbolSummary[]
  financial_years?: Record<string, any>
  financialYears?: FinancialYearResult[]   // serialized, UI-ready
  holdings?: any[]
  symbols_count?: number
  first_trade?: string
  last_trade?: string
  remaining_cost?: number
}
