import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Trade, Trades } from "./types"

import * as brokers from "../shares-profit-loss-tax/brokers"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeBrokerName(brokerName?: string | null): string | null {
  if (!brokerName) return null

  switch (brokerName.trim().toLowerCase()) {
    case "any":
    case "any broker":
    case "auto-detect":
    case "autodetect":
      return null
    case "commsec":
      return "commsec"
    case "fpmarkets":
    case "fp markets":
      return "fpmarkets"
    default:
      return brokerName.trim().toLowerCase()
  }
}

export function resolveBrokerName(csvContent: string, brokerName?: string | null): string {
  const normalizedBroker = normalizeBrokerName(brokerName)

  if (normalizedBroker) {
    return normalizedBroker
  }

  const detectedBroker = brokers.identifyBroker(csvContent)
  if (!detectedBroker) {
    throw new Error("Could not identify broker from CSV content. Please specify broker name.")
  }

  return detectedBroker
}

// export function normalizeTradeData(data: any[]): Trade[] {
//   return data
//     .map((item) => {
//       // Handle different possible column names
//       const symbol = item.symbol || item.ticker || item.asset || ""
//       const side = (item.side || item.type || item.action || "").toLowerCase()
//       const quantity = Number.parseFloat(item.quantity || item.amount || item.shares || item.units || 0)
//       const price = Number.parseFloat(item.price || item.cost || item.value || 0)
//       const date = item.date || item.timestamp || item.time || ""

//       return {
//         symbol,
//         side: side === "buy" || side === "b" ? "buy" : "sell",
//         quantity,
//         price,
//         date,
//       }
//     })
//     .filter(
//       (item) =>
//         // Filter out invalid entries
//         item.symbol &&
//         (item.side === "buy" || item.side === "sell") &&
//         !isNaN(item.quantity) &&
//         !isNaN(item.price) &&
//         item.date,
//     )
// }

export function normalizeTradeData(csvContent: string, brokerName: string, options: any): Trades {
  options = options || {};

  let tradeData: Trades = options.trades;
  const resolvedBrokerName = resolveBrokerName(csvContent, brokerName)

    // const broker = identifyBroker(csvContent);
    // const parsedData = parseCSVContent(csvContent);

    // switch (broker) {
    //     case "commsec":
    //         tradeData = normalizeCommSecData(parsedData);
    //         break;
    //     case "fpmarkets":
    //         tradeData = normalizeFPMarketsData(parsedData);
    //         break;
    //     default:
    //         tradeData = normalizeGenericData(parsedData);
    //         break;
    // }
    const normalized = brokers.normalizeData(csvContent, resolvedBrokerName, { trades: tradeData});
    const normalizedTrades = normalized?.trades ?? normalized
    const normalizedCount = typeof normalized?.count === "number" ? normalized.count : 0

    tradeData = normalizedTrades
    tradeData.symbols = tradeData.symbols || new Map()
    tradeData.years = tradeData.years || new Set()
    tradeData.count = (tradeData.count || 0) + normalizedCount

    tradeData.broker = resolvedBrokerName

    if (tradeData.symbols.size === 0) {
        throw new Error("No trade data could be extracted from the file.");
    }

    return tradeData;
}
