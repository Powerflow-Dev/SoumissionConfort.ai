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
    <section className="relative bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl w-full mb-12">
          
          {/* Left Side - Content with inline image placeholder */}
          <div className="text-gray-900 order-1 lg:order-1">
            <div className="mb-6">
              <Badge className="bg-teal-500 text-white border-teal-500 px-4 py-2 text-sm font-medium rounded-full">
                Plateforme #1 au Québec
              </Badge>
            </div>

            <div className="relative">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                La Meilleure Solution Pour Votre{' '}
                <span className="relative inline-block">
                  {/* Small inline image */}
                  <span className="inline-block align-middle mx-2 sm:mx-4">
                    <img 
                      src="/images/inline-hero-image.jpg" 
                      alt="Maison isolée"
                      className="w-32 h-20 sm:w-40 sm:h-24 md:w-48 md:h-28 rounded-2xl shadow-lg inline-block object-cover border-2 border-teal-300"
                    />
                  </span>
                </span>
                <br />
                <span className="text-teal-600">Isolation</span>
              </h1>
            </div>

            {/* Social Proof Bar */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-lg">4.8</span>
                <span className="text-gray-500 text-sm">(800+ avis)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-teal-600" />
                <span className="font-semibold text-gray-700">150+ Pros</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-700">Dès 2,500$</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="order-2 lg:order-2">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl max-w-md mx-auto lg:mx-0">
              <div className="mb-6">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">
                  Obtenez votre <span className="text-teal-600">estimation gratuite</span> en 60 secondes
                </h3>
                <p className="text-base text-gray-600">
                  Entrez votre adresse pour commencer
                </p>
              </div>

              <form className="space-y-4 sm:space-y-6">
                {/* Address Input - Mobile Optimized */}
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
                      router.push(`/analysis?address=${encodeURIComponent(address)}`)                    }
                  }}
                  disabled={!address.trim()}
                  className="w-full bg-[#EEED32] hover:bg-[#d9d82d] text-gray-900 font-bold py-4 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Commencer</span>
                  </div>
                </button>

                {/* Trust Features */}
                <div className="flex items-center justify-center space-x-4 pt-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Gratuit</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Sans engagement</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Sécurisé</span>
                  </div>
                </div>

                {/* Trust Badges - Logos officiels */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <TrustBadges />
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom 3 images - Carousel on mobile, grid on desktop */}
        <div className="mt-8 pb-8">
          {/* Mobile: Horizontal scroll carousel */}
          <div className="md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            <div className="flex gap-4 pb-4">
              {/* Image 1 */}
              <div className="relative aspect-[3/4] w-[75vw] flex-shrink-0 rounded-3xl overflow-hidden shadow-2xl snap-center">
                <img 
                  src="/images/hero-image-1.jpg" 
                  alt="Maison avec isolation"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image 2 */}
              <div className="relative aspect-[3/4] w-[75vw] flex-shrink-0 rounded-3xl overflow-hidden shadow-2xl snap-center">
                <img 
                  src="/images/hero-image-2.jpg" 
                  alt="Intérieur confortable"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image 3 */}
              <div className="relative aspect-[3/4] w-[75vw] flex-shrink-0 rounded-3xl overflow-hidden shadow-2xl snap-center">
                <img 
                  src="/images/hero-image-3.jpg" 
                  alt="Espace moderne"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {/* Image 1 */}
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl group">
              <img 
                src="/images/hero-image-1.jpg" 
                alt="Maison avec isolation"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image 2 - Slightly offset */}
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl mt-8 group">
              <img 
                src="/images/hero-image-2.jpg" 
                alt="Intérieur confortable"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image 3 */}
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl group">
              <img 
                src="/images/hero-image-3.jpg" 
                alt="Espace moderne"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
