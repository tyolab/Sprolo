import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Trade, Trades } from "./types"

import * as brokers from "../shares-profit-loss-tax/brokers"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
    tradeData = brokers.normalizeData(csvContent, brokerName, { trades: tradeData});

    if (tradeData.length === 0) {
        throw new Error("No trade data could be extracted from the file.");
    }

    return tradeData;
}
