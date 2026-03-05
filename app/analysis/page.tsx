"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { UserQuestionnaire } from "@/components/user-questionnaire-wizard"
import { InsulationResults } from "@/components/insulation-results"
import { LeadCaptureForm } from "@/components/lead-capture-form"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { MapPin, Zap, Clock, CheckCircle, Pencil, Check } from 'lucide-react'
import Link from "next/link"
import { NavLogo } from "@/components/nav-logo"
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
  const [isEditingArea, setIsEditingArea] = useState(false)
  const [areaInputValue, setAreaInputValue] = useState("")

  const confirmAreaEdit = () => {
    const val = parseInt(areaInputValue)
    if (val > 100) setRoofData((prev: any) => ({ ...prev, roofArea: val }))
    else setAreaInputValue(String(roofData?.roofArea || ""))
    setIsEditingArea(false)
  }

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
    <div className="min-h-screen bg-[#fffff6] overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffff6]/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between min-w-0">
            <NavLogo />

            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink">
              <div className="flex items-center gap-1 md:gap-2 min-w-0">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-[#002042]/40 shrink-0" />
                <span className="font-source-serif text-xs md:text-sm text-[#10002c] truncate max-w-[120px] md:max-w-xs">{address}</span>
              </div>
              <Badge className="bg-[#aedee5] text-[#002042] border-[#aedee5] text-xs md:text-sm shrink-0">
                <StepIcon className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline font-source-serif">{stepInfo.title}</span>
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            {roofData && roofData.roofArea && currentStep !== "loading" && (
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mb-3">
                <span className="font-source-serif text-sm font-semibold text-[#002042] whitespace-nowrap">Superficie estimée par IA :</span>
                {isEditingArea ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={areaInputValue}
                      onChange={(e) => setAreaInputValue(e.target.value)}
                      onBlur={confirmAreaEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmAreaEdit()
                        if (e.key === 'Escape') { setAreaInputValue(String(roofData.roofArea)); setIsEditingArea(false) }
                      }}
                      className="w-24 font-source-serif text-sm font-semibold text-center border border-[#002042] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#aedee5]"
                      autoFocus
                    />
                    <span className="font-source-serif text-sm text-[#10002c]">pi²</span>
                    <button onClick={confirmAreaEdit} className="p-1 text-[#002042] hover:opacity-70" aria-label="Confirmer">
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAreaInputValue(String(roofData.roofArea)); setIsEditingArea(true) }}
                    className="flex items-center gap-1 font-source-serif text-sm font-bold text-[#002042] hover:opacity-70 transition-opacity"
                    aria-label="Modifier la superficie"
                  >
                    {roofData.roofArea.toLocaleString('fr-CA')} pi²
                    <Pencil className="w-3.5 h-3.5 text-[#002042]/40" />
                  </button>
                )}
              </div>
            )}
            <div className="flex justify-between font-source-serif text-xs text-[#10002c]/60 mb-2">
              <span className={currentStep === "loading" ? "text-[#002042] font-semibold" : ""}>Analyse</span>
              <span className={currentStep === "questionnaire" ? "text-[#002042] font-semibold" : ""}>Questions</span>
              <span className={currentStep === "lead-capture" ? "text-[#002042] font-semibold" : ""}>Connexion</span>
              <span className={currentStep === "pricing" ? "text-[#002042] font-semibold" : ""}>Prix</span>
            </div>
            <div className="h-2 bg-[#f2f2f7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#b9e15c] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
            <p className="font-source-serif text-xs text-[#10002c]/50 mt-1 text-center">{stepInfo.subtitle}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 overflow-x-hidden">
        {currentStep === "loading" && (
          <div className="max-w-3xl mx-auto bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-[#002042] rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="font-display text-3xl font-bold text-[#10002c] mb-2">Analyse de Votre Propriété...</h2>
            <p className="font-source-serif text-[#10002c]/70 text-lg mb-8">Traitement des données par intelligence artificielle</p>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2 text-[#002042] bg-[#aedee5]/20 p-4 rounded-[12px] border border-[#aedee5]">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span className="font-source-serif font-semibold">Données Récupérées</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[#002042] bg-[#b9e15c]/20 p-4 rounded-[12px] border border-[#b9e15c]">
                  <div className="w-5 h-5 border-2 border-[#002042] border-t-transparent rounded-full animate-spin shrink-0"></div>
                  <span className="font-source-serif font-semibold">Analyse Structure</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[#10002c]/40 bg-[#f2f2f7] p-4 rounded-[12px]">
                  <Clock className="w-5 h-5 shrink-0" />
                  <span className="font-source-serif font-semibold">Calcul Complexité</span>
                </div>
              </div>
              <div className="bg-[#fffff6] rounded-[16px] p-6 border border-[#f2f2f7] text-left">
                <p className="font-source-serif font-bold text-[#002042] mb-2">Technologie IA Avancée</p>
                <p className="font-source-serif text-sm text-[#10002c]/70">
                  Notre système analyse plus de 47 points de données incluant la superficie, les obstacles, la difficulté d'accès et les conditions du marché local pour fournir l'estimation la plus précise possible pour votre projet d'isolation.
                </p>
              </div>
              <p className="font-source-serif text-[#10002c]/50">Cela prend généralement 30-60 secondes...</p>
            </div>
          </div>
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
