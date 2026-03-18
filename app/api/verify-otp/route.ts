import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreAdmin } from '@/lib/firebase-admin'

const MAX_ATTEMPTS = 3

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const normalizedPhone = phone.replace(/\D/g, '')
    const db = getFirestoreAdmin()
    const docRef = db.collection('otp_verifications').doc(normalizedPhone)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Aucun code trouvé. Demandez un nouveau code.' },
        { status: 400 }
      )
    }

    const data = doc.data()!

    // Check expiry
    if (data.expiresAt.toDate() < new Date()) {
      await docRef.delete()
      return NextResponse.json(
        { error: 'Code expiré. Demandez un nouveau code.', expired: true },
        { status: 400 }
      )
    }

    // Check max attempts
    if (data.attempts >= MAX_ATTEMPTS) {
      await docRef.delete()
      return NextResponse.json(
        { error: 'Trop de tentatives. Demandez un nouveau code.', expired: true },
        { status: 400 }
      )
    }

    // Wrong code
    if (data.code !== code.trim()) {
      const newAttempts = data.attempts + 1
      await docRef.update({ attempts: newAttempts })
      const attemptsLeft = MAX_ATTEMPTS - newAttempts

      return NextResponse.json(
        {
          error: attemptsLeft > 0
            ? `Code incorrect. Il vous reste ${attemptsLeft} tentative${attemptsLeft > 1 ? 's' : ''}.`
            : 'Code incorrect. Demandez un nouveau code.',
          attemptsLeft,
          expired: attemptsLeft === 0,
        },
        { status: 400 }
      )
    }

    // Valid — delete OTP record
    await docRef.delete()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('verify-otp error:', error)
    return NextResponse.json(
      { error: 'Erreur de vérification. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
