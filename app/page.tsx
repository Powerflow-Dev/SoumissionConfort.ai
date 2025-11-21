"use client"

import { HeroSection } from "@/components/hero-section"
import { FeatureCards } from "@/components/feature-cards"
import { HowItWorks } from "@/components/how-it-works"
import { ReviewsSection } from "@/components/reviews-section"
import { useLanguage } from "@/lib/language-context"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingDown, Calculator } from 'lucide-react'
import { useEffect } from 'react'
import { initializeMeta, isMetaConfigured } from '@/lib/meta-config'
import { trackViewContent } from '@/lib/meta-conversion-api'

export default function HomePage() {
  const { t } = useLanguage()

  // Initialize Meta Conversion API and track ViewContent on page load
  useEffect(() => {
    // Initialize Meta Conversion API
    initializeMeta()
    
    // Track ViewContent event when user enters the website
    if (isMetaConfigured()) {
      trackViewContent('Homepage', 'website')
        .then(result => {
          if (result.success) {
            console.log('ViewContent event tracked successfully')
          } else {
            console.error('Failed to track ViewContent event:', result.error)
          }
        })
        .catch(error => {
          console.error('Error tracking ViewContent event:', error)
        })
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-2 md:py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/images/logosoumissionconfort-1.png" alt="Soumission Confort AI" className="h-[80px] md:h-[100px] w-auto" />
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Comment ça fonctionne
            </a>
            <a href="/pour-entrepreneurs" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Pour les entrepreneurs
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Feature Cards */}
      <FeatureCards />

      {/* How It Works */}
      <HowItWorks />

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Stats Section - Removed for cleaner flow */}

      {/* CTA Section - Integrated into feature-cards component */}
    </div>
  )
}
