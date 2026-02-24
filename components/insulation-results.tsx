"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { calculateInsulationPricing, formatPrice, formatPercentage } from "@/lib/insulation-calculator"
import { TrendingUp, Zap, Star, CheckCircle, ArrowRight } from "lucide-react"
import type { LeadData } from "@/components/lead-capture-popup"
import { TrustBadges } from "@/components/trust-badges"
import { track } from '@vercel/analytics'

interface InsulationResultsProps {
  roofData: any
  userAnswers: any
  leadData: LeadData
  onComplete: () => void
}

export function InsulationResults({ roofData, userAnswers, leadData, onComplete }: InsulationResultsProps) {
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    // Calculer les résultats avec le nouvel algorithme
    const calculationInputs = {
      roofArea: roofData.roofArea || 2000,
      roofPitch: roofData.pitch,
      currentInsulation: userAnswers.currentInsulation || 'partielle',
      atticAccess: userAnswers.atticAccess || 'facile',
      heatingSystem: userAnswers.heatingSystem || 'electricite',
      identifiedProblems: userAnswers.identifiedProblems || [],
    }

    const calculatedResults = calculateInsulationPricing(calculationInputs)
    setResults(calculatedResults)
    
    // Track pricing results viewed
    track('Pricing Results Viewed', {
      roofArea: calculationInputs.roofArea,
      estimatedCost: calculatedResults.ranges.standard.totalCost.min + '-' + calculatedResults.ranges.standard.totalCost.max
    })
  }, [roofData, userAnswers])

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Calcul de votre soumission personnalisée...</p>
        </div>
      </div>
    )
  }

  const { standard } = results.ranges

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4">
      {/* Header */}
      <div className="text-center">
        <Badge className="mb-4 bg-green-100 text-green-800 border-green-200 px-4 py-2">
          <CheckCircle className="w-4 h-4 mr-2" />
          Analyse complétée
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          Votre soumission d'isolation personnalisée
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Basée sur {results.adjustedArea} pi² et vos besoins spécifiques
        </p>
      </div>

      {/* Fourchette d'investissement - Carte principale */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Fourchette d'investissement</h2>
              <p className="text-blue-100">Installation professionnelle au QC</p>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-5xl md:text-6xl font-bold mb-2">
              {formatPrice(standard.totalCost.min)} - {formatPrice(standard.totalCost.max)}
            </div>
            <p className="text-blue-100 text-sm">
              ({formatPrice(standard.totalCost.min / results.adjustedArea)} - {formatPrice(standard.totalCost.max / results.adjustedArea)} par pi²)
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Tarif concurrentiel du marché
            </Badge>
          </div>

          <Button
            onClick={() => {
              track('Get Quotes CTA Clicked', { location: 'pricing_card' })
              onComplete()
            }}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 md:py-6 text-base md:text-lg shadow-xl"
          >
            <span className="hidden md:inline">Obtenir une soumission plus précise par des entrepreneurs</span>
            <span className="md:hidden">Obtenir mes 3 soumissions gratuites</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
          </Button>

          <p className="text-center text-sm text-blue-100 mt-4">
            <Zap className="w-4 h-4 inline mr-1" />
            Obtenez des prix exacts en 24h • 100% gratuit
          </p>

          <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-900 font-bold text-sm">!</span>
              </div>
              <div className="text-sm">
                <p className="font-semibold mb-1">💡 Conseil tarifaire intelligent</p>
                <p className="text-blue-100">
                  Cette estimation inclut des matériaux haut de gamme, une installation professionnelle, les permis et la garantie. 
                  Le prix final dépendra des matériaux choisis et des facteurs spécifiques découverts lors de l'inspection.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparaison des gammes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {Object.entries(results.ranges).filter(([key]) => key !== 'premium').map(([key, range]: [string, any]) => {
          const isRecommended = key === 'standard'
          
          return (
            <Card 
              key={key} 
              className={`border-2 ${isRecommended ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200'} relative`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    ⭐ Recommandé
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{range.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">GAMME {range.name.toUpperCase()}</h3>
                  <p className="text-sm text-gray-600">{range.type}</p>
                  <p className="text-blue-600 font-semibold mt-1">→ Atteint R-{range.rValue}</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
                  <p className="text-xs text-gray-600 mb-1">PRIX TOTAL</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(range.totalCost.min)} - {formatPrice(range.totalCost.max)}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-sm text-gray-900">Caractéristiques:</h4>
                  {range.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  <div className="flex items-start space-x-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Épaisseur: ~{range.thickness}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Durabilité: {range.durability}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    ÉCONOMIES ANNUELLES ESTIMÉES
                  </h4>
                  <p className="text-xl font-bold text-green-600 mb-2">
                    {formatPrice(range.annualSavings.min)} - {formatPrice(range.annualSavings.max)}
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Réduction de {formatPercentage(range.heatingReduction.min)}-{formatPercentage(range.heatingReduction.max)} des coûts de chauffage</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Trust Badges Section */}
      <TrustBadges />

      {/* CTA Final */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Prêt à économiser sur vos factures de chauffage?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Obtenez des soumissions détaillées de 3 entrepreneurs certifiés dans votre région. 
            Comparez les prix, les garanties et choisissez le meilleur pour votre projet.
          </p>
          <Button
            onClick={() => {
              track('Get Quotes CTA Clicked', { location: 'final_cta' })
              onComplete()
            }}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 md:py-6 px-6 md:px-12 text-base md:text-lg shadow-xl"
          >
            Obtenir mes 3 soumissions gratuites
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            ⏱️ 24-48h • 🔒 100% gratuit • 📞 Aucune obligation
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
