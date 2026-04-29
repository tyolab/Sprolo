"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Loader2, Upload, File, X } from "lucide-react"
import { normalizeTradeData } from "@/lib/utils"

interface FileUploadFormProps {
  onCalculate: (data: {}) => void
  isLoading: boolean
  brokerName: string
}

export default function FileUploadForm({ onCalculate, isLoading, brokerName }: FileUploadFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
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
    if (e.dataTransfer.files?.length) setFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files))
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files.length) return

    let trades = {}
    for (const file of files) {
      const fileContent = await file.text()
      trades = normalizeTradeData(fileContent, brokerName, { trades })
    }
    onCalculate(trades)
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
