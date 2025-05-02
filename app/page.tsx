import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">Trading Profit/Loss Calculator</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A simple tool to calculate your trading profits and losses from CSV data. Upload your trading history or paste
          CSV data to get instant insights.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/calculate">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/help">Learn More</Link>
          </Button>
        </div>

        <div className="mt-16 p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-4">
              <h3 className="font-medium text-lg mb-2">CSV Upload</h3>
              <p className="text-muted-foreground">Upload your trading history CSV file directly from your device.</p>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg mb-2">Paste Data</h3>
              <p className="text-muted-foreground">Alternatively, paste your CSV data directly into the text area.</p>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg mb-2">Detailed Analysis</h3>
              <p className="text-muted-foreground">
                Get comprehensive profit/loss metrics and trade-by-trade breakdown.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
