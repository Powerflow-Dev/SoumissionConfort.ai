"use client"

import { AddressInput } from "@/components/address-input"
import { useLanguage } from "@/lib/language-context"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingDown, Shield, Clock, Users, CheckCircle, MapPin, Search, Star, Award, Zap } from 'lucide-react'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUTMParameters } from "@/lib/utm-utils"
import { TrustBadges } from "@/components/trust-badges"
import { track } from '@vercel/analytics'

export function HeroSection() {
  const { t } = useLanguage()
  const router = useRouter()

  const [address, setAddress] = useState("")

  // Capture UTM params on landing and persist to sessionStorage so they survive navigation
  useEffect(() => {
    try {
      const utm = getCurrentUTMParameters()
      if (Object.keys(utm).length > 0) {
        console.log('🏷️ UTM captured on homepage:', utm)
      }
    } catch (e) {
      console.warn('UTM capture failed on homepage:', e)
    }
  }, [])

  const navigateToAnalysis = () => {
    if (!address.trim()) return
    
    // Track analysis start
    track('Analysis Started', { address: address.trim() })
    
    // Build /analysis URL with address and forward any UTM params we have
    const utm = getCurrentUTMParameters()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = new URL('/analysis', origin || 'http://localhost')
    url.searchParams.set('address', address.trim())
    ;(['utm_source','utm_campaign','utm_content','utm_medium','utm_term'] as const).forEach((k) => {
      const v = (utm as any)[k]
      if (v) url.searchParams.set(k, v)
    })
    const href = origin ? url.toString().replace(origin, '') : url.toString()
    router.push(href)
  }

  return (
    <section className="relative bg-gray-900 overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/Soumissioconfort-hero.jpeg" 
          alt="Maison avec isolation"
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-16 sm:py-20 relative z-10">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          Estimation d'isolation instantanée
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 text-center mb-8 md:mb-12 max-w-2xl mx-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          Estimez le coût pour réisoler votre grenier <span className="text-[#EEED32] font-semibold">en moins d'une minute.</span>
        </p>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto">
          <form className="space-y-4">
            {/* Address Input */}
            <div className="relative">
              <AddressInput 
                onAddressSelect={(selectedAddress) => {
                  setAddress(selectedAddress)
                }}
                onAnalyze={navigateToAnalysis}
                className="w-full"
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault()
                if (address.trim()) {
                  router.push(`/analysis?address=${encodeURIComponent(address)}`)                }
              }}
              disabled={!address.trim()}
              className="w-full bg-[#EEED32] hover:bg-[#d9d82d] text-gray-900 font-bold py-4 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Obtenir mon estimation gratuite</span>
              </div>
            </button>

            {/* Trust Features */}
            <div className="flex items-center justify-center flex-wrap gap-4 pt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>100% Gratuit</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-green-600" />
                <span>Réponse en 60 secondes</span>
              </div>
            </div>
          </form>
        </div>

        {/* Social Proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-lg">4.8/5</span>
            <span className="text-gray-300 text-sm">(800+ avis)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-teal-400" />
            <span className="font-semibold">150+ Entrepreneurs certifiés</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-teal-400" />
            <span className="font-semibold">Service #1 au Québec</span>
          </div>
        </div>
      </div>
    </section>
  )
}
