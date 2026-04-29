"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Loader2, Upload, File, X } from "lucide-react"
import type { Trades } from "@/lib/types"
import { normalizeTradeData } from "@/lib/utils"

interface FileUploadFormProps {
  onCalculate: (data: {}) => void
  isLoading: boolean
  brokerName: string
}

export default function FileUploadForm({ onCalculate, isLoading, brokerName }: FileUploadFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
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
    setErrorMessage(null)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setErrorMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!files || files.length === 0) return

    let trades: Trades | null = null
    try {
      for (const file of files) {
        if (!file.name.toLowerCase().endsWith(".csv")) {
          setErrorMessage(`Invalid file type: ${file.name}. Only CSV files are supported.`)
          return
        }
        const fileContent = await file.text()
        trades = normalizeTradeData(fileContent, brokerName, { trades })
      }
    } catch (error: any) {
      console.error("Error processing files:", error)
      setErrorMessage(error.message || "An error occurred while processing the files.")
      return
    }

    if (trades) {
      const symbols = trades.symbols && trades.symbols.size > 0
        ? Array.from(trades.symbols.entries())
        : []

      onCalculate({
        count: trades.count,
        trades: {
          ...trades,
          years: Array.from(trades.years || []),
          symbols,
        },
        broker: trades.broker || brokerName,
      })
    }
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  return (
    <form onSubmit={handleSubmit}>
      {/* Drop zone */}
      <div
        className={`t-dropzone ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        style={{ cursor: isLoading ? "default" : "pointer" }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <Loader2 size={32} style={{ color: "var(--t-amber)", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "11px", color: "var(--t-amber)", letterSpacing: "0.1em" }}>
              PROCESSING...
            </span>
          </div>
        ) : files.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <Upload size={28} style={{ color: "var(--t-muted)" }} />
            <div>
              <div style={{ fontSize: "13px", color: "var(--t-text)", marginBottom: "6px", fontWeight: 500 }}>
                Drop CSV files here
              </div>
              <div style={{ fontSize: "11px", color: "var(--t-muted)" }}>
                or click to browse — multiple files supported
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <File size={24} style={{ color: "var(--t-amber)" }} />
            <div style={{ fontSize: "12px", color: "var(--t-text)", fontWeight: 500 }}>
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </div>
            <div style={{ fontSize: "10px", color: "var(--t-muted)" }}>
              {(totalSize / 1024).toFixed(1)} KB total — click to change
            </div>
          </div>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && !isLoading && (
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {files.map((file, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(245,163,28,0.05)",
                border: "1px solid rgba(245,163,28,0.2)",
                fontSize: "11px",
              }}
            >
              <span style={{ color: "var(--t-amber)", fontWeight: 600, letterSpacing: "0.04em" }}>
                {file.name}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "var(--t-muted)" }}>{(file.size / 1024).toFixed(1)} KB</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t-muted)", padding: "0", display: "flex" }}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px 12px",
            border: "1px solid rgba(255,53,80,0.4)",
            background: "rgba(255,53,80,0.06)",
            fontSize: "11px",
            color: "var(--t-red)",
            letterSpacing: "0.02em",
          }}
        >
          <span style={{ fontWeight: 600, marginRight: "6px" }}>ERROR:</span>
          {errorMessage}
        </div>
      )}

      {/* Submit */}
      {files.length > 0 && !isLoading && (
        <div style={{ marginTop: "16px" }}>
          <button type="submit" className="t-btn t-btn-primary" style={{ width: "100%" }}>
            Calculate Profit / Loss
          </button>
        </div>
      )}
    </form>
  )
}
