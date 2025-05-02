import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6">CSV Format Guidelines</h1>

        <div className="prose max-w-none dark:prose-invert">
          <p>To use the Trading Profit/Loss Calculator, your CSV data should follow this format:</p>

          <h2>Required Columns</h2>
          <ul>
            <li>
              <strong>symbol</strong> - The trading symbol or ticker (e.g., AAPL, BTC-USD)
            </li>
            <li>
              <strong>side</strong> - Buy or Sell
            </li>
            <li>
              <strong>quantity</strong> - Number of shares/units
            </li>
            <li>
              <strong>price</strong> - Price per share/unit
            </li>
            <li>
              <strong>date</strong> - Date of the trade (YYYY-MM-DD format)
            </li>
          </ul>

          <h2>Example CSV</h2>
          <pre className="p-4 bg-muted rounded-md overflow-x-auto">
            {`symbol,side,quantity,price,date
AAPL,buy,10,150.25,2023-01-15
AAPL,sell,10,165.50,2023-02-20
MSFT,buy,5,280.10,2023-01-10
MSFT,sell,5,300.75,2023-03-05
TSLA,buy,3,190.25,2023-02-01
TSLA,sell,3,210.50,2023-04-10`}
          </pre>

          <h2>Tips for Preparing Your Data</h2>
          <ul>
            <li>Ensure your CSV has a header row with the column names</li>
            <li>Check that all required columns are present</li>
            <li>Make sure numeric values don't have currency symbols</li>
            <li>Dates should be in YYYY-MM-DD format for best compatibility</li>
          </ul>

          <h2>Sample Data</h2>
          <p>
            You can use the example CSV above to test the calculator. Simply copy and paste it into the text area on the
            Calculate page.
          </p>

          <div className="mt-6">
            <Button asChild>
              <Link href="/calculate">Go to Calculator</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
