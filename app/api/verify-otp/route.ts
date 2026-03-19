import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const normalizedPhone = phone.replace(/\D/g, '')

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({ to: `+1${normalizedPhone}`, code: code.trim() })

    if (check.status === 'approved') {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Code incorrect.', attemptsLeft: true }, { status: 400 })
  } catch (error: any) {
    console.error('verify-otp error:', error.message, error.code)

    if (error.code === 60202) {
      return NextResponse.json({ error: 'Trop de tentatives. Demandez un nouveau code.', expired: true }, { status: 400 })
    }
    if (error.code === 60200 || error.code === 20404) {
      return NextResponse.json({ error: 'Code expiré. Demandez un nouveau code.', expired: true }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erreur de vérification. Veuillez réessayer.' }, { status: 500 })
  }
}
