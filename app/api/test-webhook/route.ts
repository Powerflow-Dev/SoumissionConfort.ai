import { NextResponse } from "next/server"

export async function GET() {
  console.log('🧪 Testing Make.com webhook with minimal payload...')
  
  const webhookUrl = 'https://hook.us2.make.com/hkh6cvtrgbswwecam6gmul9plxtgk98m'
  
  // Ultra simple test payload
  const testPayload = {
    message: "test from api",
    timestamp: new Date().toISOString()
  }
  
  try {
    console.log('📤 Sending test to:', webhookUrl)
    console.log('📦 Payload:', JSON.stringify(testPayload))
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })
    
    const responseText = await response.text()
    
    console.log('📥 Response status:', response.status)
    console.log('📥 Response body:', responseText)
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      responseBody: responseText,
      sentPayload: testPayload,
      message: response.ok ? 'Webhook test successful!' : 'Webhook test failed'
    })
    
  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
