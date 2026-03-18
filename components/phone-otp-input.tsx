"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

type VerificationState = 'idle' | 'sending' | 'pending' | 'confirming' | 'verified'

interface PhoneOtpInputProps {
  value: string
  onChange: (value: string) => void
  onVerified: () => void
  disabled?: boolean
  inputClassName?: string
  placeholder?: string
}

export function PhoneOtpInput({
  value,
  onChange,
  onVerified,
  disabled = false,
  inputClassName = "",
  placeholder = "(514) 555-5555",
}: PhoneOtpInputProps) {
  const [state, setState] = useState<VerificationState>('idle')
  const [otpValue, setOtpValue] = useState("")
  const [otpError, setOtpError] = useState("")
  const [otpExpired, setOtpExpired] = useState(false)

  const isPhoneValid = value.replace(/\D/g, '').length >= 10

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    if (state === 'pending' || state === 'verified') {
      setState('idle')
      setOtpValue("")
      setOtpError("")
      setOtpExpired(false)
    }
  }

  const sendOtp = async () => {
    setState('sending')
    setOtpError("")
    setOtpExpired(false)
    setOtpValue("")

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: value }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpError(data.error ?? "Erreur lors de l'envoi du SMS.")
        setState('idle')
        return
      }
      setState('pending')
    } catch {
      setOtpError('Erreur réseau. Veuillez réessayer.')
      setState('idle')
    }
  }

  const confirmOtp = async () => {
    if (otpValue.length !== 6) return
    setState('confirming')
    setOtpError("")

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: value, code: otpValue }),
      })
      const data = await res.json()

      if (!res.ok) {
        setOtpError(data.error ?? 'Code incorrect.')
        if (data.expired) setOtpExpired(true)
        setState('pending')
        return
      }

      setState('verified')
      onVerified()
    } catch {
      setOtpError('Erreur réseau. Veuillez réessayer.')
      setState('pending')
    }
  }

  return (
    <div>
      {/* Phone input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            disabled={disabled || state === 'verified'}
            className={`w-full ${inputClassName} ${
              state === 'verified'
                ? 'border-green-500 bg-green-50 text-green-800 pr-10'
                : ''
            }`}
            placeholder={placeholder}
            required
          />
          {state === 'verified' && (
            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
          )}
        </div>
        {state !== 'verified' && (
          <button
            type="button"
            onClick={sendOtp}
            disabled={!isPhoneValid || state === 'sending' || disabled}
            className="px-4 py-3 bg-[#002042] hover:bg-[#002042]/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {state === 'sending' ? '...' : (state === 'pending' || state === 'confirming') ? 'Renvoyer' : 'Vérifier'}
          </button>
        )}
      </div>

      {/* Verified label */}
      {state === 'verified' && (
        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" /> Numéro vérifié
        </p>
      )}

      {/* OTP panel */}
      {(state === 'pending' || state === 'confirming') && (
        <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700 mb-3 text-center">
            Code envoyé au <strong>{value}</strong> — entrez-le ci-dessous
          </p>
          <div className="flex flex-col items-center gap-3">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={setOtpValue}
              disabled={state === 'confirming' || otpExpired}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="h-12 w-10 text-lg font-bold" />
                ))}
              </InputOTPGroup>
            </InputOTP>

            {otpError && <p className="text-sm text-red-600 text-center">{otpError}</p>}

            {!otpExpired ? (
              <button
                type="button"
                onClick={confirmOtp}
                disabled={otpValue.length !== 6 || state === 'confirming'}
                className="w-full px-4 py-2 bg-[#002042] hover:bg-[#002042]/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state === 'confirming' ? 'Vérification...' : 'Confirmer le code'}
              </button>
            ) : (
              <button
                type="button"
                onClick={sendOtp}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Demander un nouveau code
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
