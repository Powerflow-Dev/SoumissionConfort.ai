import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = headersList.get("x-signature-256") || headersList.get("x-hub-signature-256")

      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 401 })
      }

      const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex")

      const providedSignature = signature.replace("sha256=", "")

      if (!crypto.timingSafeEqual(Buffer.from(expectedSignature, "hex"), Buffer.from(providedSignature, "hex"))) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // Parse the webhook data
    let webhookData
    try {
      webhookData = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    // Log the webhook data (you can process it as needed)
    console.log("Received webhook:", {
      timestamp: new Date().toISOString(),
      source: headersList.get("user-agent"),
      data: webhookData,
    })

    // Here you can add logic to process the webhook data
    // For example, update lead status, trigger notifications, etc.

    return NextResponse.json({
      success: true,
      message: "Webhook received successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
    methods: ["POST"],
  })
}
