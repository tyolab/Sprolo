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

export interface CalculationResult {
  trades: Trade[]
  totalProfit: number
  totalLoss: number
  netPnL: number
  symbolSummary: SymbolSummary[]
}
