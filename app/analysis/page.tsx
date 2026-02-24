"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { UserQuestionnaire } from "@/components/user-questionnaire-wizard"
import { InsulationResults } from "@/components/insulation-results"
import { LeadCaptureForm } from "@/components/lead-capture-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { ArrowLeft, MapPin, Zap, Clock, CheckCircle } from 'lucide-react'
import Link from "next/link"
import type { LeadData } from "@/components/lead-capture-popup"
import { Analytics } from "@vercel/analytics/next"

type AnalysisStep = "loading" | "results" | "questionnaire" | "lead-capture" | "pricing"

export default function AnalysisPage() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()

  // State declarations need to come before effects to avoid TDZ errors
  const [currentStep, setCurrentStep] = useState<AnalysisStep>("loading")
  const [roofData, setRoofData] = useState<any>(null)
  const [userAnswers, setUserAnswers] = useState<any>(null)
  const [leadData, setLeadData] = useState<LeadData | null>(null)
  const [pricingData, setPricingData] = useState<any>(null)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  // Ensure viewport resets to top on step change (especially when navigating to questionnaire/pricing pages)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [currentStep])

  const address = useMemo(() => searchParams.get("address") || "", [searchParams])
  const dataParam = useMemo(() => searchParams.get("data"), [searchParams])

  useEffect(() => {
    // Ensure we're on the client side and have an address
    if (typeof window === 'undefined' || hasAnalyzed || !address) return

    const analyzeRoof = async () => {
      setHasAnalyzed(true)

      if (dataParam) {
        try {
          const parsedRoofData = JSON.parse(decodeURIComponent(dataParam))
          setRoofData({ ...parsedRoofData, address })
          setCurrentStep("questionnaire")
          return
        } catch (error) {
          console.error("Error parsing roof data from URL:", error)
        }
      }

      // Log the fetch attempt for debugging
      console.log("Attempting to fetch roof analysis for:", address)
      console.log("API endpoint:", window.location.origin + "/api/roof-analysis")

      try {
        // Use absolute URL to avoid any routing issues
        const apiUrl = `${window.location.origin}/api/roof-analysis`
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
          // Add cache control to prevent stale responses
          cache: 'no-store'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Server error" }))
          console.error("API Error Response:", response.status, errorData)
          throw new Error(errorData.error || `Server error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Roof analysis successful:", data)
        setRoofData({ ...data.roofData, address })
        setCurrentStep("questionnaire")
      } catch (error) {
        console.error("Roof analysis error:", error)
        
        // Provide more specific error messages
        let errorMessage = "Unable to analyze this address. Please try a different address."
        if (error instanceof TypeError && error.message.includes("fetch")) {
          errorMessage = "Network error: Unable to connect to the server. Please refresh the page and try again."
          console.error("Network/CORS error - this may be a hydration issue")
        } else if (error instanceof Error) {
          errorMessage = error.message
        }
        
        setCurrentStep("questionnaire")
        setRoofData({
          address,
          error: errorMessage,
          roofArea: 1400,
          segments: 4,
          pitchComplexity: "moderate",
          buildingHeight: 25,
          obstacles: ["minimal obstacles"],
          accessDifficulty: "easy",
          roofShape: "moderate",
        })
      }
    }

    // Small delay to ensure client is fully mounted
    const timeoutId = setTimeout(() => {
      analyzeRoof()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [address, dataParam, hasAnalyzed])

  const getStepProgress = () => {
    switch (currentStep) {
      case "loading":
        return 33
      case "questionnaire":
        return 50
      case "lead-capture":
        return 75
      case "pricing":
        return 100
      default:
        return 0
    }
  }

  const getStepInfo = () => {
    switch (currentStep) {
      case "loading":
        return { title: "Analyse de Votre Propriété", subtitle: "Traitement des données par IA", icon: Zap }
      case "results":
        return { title: "Analyse Complète", subtitle: "Consultez les détails de votre projet", icon: CheckCircle }
      case "questionnaire":
        return { title: "Détails du Projet", subtitle: "Parlez-nous de vos besoins", icon: Clock }
      case "lead-capture":
        return { title: "Connexion aux Entrepreneurs", subtitle: "Nous vous mettons en contact avec des professionnels", icon: CheckCircle }
      case "pricing":
        return { title: "Résultats de Prix", subtitle: "Votre estimation personnalisée", icon: CheckCircle }
      default:
        return { title: "Traitement", subtitle: "Veuillez patienter", icon: Clock }
    }
  }

  const handleQuestionnaireComplete = async (answers: any, capturedLeadData: LeadData, pricingData: any) => {
    setUserAnswers(answers)
    setLeadData(capturedLeadData)
    setPricingData(pricingData)
    
    // Store pricing data in API and redirect to /pricing page
    const leadId = capturedLeadData.leadId
    if (leadId) {
      try {
        await fetch('/api/pricing-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            roofData,
            userAnswers: answers,
            leadData: capturedLeadData
          })
        })
        
        // Redirect to pricing page
        router.push(`/pricing?leadId=${leadId}`)
      } catch (error) {
        console.error('Error storing pricing data:', error)
        // Fallback to old behavior if API fails
        setCurrentStep("pricing")
      }
    } else {
      // Fallback if no leadId
      setCurrentStep("pricing")
    }
  }

  const handleLeadCaptureComplete = (pricing: any) => {
    setPricingData(pricing)
    setCurrentStep("pricing")
  }

  const stepInfo = getStepInfo()
  const StepIcon = stepInfo.icon

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-2 md:py-3">
          <div className="flex items-center justify-between min-w-0">
            <Link
              href="/"
              className="flex items-center space-x-3"
            >
              <img src="/images/logosoumissionconfort-1.png" alt="Soumission Confort AI" className="h-[120px] md:h-[140px] w-auto" />
            </Link>

            <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-shrink">
              <div className="flex items-center space-x-1 md:space-x-2 min-w-0">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-600 truncate max-w-[120px] md:max-w-xs">{address}</span>
              </div>
              <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs md:text-sm flex-shrink-0">
                <StepIcon className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{stepInfo.title}</span>
              </Badge>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mt-4">
            {roofData && roofData.roofArea && currentStep !== "loading" && (
              <div className="text-center mb-3">
                <p className="text-base md:text-lg text-gray-700">
                  <span className="font-semibold text-teal-600">Superficie estimée par IA:</span> {roofData.roofArea.toLocaleString()} pi²
                </p>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span className={currentStep === "loading" ? "text-teal-600 font-medium" : ""}>Analyse</span>
              <span className={currentStep === "questionnaire" ? "text-teal-600 font-medium" : ""}>Questions</span>
              <span className={currentStep === "lead-capture" ? "text-teal-600 font-medium" : ""}>Connexion</span>
              <span className={currentStep === "pricing" ? "text-teal-600 font-medium" : ""}>Prix</span>
            </div>
            <Progress value={getStepProgress()} className="h-3 bg-gray-200" />
            <p className="text-xs text-gray-500 mt-1 text-center">{stepInfo.subtitle}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 overflow-x-hidden">
        {currentStep === "loading" && (
          <Card className="max-w-3xl mx-auto border-0 shadow-2xl bg-gradient-to-br from-teal-50 to-blue-50">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Analyse de Votre Propriété...</CardTitle>
              <p className="text-gray-600 text-lg">Traitement des données par intelligence artificielle</p>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-4 rounded-xl">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Données Récupérées</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-teal-600 bg-teal-50 p-4 rounded-xl">
                    <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Analyse de la Structure</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-gray-400 bg-gray-50 p-4 rounded-xl">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Calcul de Complexité</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-teal-100">
                  <p className="text-gray-600 mb-2">
                    <strong>Technologie IA Avancée</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Notre système analyse plus de 47 points de données incluant la superficie, les obstacles, la difficulté d'accès et les conditions du marché local pour fournir l'estimation la plus précise possible pour votre projet d'isolation.
                  </p>
                </div>
                <p className="text-gray-500">Cela prend généralement 30-60 secondes...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "questionnaire" && roofData && (
          <UserQuestionnaire roofData={roofData} onComplete={handleQuestionnaireComplete} />
        )}

        {currentStep === "lead-capture" && roofData && userAnswers && leadData && (
          <LeadCaptureForm roofData={roofData} userAnswers={userAnswers} leadData={leadData} onComplete={handleLeadCaptureComplete} />
        )}

        {currentStep === "pricing" && roofData && userAnswers && leadData && (
          <InsulationResults 
            roofData={roofData} 
            userAnswers={userAnswers} 
            leadData={leadData}
            onComplete={() => {
              // Redirect to branded success page after final CTA
              router.push("/success")
            }}
          />
        )}
      </main>
    </div>
  )
}
