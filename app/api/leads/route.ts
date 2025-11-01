import { type NextRequest, NextResponse } from "next/server"

console.log('🔥🔥🔥 LEADS API FILE LOADED - THIS SHOULD SHOW ON SERVER START 🔥🔥🔥')

export async function POST(request: NextRequest) {
  console.log('🚨🚨🚨 LEADS API ENDPOINT CALLED - START OF FUNCTION 🚨🚨🚨')
  console.log('🕐 TIMESTAMP:', new Date().toISOString())
  console.log('🌍 REQUEST URL:', request.url)
  console.log('📍 REQUEST METHOD:', request.method)
  
  try {
    const leadData = await request.json()
    console.log('🔥 LEADS API: Received lead data:', JSON.stringify(leadData, null, 2))

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "phone", "roofData", "userAnswers", "pricingData"]
    for (const field of requiredFields) {
      if (!leadData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Extract UTM parameters if provided
    const utmParams = leadData.utmParams || {}
    console.log('🏷️ LEADS API: UTM Parameters received:', utmParams)

    // Generate unique leadId using timestamp and random string (no dashes)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10) // 8 character random string
    const leadId = `LEAD${timestamp}${randomString}`

    // Send to webhook endpoints
    try {
      console.log('🚨 LEADS API: ENTERING WEBHOOK TRY BLOCK')
      
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      
      console.log('🌐 LEADS API: Base URL:', baseUrl)
      console.log('📞 LEADS API: Calling webhook at:', `${baseUrl}/api/webhook`)
      console.log('🚨🚨🚨 LEADS API: ABOUT TO CALL WEBHOOK - THIS SHOULD APPEAR 🚨🚨🚨')
      console.log('🔍 LEADS API: Environment check - VERCEL_URL:', process.env.VERCEL_URL)
      console.log('🔍 LEADS API: Environment check - NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL)
      
      // Prepare clean webhook payload (matching the structure expected by webhook endpoint)
      const webhookPayload = {
        timestamp: new Date().toISOString(),
        leadId: leadId, // Consistent leadId for webhook linking
        webhookType: "initial_contact", // First webhook type
        contact: {
          firstName: leadData.firstName,
          lastName: leadData.lastName,
          email: leadData.email,
          phone: leadData.phone,
        },
        property: {
          address: leadData.roofData?.address || "",
          city: leadData.roofData?.city || "",
          postalCode: leadData.roofData?.postalCode || "",
          roofArea: leadData.roofData?.roofArea || 0,
          buildingHeight: leadData.roofData?.buildingHeight || 0,
          pitchComplexity: leadData.roofData?.pitchComplexity || "",
          obstacles: leadData.roofData?.obstacles || [],
          coordinates: leadData.roofData?.coordinates || null,
        },
        projectDetails: {
          roofConditions: leadData.userAnswers?.roofConditions || [],
          roofAge: leadData.userAnswers?.roofAge || "",
          roofMaterial: leadData.userAnswers?.roofMaterial || "",
          propertyAccess: leadData.userAnswers?.propertyAccess || "",
          serviceType: leadData.userAnswers?.serviceType || [],
          timeline: leadData.userAnswers?.timeline || "",
          contactPreference: leadData.userAnswers?.contactPreference || "",
          contactTime: leadData.userAnswers?.contactTime || "",
        },
        pricing: leadData.pricingData || null,
        utmParams: utmParams, // Include UTM parameters in webhook payload
        source: "soumission-toiture-ai",
      }
      
      console.log('🔍 LEADS API: EXACT WEBHOOK PAYLOAD BEING SENT:')
      console.log('📦 LEADS API: Full payload:', JSON.stringify(webhookPayload, null, 2))
      console.log('📏 LEADS API: Payload size:', JSON.stringify(webhookPayload).length, 'characters')
      console.log('🎯 LEADS API: Contact info:', webhookPayload.contact)
      console.log('🏠 LEADS API: Property info:', webhookPayload.property)
      console.log('📋 LEADS API: Project details:', webhookPayload.projectDetails)
      console.log('💰 LEADS API: Pricing info:', webhookPayload.pricing)
      console.log('🏷️ LEADS API: UTM Parameters:', webhookPayload.utmParams)
      
      // Add bypass parameter for internal webhook call
      const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      let webhookUrl = `${baseUrl}/api/webhook`
      
      if (bypassSecret) {
        // Construct URL with proper query parameter (avoid double encoding)
        const url = new URL('/api/webhook', baseUrl)
        url.searchParams.set('vercel-protection-bypass', bypassSecret)
        webhookUrl = url.toString()
      }
      
      console.log('🔗 LEADS API: Calling webhook at:', webhookUrl)
      console.log('🔍 LEADS API: Bypass secret configured:', bypassSecret ? 'YES' : 'NO')
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      })
      
      console.log('📥 LEADS API: Webhook response status:', webhookResponse.status)
      console.log('📥 LEADS API: Webhook response ok:', webhookResponse.ok)
      
      if (webhookResponse.ok) {
        const webhookResult = await webhookResponse.json()
        console.log('✅ LEADS API: Webhook sent successfully:', webhookResult.summary)
        
        // Return the actual webhook response instead of mock response
        return NextResponse.json({
          success: true,
          leadId: leadId,
          message: "🔥 LEADS API: RETURNING ACTUAL WEBHOOK RESPONSE 🔥",
          webhookResponse: webhookResult,
          debugInfo: {
            timestamp: new Date().toISOString(),
            endpoint: "/api/leads/route.ts",
            version: "LEADS_RETURNING_WEBHOOK_RESPONSE",
            webhookStatus: webhookResponse.status,
            webhookOk: webhookResponse.ok,
            generatedLeadId: leadId
          }
        })
      } else {
        const errorText = await webhookResponse.text()
        console.error('❌ LEADS API: Webhook failed:', errorText)
        
        // Return webhook error details
        return NextResponse.json({
          success: false,
          leadId: leadId,
          message: "❌ LEADS API: WEBHOOK FAILED ❌",
          error: errorText,
          debugInfo: {
            timestamp: new Date().toISOString(),
            endpoint: "/api/leads/route.ts",
            version: "LEADS_WEBHOOK_ERROR",
            webhookStatus: webhookResponse.status,
            webhookOk: webhookResponse.ok,
            generatedLeadId: leadId
          }
        })
      }
    } catch (webhookError) {
      console.error('💥 LEADS API: Webhook error:', webhookError)
      // Don't fail the main request if webhook fails
    }

    // Mock lead processing
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock contractor matching based on location
    const mockContractors = [
      {
        id: "CONT-001",
        businessName: "Superior Roofing Solutions",
        rating: 4.8,
        reviewCount: 127,
        serviceAreas: ["Toronto", "Mississauga", "Brampton"],
        specialties: ["Residential", "Commercial", "Emergency Repairs"],
        verified: true,
      },
      // ... autres entrepreneurs
    ]

    // Return mock response with lead confirmation
    return NextResponse.json({
      success: true,
      leadId: leadId,
      message: "🚨 LEADS API ENDPOINT CONFIRMED - RESPONSE FROM /api/leads/route.ts 🚨",
      estimatedResponseTime: "24-48 hours",
      matchedContractors: mockContractors.length,
      usableArea: leadData.roofData.usableArea || 1347,
      segments: leadData.roofData.segments || 2,
      pitchComplexity: "complex",
      debugInfo: {
        timestamp: new Date().toISOString(),
        endpoint: "/api/leads/route.ts",
        version: "DEBUG_VERSION_2.0"
      }
    })
  } catch (error) {
    console.error("Lead submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}