"use client"

import Link from "next/link"
import type React from "react"
import { useMemo, useState } from "react"
import { ArrowLeft, Paperclip, Send } from "lucide-react"

const ISSUE_TYPES = [
  "Request New Feature(s)",
  "Request New Broker Support",
  "Report Bug(s)",
  "General Support",
  "Billing / Access Question",
  "Other",
]

const MAX_FILES = 5
const MAX_FILE_SIZE_MB = 10

function Panel({
  title,
  description,
  active = false,
}: {
  title: string
  description: string
  active?: boolean
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        border: `1px solid ${active ? "rgba(0, 122, 199, 0.45)" : "var(--t-border)"}`,
        background: active ? "rgba(0, 122, 199, 0.08)" : "var(--t-surface)",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: active ? "var(--t-text)" : "var(--t-amber)",
          fontWeight: 700,
          letterSpacing: "0.05em",
          marginBottom: "6px",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.7 }}>{description}</div>
    </div>
  )
}

export default function SupportPage() {
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: ISSUE_TYPES[0],
    message: "",
  })

  const selectedDescription = useMemo(() => {
    switch (form.subject) {
      case "Request New Feature(s)":
        return "Tell us what workflow you want added and how you expect it to behave."
      case "Request New Broker Support":
        return "Include the broker name and, if possible, the CSV export format or a sample column layout."
      case "Report Bug(s)":
        return "Include what you did, what you expected, and what happened instead."
      case "Billing / Access Question":
        return "Use this for licensing, access, or account-related questions."
      case "General Support":
        return "Use this for usage help, portfolio flow questions, or result interpretation."
      default:
        return "Use this for any request that does not fit the other categories."
    }
  }, [form.subject])

  const updateField = (field: "name" | "email" | "subject" | "message", value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const onFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])

    if (selectedFiles.length > MAX_FILES) {
      setStatus({ type: "error", message: `Please attach no more than ${MAX_FILES} files.` })
      event.target.value = ""
      return
    }

    const oversizedFile = selectedFiles.find((file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    if (oversizedFile) {
      setStatus({ type: "error", message: `${oversizedFile.name} exceeds the ${MAX_FILE_SIZE_MB}MB limit.` })
      event.target.value = ""
      return
    }

    setStatus(null)
    setFiles(selectedFiles)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    const name = form.name.trim()
    const email = form.email.trim()
    const subject = form.subject.trim()
    const message = form.message.trim()

    if (!name || !email || !message) {
      setStatus({ type: "error", message: "Please complete your name, email, and message." })
      return
    }

    if (!email.includes("@") || !email.includes(".") || email.length < 5) {
      setStatus({ type: "error", message: "Please enter a valid email address." })
      return
    }

    if (name.length < 2) {
      setStatus({ type: "error", message: "Please enter your name." })
      return
    }

    if (message.length < 10) {
      setStatus({ type: "error", message: "Please enter a message of at least 10 characters." })
      return
    }

    if (files.length > MAX_FILES) {
      setStatus({ type: "error", message: `Please attach no more than ${MAX_FILES} files.` })
      return
    }

    const payload = new FormData()
    payload.set("name", name)
    payload.set("email", email)
    payload.set("subject", subject)
    payload.set("message", message)
    payload.set("source", "sprolo-support-page")

    for (const file of files) {
      payload.append("file", file)
    }

    setSending(true)

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        body: payload,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || `Support request failed with status ${response.status}`)
      }

      setStatus({ type: "success", message: "Your support request was submitted successfully." })
      setForm({
        name: "",
        email: "",
        subject: ISSUE_TYPES[0],
        message: "",
      })
      setFiles([])
      const input = document.getElementById("support-files") as HTMLInputElement | null
      if (input) input.value = ""
    } catch (error) {
      console.error(error)
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again later.",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--t-bg)" }}>
      <div
        style={{
          borderBottom: "1px solid var(--t-border)",
          background: "var(--t-surface)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--t-muted)",
            textDecoration: "none",
            fontSize: "11px",
            letterSpacing: "0.08em",
          }}
        >
          <ArrowLeft size={13} />
          HOME
        </Link>
        <span style={{ color: "var(--t-border)" }}>|</span>
        <span
          style={{
            fontFamily: "var(--font-display), Syne, sans-serif",
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--t-text)",
            letterSpacing: "-0.01em",
          }}
        >
          Support
        </span>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "48px 32px 56px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(300px, 0.8fr)",
          gap: "48px",
          alignItems: "start",
        }}
      >
        <div>
          <div className="t-section-label" style={{ marginBottom: "24px" }}>Support Desk</div>

          <h1
            style={{
              fontFamily: "var(--font-display), Syne, sans-serif",
              fontSize: "36px",
              fontWeight: 800,
              color: "var(--t-text)",
              letterSpacing: "-0.03em",
              marginBottom: "18px",
              lineHeight: 1.1,
            }}
          >
            Contact Us
            <br />
            <span style={{ color: "var(--t-amber)" }}>About Sprolo</span>
          </h1>

          <p style={{ fontSize: "13px", color: "var(--t-muted)", lineHeight: 1.9, maxWidth: "780px", marginBottom: "28px" }}>
            Use this page to request new features, request broker support, or report issues with calculations, CSV parsing,
            or portfolio workflows. Messages are sent from the server, and you can attach sample files when useful.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "24px" }}>
            <Panel title="New Features" description="Describe the workflow, expected result, and where it should appear in the product." active={form.subject === "Request New Feature(s)"} />
            <Panel title="Broker Support" description="Request a new broker import path and include CSV headers or export details if available." active={form.subject === "Request New Broker Support"} />
            <Panel title="Bug Reports" description="Share reproduction steps, observed output, and the correct expected behavior." active={form.subject === "Report Bug(s)"} />
          </div>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div>
                <label
                  htmlFor="support-name"
                  style={{ display: "block", marginBottom: "8px", fontSize: "11px", letterSpacing: "0.08em", color: "var(--t-muted)", textTransform: "uppercase" }}
                >
                  Name
                </label>
                <input
                  id="support-name"
                  name="name"
                  type="text"
                  className="t-input"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  autoComplete="name"
                />
              </div>

              <div>
                <label
                  htmlFor="support-email"
                  style={{ display: "block", marginBottom: "8px", fontSize: "11px", letterSpacing: "0.08em", color: "var(--t-muted)", textTransform: "uppercase" }}
                >
                  Email
                </label>
                <input
                  id="support-email"
                  name="email"
                  type="email"
                  className="t-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="support-subject"
                style={{ display: "block", marginBottom: "8px", fontSize: "11px", letterSpacing: "0.08em", color: "var(--t-muted)", textTransform: "uppercase" }}
              >
                Request Type
              </label>
              <select
                id="support-subject"
                name="subject"
                className="t-select"
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                style={{ width: "100%", height: "44px" }}
              >
                {ISSUE_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.7 }}>{selectedDescription}</div>
            </div>

            <div>
              <label
                htmlFor="support-files"
                style={{ display: "block", marginBottom: "8px", fontSize: "11px", letterSpacing: "0.08em", color: "var(--t-muted)", textTransform: "uppercase" }}
              >
                Attach File(s)
              </label>
              <input
                id="support-files"
                name="file"
                type="file"
                multiple
                className="t-input"
                onChange={onFilesChange}
                style={{ paddingTop: "9px" }}
              />
              <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.7 }}>
                Up to {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each. CSV samples, screenshots, and PDFs are suitable.
              </div>
              {files.length > 0 ? (
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {files.map((file) => (
                    <div
                      key={`${file.name}-${file.size}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "12px",
                        color: "var(--t-text)",
                        padding: "8px 10px",
                        border: "1px solid var(--t-border)",
                        background: "var(--t-surface)",
                      }}
                    >
                      <Paperclip size={14} />
                      <span>{file.name}</span>
                      <span style={{ color: "var(--t-muted)" }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="support-message"
                style={{ display: "block", marginBottom: "8px", fontSize: "11px", letterSpacing: "0.08em", color: "var(--t-muted)", textTransform: "uppercase" }}
              >
                Message
              </label>
              <textarea
                id="support-message"
                name="message"
                className="t-textarea"
                placeholder="Describe your request, issue, or broker format in detail."
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                rows={10}
              />
            </div>

            {status ? (
              <div
                style={{
                  padding: "12px 14px",
                  border: `1px solid ${status.type === "success" ? "rgba(0, 224, 216, 0.35)" : "rgba(255, 87, 111, 0.35)"}`,
                  background: status.type === "success" ? "rgba(0, 224, 216, 0.08)" : "rgba(255, 87, 111, 0.08)",
                  color: status.type === "success" ? "var(--t-text)" : "#ffd2da",
                  fontSize: "12px",
                  lineHeight: 1.7,
                }}
              >
                {status.message}
              </div>
            ) : null}

            <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
              <button type="submit" className="t-btn t-btn-primary" disabled={sending}>
                <Send size={15} />
                {sending ? "Sending..." : "Submit Request"}
              </button>
              <span style={{ fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.7 }}>
                Do not include passwords or sensitive account credentials in your message.
              </span>
            </div>
          </form>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="t-card" style={{ padding: "18px" }}>
            <div className="t-card-header" style={{ padding: "0 0 12px", background: "transparent" }}>
              <div className="label">What To Include</div>
            </div>
            <div className="t-card-body" style={{ padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Broker name and CSV export source for import requests.",
                "Exact steps and screenshots for bug reports.",
                "Desired outcome and business case for feature requests.",
                "Sample symbols, dates, or financial year context when relevant.",
              ].map((item) => (
                <div key={item} style={{ fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.8 }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="t-card" style={{ padding: "18px" }}>
            <div className="t-card-header" style={{ padding: "0 0 12px", background: "transparent" }}>
              <div className="label">Privacy Note</div>
            </div>
            <div className="t-card-body" style={{ padding: 0 }}>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.8 }}>
                Support messages are forwarded by the server to TYO Lab through the configured mailer route. Attach only
                the minimum files needed to explain the issue.
              </p>
              <div style={{ marginTop: "14px" }}>
                <Link href="/privacy" className="t-btn t-btn-ghost t-btn-sm">
                  View Privacy
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
