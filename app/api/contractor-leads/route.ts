import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📥 Contractor lead received:', body)
    
    // Extract form data
    const {
      companyName,
      firstName,
      lastName,
      email,
      phone,
      rbqNumber,
      serviceArea,
      yearsExperience,
      message
    } = body

    // Validate required fields
    if (!companyName || !firstName || !lastName || !email || !phone || !rbqNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique leadId for contractor application
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const leadId = `CONTRACTOR${timestamp}${randomString}`

    console.log('🆔 Generated contractor lead ID:', leadId)

    // Send to webhook endpoints
    try {
      console.log('🚨 CONTRACTOR API: Preparing to send webhook')
      
      // Get webhook URLs from environment
      const webhookUrlsEnv = process.env.WEBHOOK_URLS
      console.log('🔍 CONTRACTOR API: WEBHOOK_URLS configured:', webhookUrlsEnv ? 'YES' : 'NO')
      
      if (!webhookUrlsEnv) {
        console.warn('⚠️ CONTRACTOR API: No webhook URLs configured, skipping webhook')
      } else {
        const webhookUrls = webhookUrlsEnv.split(',').map(url => url.trim()).filter(url => url.length > 0)
        console.log('🌐 CONTRACTOR API: Webhook URLs count:', webhookUrls.length)
        
        // Prepare webhook payload for Make.com (matching Google Sheets structure)
        const makeComPayload = {
          // Type de lead
          "Type de lead": "Entrepreneur",
          "Lead ID": leadId,
          "Webhook Type": "contractor_application",
          "Timestamp": new Date().toISOString(),
          
          // Informations de l'entreprise
          "Nom de l'entreprise": companyName,
          "Numéro RBQ": rbqNumber,
          "Région desservie": serviceArea || "Non spécifiée",
          "Années d'expérience": yearsExperience || "Non spécifiée",
          
          // Contact
          "Prénom": firstName,
          "Nom": lastName,
          "Email": email,
          "Téléphone": phone,
          
          // Message
          "Message": message || "Aucun message",
          
          // Métadonnées
          "Date de soumission": new Date().toLocaleString('fr-CA'),
          "Source": "soumission-confort-ai"
        }
        
        console.log('📦 CONTRACTOR API: Make.com formatted payload:', JSON.stringify(makeComPayload, null, 2))
        
        // Send to all webhook URLs
        const webhookPromises = webhookUrls.map(async (url, index) => {
          try {
            console.log(`📤 CONTRACTOR API: Sending to webhook ${index + 1}/${webhookUrls.length}:`, url)
            
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Soumission-Confort-AI/1.0',
              },
              body: JSON.stringify(makeComPayload),
              signal: AbortSignal.timeout(30000)
            })
            
            const responseText = await response.text().catch(() => 'Could not read response body')
            
            console.log(`📥 CONTRACTOR API: Webhook ${index + 1} response:`, {
              status: response.status,
              statusText: response.statusText,
              body: responseText.substring(0, 200)
            })
            
            return {
              url,
              status: response.status,
              success: response.ok
            }
          } catch (error) {
            console.error(`❌ CONTRACTOR API: Webhook ${index + 1} failed:`, error)
            return {
              url,
              status: 0,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
        
        const webhookResults = await Promise.all(webhookPromises)
        console.log('✅ CONTRACTOR API: All webhooks processed:', webhookResults)
        
        const successCount = webhookResults.filter(r => r.success).length
        console.log(`📊 CONTRACTOR API: ${successCount}/${webhookUrls.length} webhooks succeeded`)
      }
    } catch (webhookError) {
      console.error('❌ CONTRACTOR API: Webhook error:', webhookError)
      // Don't fail the request if webhook fails
    }

    // Prepare email content for notification (optional)
    const emailContent = `
      Nouvelle demande d'entrepreneur - Soumission Confort
      
      Entreprise: ${companyName}
      Contact: ${firstName} ${lastName}
      Email: ${email}
      Téléphone: ${phone}
      Numéro RBQ: ${rbqNumber}
      Région: ${serviceArea || 'Non spécifiée'}
      Expérience: ${yearsExperience || 'Non spécifiée'}
      
      Message:
      ${message || 'Aucun message'}
      
      ---
      Lead ID: ${leadId}
      Soumis le: ${new Date().toLocaleString('fr-CA')}
    `

    console.log('📧 Email content prepared:', emailContent)

    // Send notification email to admin (optional, if configured)
    if (process.env.ADMIN_EMAIL) {
      try {
        // Example with a hypothetical email service
        // await sendEmail({
        //   to: process.env.ADMIN_EMAIL,
        //   subject: `Nouvelle demande entrepreneur: ${companyName}`,
        //   text: emailContent
        // })
        console.log('✅ Would send email to:', process.env.ADMIN_EMAIL)
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contractor lead submitted successfully',
      data: {
        leadId,
        companyName,
        email,
        submittedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error processing contractor lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
