"use client"

import { AddressInput } from "@/components/address-input"
import { CheckCircle, Search, Users, Award, Star, Clock } from 'lucide-react'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUTMParameters } from "@/lib/utm-utils"
import { track } from '@vercel/analytics'

export function HeroSection() {
  const router = useRouter()
  const [address, setAddress] = useState("")

  useEffect(() => {
    try {
      const utm = getCurrentUTMParameters()
    } catch (e) {
      console.warn('UTM capture failed on homepage:', e)
    }
  }, [])

  const navigateToAnalysis = () => {
    if (!address.trim()) return
    track('Analysis Started', { address: address.trim() })
    const utm = getCurrentUTMParameters()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = new URL('/analysis', origin || 'http://localhost')
    url.searchParams.set('address', address.trim())
    ;(['utm_source','utm_campaign','utm_content','utm_medium','utm_term','fbclid'] as const).forEach((k) => {
      const v = (utm as any)[k]
      if (v) url.searchParams.set(k, v)
    })
    const href = origin ? url.toString().replace(origin, '') : url.toString()
    router.push(href)
  }

  return (
    <section className="relative bg-[#fffff6] overflow-hidden min-h-[620px] md:min-h-[700px] flex items-center">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/Soumissioconfort-hero.jpeg"
          alt="Maison avec isolation"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#002042]/55" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-4xl py-16 sm:py-20">
        {/* Eyebrow badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#aedee5] px-5 py-2 rounded-full shadow-md -rotate-2">
            <span className="font-serif-body font-bold text-[16px] text-[#002042] tracking-tight">
              Solution développée au Québec
            </span>
            <span className="text-lg">🍁</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-heading font-semibold text-4xl sm:text-5xl md:text-6xl text-white text-center leading-tight tracking-tight mb-4 drop-shadow-md">
          Estimation d'isolation instantanée
        </h1>

        <p className="font-serif-body text-lg sm:text-xl text-[#fffff6] text-center mb-10 max-w-2xl mx-auto tracking-tight drop-shadow">
          Estimez le coût pour réisoler votre grenier{' '}
          <span className="underline">en moins d'une minute.</span>
        </p>

        {/* Form Card */}
        <div
          id="form-hero"
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto border-4 border-[#aedee5]"
        >
          <div className="space-y-4">
            {/* Address Input */}
            <AddressInput
              onAddressSelect={(selectedAddress) => setAddress(selectedAddress)}
              onAnalyze={navigateToAnalysis}
              className="w-full"
            />

            {/* Submit Button */}
            <button
              type="button"
              onClick={navigateToAnalysis}
              disabled={!address.trim()}
              className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-heading font-bold py-4 px-6 rounded-full transition-all duration-300 shadow-[-2px_4px_0_0_#002042] hover:shadow-[-1px_2px_0_0_#002042] hover:translate-y-0.5 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              <div className="flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                <span>Obtenir mon estimation gratuite</span>
              </div>
            </button>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-sm text-[#375371]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#002042]" />
                <span className="font-serif-body">Gratuit et sans obligation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#002042]" />
                <span className="font-serif-body">150+ entrepreneurs certifiés</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#002042]" />
                <span className="font-serif-body">Réponse en 60 secondes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-heading font-semibold text-lg">4.9/5</span>
            <span className="text-gray-300 text-sm">(800+ avis)</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#aedee5]" />
            <span className="font-serif-body font-semibold">150+ entrepreneurs certifiés</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#aedee5]" />
            <span className="font-serif-body font-semibold">Service #1 au Québec</span>
          </div>
        </div>
      </div>
    </section>
  )
}
