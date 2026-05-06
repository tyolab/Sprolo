import type { CalculationResult } from "./types"

export interface Portfolio {
  id: string
  name: string
  broker: string
  createdAt: string
  updatedAt: string
  result: CalculationResult
  // Snapshot summaries for sidebar display (avoids re-parsing full result)
  netPnL: number
  tradeCount: number
  holdingCount: number
  remainingCost: number
}

const STORAGE_KEY = "sprolo_portfolios"

export function loadPortfolios(): Portfolio[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Portfolio[]) : []
  } catch {
    return []
  }
}

export function getPortfolio(id: string): Portfolio | null {
  return loadPortfolios().find((p) => p.id === id) ?? null
}

export function savePortfolio(portfolio: Portfolio): void {
  const list = loadPortfolios()
  const idx = list.findIndex((p) => p.id === portfolio.id)
  if (idx >= 0) {
    list[idx] = { ...portfolio, updatedAt: new Date().toISOString() }
  } else {
    list.push(portfolio)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function deletePortfolio(id: string): void {
  const list = loadPortfolios().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function createPortfolioFromResult(
  result: CalculationResult,
  broker: string,
  existingPortfolios: Portfolio[],
  overrideId?: string,
  overrideName?: string,
): Portfolio {
  const id = overrideId ?? Date.now().toString()
  const index = overrideId
    ? existingPortfolios.findIndex((p) => p.id === overrideId) + 1
    : existingPortfolios.length + 1

  const brokerLabel = broker && broker !== "Any" ? broker : "Auto"
  const name = overrideName ?? `Portfolio ${index}: ${brokerLabel}`

  // holdings are serialized HoldingEntry objects (quantity > 0 already filtered in API)
  const holdings = Array.isArray(result.holdings)
    ? (result.holdings as any[]).filter((h: any) => h.quantity !== undefined)
    : []
  const trades = Array.isArray(result.trades) ? result.trades : []

  return {
    id,
    name,
    broker: brokerLabel,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    result,
    netPnL: result.netPnL ?? 0,
    tradeCount: trades.length || (result.trades as any)?.count || 0,
    holdingCount: holdings.length,
    remainingCost: result.remaining_cost ?? 0,
  }
}
