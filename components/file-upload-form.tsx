"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import Papa from "papaparse"
import type { Trade } from "@/lib/types"
import { normalizeTradeData } from "@/lib/utils"

interface FileUploadFormProps {
  onCalculate: (data: Trade[]) => void
  isLoading: boolean
}

export default function FileUploadForm({ onCalculate, isLoading }: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const normalizedData = normalizeTradeData(results.data)
        onCalculate(normalizedData)
      },
      error: (error) => {
        console.error("Error parsing CSV:", error)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />

        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />

        <h3 className="text-lg font-medium mb-2">{file ? file.name : "Upload your CSV file"}</h3>

        <p className="text-sm text-muted-foreground mb-4">
          {file ? `${(file.size / 1024).toFixed(2)} KB - CSV File` : "Drag and drop your file here, or click to browse"}
        </p>

        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="mb-4">
          Select File
        </Button>

        {file && (
          <div className="mt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Calculate Profit/Loss"
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
