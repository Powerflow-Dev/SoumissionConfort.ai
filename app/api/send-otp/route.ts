import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 })
    }

    const normalizedPhone = phone.replace(/\D/g, '')
    if (normalizedPhone.length < 10) {
      return NextResponse.json({ error: 'Numéro de téléphone invalide' }, { status: 400 })
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({ to: `+1${normalizedPhone}`, channel: 'sms' })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('send-otp error:', error.message, error.code)

    if (error.code === 60203) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 })
    }

    return NextResponse.json({ error: "Erreur lors de l'envoi du SMS. Veuillez réessayer." }, { status: 500 })
  }
}
