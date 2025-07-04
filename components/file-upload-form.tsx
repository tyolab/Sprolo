"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import Papa from "papaparse"
import type { Trade } from "@/lib/types"
import { normalizeTradeData } from "@/lib/utils"

interface FileUploadFormProps {
  onCalculate: (data: {}) => void
  isLoading: boolean
  brokerName: string
}

export default function FileUploadForm({ onCalculate, isLoading, brokerName }: FileUploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setErrorMessage(null) // Clear errors when new files are selected
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null) // Clear previous errors

    if (!files || files.length === 0) return

    
    let trades = {}
    try {
    for (const file of files) {
       if (!file.name.toLowerCase().endsWith(".csv")) {
        setErrorMessage(`Invalid file type: ${file.name}. Only CSV files are supported.`)
        return
      }

      let fileContent = await file.text()
      trades = normalizeTradeData(fileContent, brokerName, { trades });
    }
    } catch (error) {
      console.error("Error processing files:", error);
      setErrorMessage(error.message || "An error occurred while processing the files.")
    }
    
    // the data file(s) seem fine
    if (!errorMessage)
      onCalculate(trades)
    
    // Promise.all(
    //   files.map(file => {
    //     return new Promise<Trade[]>((resolve, reject) => {
    //       if (file.type === "text/csv" || file.name.endsWith(".csv")) {
    //         // Papa.parse(file, {
    //         //   header: true,
    //         //   complete: (results) => {
    //         //     try {
    //         //       const normalizedData = normalizeTradeData(results.data as any);
    //         //       resolve(normalizedData);
    //         //     } catch (error) {
    //         //       console.error("Error normalizing data:", error);
    //         //       reject(error);
    //         //     }
    //         //   },
    //         //   error: (error) => {
    //         //     console.error("Error parsing CSV:", error);
    //         //     reject(error);
    //         //   },
    //         // });
    //         // we are not using Papaparse to read the csv file
    //         trades = normalizeTradeData(await file.text(), brokerName, { trades })
    //       } else {
    //         reject(new Error("Invalid file type. Only CSV files are supported."));
    //       }
    //     });
    //   })
    // )
    // .then(allNormalizedData => {
    //   // Combine data from all files
    //   const combinedData: Trade[] = allNormalizedData.flat();
    //   onCalculate(combinedData);
    // })
    // .catch(error => {
    //   console.error("Error processing files:", error);
    //   // Handle the error, perhaps by setting an error state
    //   // and displaying a message to the user.
    // });
  }

  let totalFilesSize = 0
  if (files.length > 0)
  for (const file of files) {
    totalFilesSize += file.size
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? "border-primary bg-primary/5" : isLoading ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />

        {isLoading ? (
          <Loader2 className="h-10 w-10 mx-auto mb-4 text-primary animate-spin"/>
        ) : (
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground"/>
        )}

        <h3 className="text-lg font-medium mb-2">
          {isLoading ? "Processing..." : files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : "Upload your CSV file(s)"}
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          {files.length > 0
            ? isLoading 
              ? "Analyzing your trades, please wait..." 
              : `${(totalFilesSize / 1024).toFixed(2)} KB - CSV File(s) selected`
            : "Drag and drop your CSV file(s) here, or click to browse"
          }
        </p>

        {errorMessage && (
          <p className="text-sm text-red-500 mb-3">{errorMessage}</p>
        )}

        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()} 
          className="mb-4"
          disabled={isLoading}
        >
          Select Files
        </Button>

        {files.length > 0 && !isLoading && (
          <div className="mt-4">
            <Button type="submit" disabled={isLoading || files.length === 0}>
              Calculate Profit/Loss
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
