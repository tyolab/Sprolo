import { NextResponse } from "next/server"

const DEFAULT_MAIL_TO = "dev@tyo.com.au"
const DEFAULT_TEMPLATE = "contactus.html"
const MAX_FILES = 5
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export async function POST(request: Request) {
  let incomingForm: FormData | null = null
  let outboundForm: FormData | null = null

  try {
    const mailerUrl = process.env.SUPPORT_MAILER_URL

    if (!mailerUrl) {
      return NextResponse.json({ error: "Support mailer is not configured on the server." }, { status: 500 })
    }

    incomingForm = await request.formData()

    const name = String(incomingForm.get("name") || "").trim()
    const email = String(incomingForm.get("email") || "").trim()
    const subject = String(incomingForm.get("subject") || "").trim()
    const message = String(incomingForm.get("message") || "").trim()
    const source = String(incomingForm.get("source") || "sprolo-support-page").trim()
    const files = incomingForm.getAll("file").filter((entry): entry is File => entry instanceof File && entry.size > 0)

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Please complete your name, email, and message." }, { status: 400 })
    }

    if (!email.includes("@") || !email.includes(".") || email.length < 5) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }

    if (name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 })
    }

    if (message.length < 10) {
      return NextResponse.json({ error: "Please enter a message of at least 10 characters." }, { status: 400 })
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Please attach no more than ${MAX_FILES} files.` }, { status: 400 })
    }

    const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE_BYTES)
    if (oversizedFile) {
      return NextResponse.json({ error: `${oversizedFile.name} exceeds the 10MB limit.` }, { status: 400 })
    }

    outboundForm = new FormData()
    outboundForm.set("mailto", process.env.SUPPORT_MAIL_TO || DEFAULT_MAIL_TO)
    outboundForm.set("title", `${name} would like to contact: ${subject || "Support Request"}`)
    outboundForm.set("template", process.env.SUPPORT_MAIL_TEMPLATE || DEFAULT_TEMPLATE)
    outboundForm.set(
      "content",
      JSON.stringify({
        name,
        email,
        subject,
        message,
        source,
        attachments: files.map((file) => ({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
        })),
      }),
    )
    outboundForm.set("from", email)
    outboundForm.set("replyto", email)
    outboundForm.set("replytoname", name)

    if (process.env.SUPPORT_MAILER_PROVIDER) {
      outboundForm.set("mailer_provider", process.env.SUPPORT_MAILER_PROVIDER)
    }

    if (process.env.SUPPORT_MAIL_DOMAIN) {
      outboundForm.set("domain", process.env.SUPPORT_MAIL_DOMAIN)
    }

    for (const file of files) {
      outboundForm.append("file", file, file.name)
    }

    const response = await fetch(mailerUrl, {
      method: "POST",
      body: outboundForm,
    })

    const responseText = await response.text()

    if (!response.ok) {
      return NextResponse.json(
        { error: `Mailer request failed with status ${response.status}.`, details: responseText || null },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, message: "Support request sent." })
  } catch (error) {
    console.error("Support route error:", error)
    return NextResponse.json({ error: "Unable to send support request right now." }, { status: 500 })
  } finally {
    incomingForm = null
    outboundForm = null
  }
}
