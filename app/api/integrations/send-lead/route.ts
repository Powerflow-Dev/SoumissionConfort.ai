import { type NextRequest, NextResponse } from "next/server"
import { sendToMultipleIntegrations, validateLeadData } from "@/lib/integration-utils"
import { integrations } from "@/lib/integrations-config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadData, targetIntegrations } = body

    // Validate lead data
    const validatedData = validateLeadData(leadData)
    if (!validatedData) {
      return NextResponse.json(
        { error: "Invalid lead data. firstName, lastName, and email are required." },
        { status: 400 },
      )
    }

    // Send to integrations
    const results = await sendToMultipleIntegrations(validatedData, targetIntegrations)

    // Count successes and failures
    const successful = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)

    return NextResponse.json({
      success: true,
      message: `Sent to ${successful.length} integrations successfully`,
      results: {
        successful: successful.length,
        failed: failed.length,
        details: results,
      },
    })
  } catch (error) {
    console.error("Send lead error:", error)
    return NextResponse.json({ error: "Failed to process lead data" }, { status: 500 })
  }
}

export async function GET() {
  // Return available integrations and their status
  const availableIntegrations = Object.entries(integrations).map(([key, config]) => ({
    key,
    name: config.name,
    enabled: config.enabled,
    configured: !!config.endpoint || !!config.apiKey,
  }))

  return NextResponse.json({
    integrations: availableIntegrations,
    total: availableIntegrations.length,
    enabled: availableIntegrations.filter((i) => i.enabled).length,
  })
}
