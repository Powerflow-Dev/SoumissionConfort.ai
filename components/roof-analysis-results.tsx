"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/language-context"
import { Home, TrendingUp, AlertTriangle, CheckCircle, Star, Zap, Clock, Shield } from "lucide-react"
import { TrustBadges } from "@/components/trust-badges"
import { track } from '@vercel/analytics'
import { useEffect } from 'react'

interface RoofAnalysisResultsProps {
  roofData: any
  onContinue: () => void
}

export function RoofAnalysisResults({ roofData, onContinue }: RoofAnalysisResultsProps) {
  const { t } = useLanguage()

  // Track when results are viewed
  useEffect(() => {
    track('Analysis Results Viewed', {
      roofArea: roofData.roofArea,
      complexity: roofData.pitchComplexity,
      segments: roofData.segments
    })
  }, [])

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "simple":
        return "bg-green-100 text-green-800 border-green-200"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "complex":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getComplexityText = (complexity: string) => {
    switch (complexity) {
      case "simple":
        return t.simple
      case "moderate":
        return t.moderate
      case "complex":
        return t.complex
      default:
        return complexity
    }
  }

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case "simple":
        return "🟢"
      case "moderate":
        return "🟡"
      case "complex":
        return "🔴"
      default:
        return "⚪"
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-8">
      {/* Mobile-Optimized First Fold CTA */}
      <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 p-4 md:p-8 rounded-2xl border border-green-200 shadow-lg">
        <Badge className="mb-3 bg-orange-100 text-orange-800 border-orange-200 px-3 py-1 text-sm">
          Prochaine étape : obtenez votre soumission personnalisée
        </Badge>
        <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-3">Prêt à connaître votre prix ?</h2>
        <p className="text-base md:text-lg text-gray-600 mb-4 max-w-xl mx-auto">
          Répondez à 5 questions rapides pour obtenir un prix précis d'entrepreneurs en isolation certifiés dans votre région
        </p>
        
        {/* Simplified mobile progress */}
        <div className="mb-4">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Analyse terminée</span>
            <span className="text-gray-400">→</span>
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">Questions suivantes</span>
          </div>
          <Progress value={33} className="h-2 bg-gray-200 max-w-xs mx-auto" />
        </div>

        <Button
          size="lg"
          onClick={() => {
            track('Continue to Questionnaire')
            onContinue()
          }}
          className="w-full md:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-6 md:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
        >
          <Zap className="w-5 h-5 mr-2" />
          Continuer pour obtenir ma soumission
        </Button>
        <p className="text-xs md:text-sm text-gray-500 mt-3">⏱️ 2 min • 🔒 Sécurisé • 📞 Aucun appel indésirable</p>
      </div>

      {/* Success Header with Social Proof */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <Badge className="mb-4 bg-green-100 text-green-800 border-green-200 px-4 py-2">
          <Star className="w-4 h-4 mr-2" />
          Analyse terminée - Joignez-vous à 50 000+ propriétaires
        </Badge>
        <h1 className="text-2xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">🎉 Votre analyse d'isolation est prête !</h1>
        <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto mb-2 md:mb-0">
          Notre IA a analysé votre propriété pour déterminer vos besoins en isolation
        </p>
      </div>

      {/* Key Metrics Cards - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">{t.totalRoofArea}</CardTitle>
              </div>
              <Badge className="bg-blue-600 text-white">Vérifié</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-2">{roofData.roofArea?.toLocaleString() || "N/A"}</div>
            <p className="text-sm text-blue-700 font-medium">{t.squareFeet}</p>
            <div className="mt-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Satellite vérifié</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">{t.roofSegments}</CardTitle>
              </div>
              <Badge className="bg-purple-600 text-white">Détecté par l'IA</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-2">{roofData.segments || "N/A"}</div>
            <p className="text-sm text-purple-700 font-medium">{t.distinctSections}</p>
            <div className="mt-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Complexité analysée</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">{t.complexity}</CardTitle>
              </div>
              <span className="text-2xl">{getComplexityIcon(roofData.pitchComplexity)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <Badge className={`${getComplexityColor(roofData.pitchComplexity)} text-lg px-3 py-1 font-bold`}>
              {getComplexityText(roofData.pitchComplexity)}
            </Badge>
            <p className="text-sm text-orange-700 font-medium mt-2">{t.difficultyLevel}</p>
            <div className="mt-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Facteur de tarification</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse détaillée */}
      <div className="grid grid-cols-1 gap-8">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <span>{t.analysisSummaryTitle}</span>
            </CardTitle>
            <CardDescription className="text-gray-600">{t.analysisSummaryDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <span>🏠</span>
                  <span>{t.buildingHeight}</span>
                </h4>
                <p className="text-lg font-bold text-blue-900">{roofData.buildingHeight || "N/A"} pieds</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <span>🚗</span>
                  <span>{t.accessDifficulty}</span>
                </h4>
                <p className="text-lg font-bold text-green-900 capitalize">{roofData.accessDifficulty || "N/A"}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <span>📐</span>
                  <span>{t.roofShape}</span>
                </h4>
                <p className="text-lg font-bold text-purple-900 capitalize">
                  {getComplexityText(roofData.roofShape) || "N/A"}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <span>📊</span>
                  <span>{t.pitchComplexity}</span>
                </h4>
                <p className="text-lg font-bold text-orange-900 capitalize">
                  {getComplexityText(roofData.pitchComplexity) || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Building Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg">Exactitude de 99,2 %</h3>
              <p className="text-blue-100 text-sm">Analyse satellite vérifiée par des entrepreneurs</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg">Processus de 60 secondes</h3>
              <p className="text-blue-100 text-sm">Obtenez des soumissions plus rapidement que les concurrents</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg">Note de 4,9★</h3>
              <p className="text-blue-100 text-sm">Approuvé par plus de 50 000 propriétaires canadiens</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced CTA Section */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-8 text-center">
          <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200 px-4 py-2">
            ⚡ Prochaine étape : obtenez votre soumission personnalisée
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Prêt à connaître votre prix ?</h2>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Répondez à 5 questions rapides pour obtenir un prix précis d'entrepreneurs en isolation certifiés dans votre région
          </p>

          {/* Progress indicator */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="flex flex-col items-center space-y-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Analyse terminée </span>
              </span>
              <span className="flex flex-col items-center space-y-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Questions suivantes </span>
              </span>
              <span className="flex flex-col items-center space-y-1">
                <Zap className="w-4 h-4 text-gray-400" />
                <span>Obtenir des soumissions </span>
              </span>
            </div>
            <Progress value={33} className="h-3 bg-gray-200" />
          </div>

          <Button
            size="lg"
            onClick={() => {
              track('Continue to Questionnaire')
              onContinue()
            }}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Zap className="w-6 h-6 mr-3" />
            Continuer pour obtenir ma soumission
          </Button>
          <p className="text-sm text-gray-500 mt-4">⏱️ 2 minutes • 🔒 100 % sécurisé • 📞 Aucun appel indésirable</p>
        </CardContent>
      </Card>

      {/* Trust Badges Section */}
      <TrustBadges />
    </div>
  )
}
