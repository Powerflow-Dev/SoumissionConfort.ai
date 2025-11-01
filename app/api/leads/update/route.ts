import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { leadId, action } = await request.json()
    
    console.log('📝 Lead Update API: Updating lead', leadId, 'with action:', action)

    if (!leadId || !action) {
      return NextResponse.json({ error: "Missing leadId or action" }, { status: 400 })
    }

    // Prepare updated webhook payload with same structure as main webhook
    const updatePayload = {
      "Lead ID (Y)": leadId,
      "Webhook Type (Z)": "quote_request", // Second webhook type
      "Action (AA)": action,
      "Timestamp (BB)": new Date().toISOString(),
      "A cliqué pour soumission précise (CC)": true
    }

    // Get webhook URLs from environment
    const webhookUrlsEnv = process.env.WEBHOOK_URLS || 'https://hook.us2.make.com/hkh6cvtrgbswwecam6gmul9plxtgk98m'
    const webhookUrls = webhookUrlsEnv.split(',').map(url => url.trim()).filter(url => url.length > 0)

    console.log('🔄 Sending lead update to webhook:', updatePayload)

    // Send update to webhook URLs
    const webhookPromises = webhookUrls.map(async (url) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Soumission-Toiture-AI/1.0',
          },
          body: JSON.stringify(updatePayload),
          signal: AbortSignal.timeout(30000)
        })

        const responseText = await response.text().catch(() => 'Could not read response body')
        
        console.log('✅ Lead update webhook response:', {
          url: url,
          status: response.status,
          responseBody: responseText.substring(0, 200)
        })

        return {
          url: url,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          responseBody: responseText
        }
      } catch (error) {
        console.error('❌ Lead update webhook error:', error)
        return {
          url: url,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    const results = await Promise.all(webhookPromises)

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      leadId: leadId,
      action: action,
      webhookResults: results,
      debugInfo: {
        timestamp: new Date().toISOString(),
        endpoint: "/api/leads/update",
        payloadSent: updatePayload
      }
    })

  } catch (error) {
    console.error("Lead update error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
