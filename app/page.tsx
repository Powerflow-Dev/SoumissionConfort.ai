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
            <img src="/images/logo-fr.png" alt="Soumission Toiture AI" className="h-[80px] md:h-[100px] w-auto" />
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Comment ça fonctionne
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

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              La Plateforme de Comparaison #1 au Québec
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des milliers de propriétaires nous font confiance pour comparer les prix de toiture
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">50,000+</h3>
              <p className="text-gray-600">Soumissions générées</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">30%</h3>
              <p className="text-gray-600">Économies moyennes</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">1,200+</h3>
              <p className="text-gray-600">Clients satisfaits</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Prêt à Économiser sur Votre Toiture ?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Obtenez votre estimation gratuite en 60 secondes et comparez les prix de plusieurs entrepreneurs certifiés
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              <CheckCircle className="w-4 h-4 mr-2" />
              100% Gratuit
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              <CheckCircle className="w-4 h-4 mr-2" />
              Sans Engagement
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <CheckCircle className="w-4 h-4 mr-2" />
              Entrepreneurs Certifiés
            </Badge>
          </div>
        </div>
      </section>
    </div>
  )
}
