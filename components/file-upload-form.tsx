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
  isLoading: boolean,
  brokerName: string
}

export default function FileUploadForm({ onCalculate, isLoading, brokerName }: FileUploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
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
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  }

  const handleFiles = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!files || files.length === 0) return

    
    let trades = {}
    for (const file of files) {
      let fileContent = await file.text()
      trades = normalizeTradeData(fileContent, brokerName, { trades });
    }
    
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
          {isLoading ? "Processing..." : files.length > 0 ? `${files.length} files selected` : "Upload your CSV file(s)"}
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          {files 
            ? isLoading 
              ? "Analyzing your trades, please wait..." 
              : `${(totalFilesSize / 1024).toFixed(2)} KB - CSV File(s)`
            : "Drag and drop your file here, or click to browse"
          }
        </p>

        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()} 
          className="mb-4 "
          disabled={isLoading}
        >
          Select Files
        </Button>

        {files && !isLoading && (
          <div className="mt-4">
            <Button type="submit">
              Calculate Profit/Loss
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
