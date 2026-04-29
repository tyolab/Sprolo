import Papa from "papaparse";
import { Trade } from "./types";


export const normalizeCommSecData = (csvData: any[]): Trade[] => {
    // Normalization logic for CommSec CSV data
    // Adapt column names and data types as needed
    return csvData.map(row => ({
        date: new Date(row['Date']),
        symbol: row['Code'],
        type: row['Type'].toLowerCase() === 'buy' ? 'buy' : 'sell',
        quantity: parseInt(row['Quantity']),
        price: parseFloat(row['Unit Price ($)']),
        // ... other fields
    }));
};

export const normalizeFPMarketsData = (csvData: any[]): Trade[] => {
    // Normalization logic for FP Markets CSV data
    return csvData.map(row => ({
        date: new Date(row['Date']),
        symbol: row['Stock'],
        type: row['Buy or Sell'].toLowerCase() === 'buy' ? 'buy' : 'sell',
        quantity: parseInt(row['Volume']),
        price: parseFloat(row['Price']),
        // ... other fields
    }));
};

export const normalizeGenericData = (csvData: any[]): Trade[] => {
    // Best-guess normalization logic based on common headers
    return csvData.map(row => ({
        date: new Date(row['Date'] || row['Trade Date']),
        symbol: row['Symbol'] || row['Code'] || row['Stock'],
        type: (row['Type'] || row['Buy or Sell']).toLowerCase() === 'buy' ? 'buy' : 'sell',
        quantity: parseInt(row['Quantity'] || row['Volume']),
        price: parseFloat(row['Price'] || row['Unit Price ($)']),
        // ... other fields
    }));
};

export const identifyBroker = (csvContent: string): string | null => {
    // Simple identification based on header row content
    if (csvContent.includes("Code,Company,Date,Type,Quantity")) {
        return "commsec";
    } else if (csvContent.includes("Date,Reference,Details,B/S,Quantity,Code,Price")) {
        return "commsec"; // alternative commsec format
    } else if (csvContent.includes("ID,Date,Time,Account Code,Buy or Sell,Currency,Exchange,Stock,Volume,Price,Value")) {
        return "fpmarkets";
    }
    return null;
};

export const parseCSVContent = (csvContent: string): any[] => {
    const results = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    if (results.errors.length > 0) {
        console.error("CSV parsing errors:", results.errors);
        throw new Error("Failed to parse CSV content.");
    }
    return results.data as any[];
};