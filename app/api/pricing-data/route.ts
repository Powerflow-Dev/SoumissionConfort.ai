import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory storage for pricing data
// In production, you'd use Redis, database, or session storage
const pricingDataStore = new Map<string, any>()

// Clean up old entries after 1 hour
const EXPIRY_TIME = 60 * 60 * 1000 // 1 hour in milliseconds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const leadId = searchParams.get("leadId")

  if (!leadId) {
    return NextResponse.json({ error: "Missing leadId parameter" }, { status: 400 })
  }

  const data = pricingDataStore.get(leadId)

  if (!data) {
    return NextResponse.json({ error: "Pricing data not found or expired" }, { status: 404 })
  }

  // Check if data has expired
  if (Date.now() - data.timestamp > EXPIRY_TIME) {
    pricingDataStore.delete(leadId)
    return NextResponse.json({ error: "Pricing data has expired" }, { status: 404 })
  }

  return NextResponse.json(data.payload)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, roofData, userAnswers, leadData } = body

    if (!leadId || !roofData || !userAnswers || !leadData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Store the data with timestamp
    pricingDataStore.set(leadId, {
      timestamp: Date.now(),
      payload: {
        roofData,
        userAnswers,
        leadData
      }
    })

    // Clean up expired entries
    for (const [key, value] of pricingDataStore.entries()) {
      if (Date.now() - value.timestamp > EXPIRY_TIME) {
        pricingDataStore.delete(key)
      }
    }

    return NextResponse.json({ success: true, leadId })
  } catch (error) {
    console.error("Error storing pricing data:", error)
    return NextResponse.json({ error: "Failed to store pricing data" }, { status: 500 })
  }
}
