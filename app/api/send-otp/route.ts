import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreAdmin } from '@/lib/firebase-admin'
import twilio from 'twilio'

const MAX_RESENDS_PER_HOUR = 5

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

    // Step 1: Firebase
    let db: any
    try {
      db = getFirestoreAdmin()
    } catch (fbInitError: any) {
      console.error('send-otp [Firebase init error]:', fbInitError.message)
      return NextResponse.json({ error: 'Erreur serveur (Firebase init).' }, { status: 500 })
    }

    const docRef = db.collection('otp_verifications').doc(normalizedPhone)
    let existing: any
    try {
      existing = await docRef.get()
    } catch (fbReadError: any) {
      console.error('send-otp [Firestore read error]:', fbReadError.message)
      return NextResponse.json({ error: 'Erreur serveur (Firestore read).' }, { status: 500 })
    }

    // Rate limit: max resends per hour
    if (existing.exists) {
      const data = existing.data()!
      const resendCount = data.resendCount ?? 0
      const firstSentAt: Date = data.firstSentAt?.toDate() ?? new Date()
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000)

      if (firstSentAt > hourAgo && resendCount >= MAX_RESENDS_PER_HOUR) {
        return NextResponse.json(
          { error: 'Trop de tentatives. Réessayez dans une heure.' },
          { status: 429 }
        )
      }
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    const existingData = existing.exists ? existing.data()! : {}
    const isFirstSend = !existing.exists || !existingData.firstSentAt

    try {
      await docRef.set({
        code,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
        firstSentAt: isFirstSend ? new Date() : existingData.firstSentAt,
        resendCount: (existingData.resendCount ?? 0) + (isFirstSend ? 0 : 1),
      })
    } catch (fbWriteError: any) {
      console.error('send-otp [Firestore write error]:', fbWriteError.message)
      return NextResponse.json({ error: 'Erreur serveur (Firestore write).' }, { status: 500 })
    }

    // Step 2: Twilio SMS
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      await client.messages.create({
        body: `Votre code de vérification Soumission Toiture.ai : ${code}\n\nValide 5 minutes. Ne le partagez pas.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+1${normalizedPhone}`,
      })
    } catch (twilioError: any) {
      console.error('send-otp [Twilio error]:', twilioError.message, twilioError.code)
      return NextResponse.json({ error: 'Erreur lors de l\'envoi du SMS. Veuillez réessayer.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('send-otp [unexpected error]:', error.message, error)
    return NextResponse.json(
      { error: 'Erreur inattendue. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
