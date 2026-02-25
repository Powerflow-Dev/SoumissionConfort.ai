"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LeadCapturePopup, type LeadData } from "@/components/lead-capture-popup"
import { getCurrentUTMParameters, type UTMParameters } from "@/lib/utm-utils"
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Pencil, Check } from "lucide-react"
import { track } from '@vercel/analytics'

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

interface UserQuestionnaireProps {
  roofData: any
  onComplete: (answers: any, leadData: LeadData, pricingData: any) => void
}

export function UserQuestionnaire({ roofData, onComplete }: UserQuestionnaireProps) {
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [utmParams, setUtmParams] = useState<UTMParameters>({})
  const [answers, setAnswers] = useState({
    heatingSystem: "",
    currentInsulation: "",
    atticAccess: "",
    identifiedProblems: [] as string[],
  })
  const [roofAreaOverride, setRoofAreaOverride] = useState<number>(roofData.roofArea || 1200)
  const [isEditingArea, setIsEditingArea] = useState(false)
  const [areaInputValue, setAreaInputValue] = useState<string>(String(roofData.roofArea || 1200))

  // Extract UTM parameters on component mount
  useEffect(() => {
    const params = getCurrentUTMParameters()
    setUtmParams(params)
    console.log('🏷️ UTM Parameters captured:', params)
  }, [])

  const steps = [
    { 
      title: "Système de chauffage principal", 
      description: "Quel est votre système de chauffage principal?",
      key: "heatingSystem" 
    },
    { 
      title: "État de l'isolation", 
      description: "Quelle est la situation actuelle de votre isolation?",
      key: "currentInsulation" 
    },
    { 
      title: "Accès à l'entre-toit", 
      description: "Comment est l'accès à votre entre-toit?",
      key: "atticAccess" 
    },
    { 
      title: "Problèmes identifiés", 
      description: "Avez-vous identifié des problèmes? (optionnel)",
      key: "identifiedProblems" 
    },
  ]

  const getProgress = () => {
    return ((currentStep + 1) / steps.length) * 100
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return !!answers.heatingSystem
      case 1:
        return !!answers.currentInsulation
      case 2:
        return !!answers.atticAccess
      case 3:
        return true // Problems step is optional
      default:
        return false
    }
  }

  const handleNext = () => {
    // Track step completion
    track('Questionnaire Step Completed', {
      step: currentStep + 1,
      stepName: steps[currentStep].key
    })
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      track('Questionnaire Completed')
      handleGetPricing()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isFormValid = () => {
    return (
      answers.heatingSystem &&
      answers.currentInsulation &&
      answers.atticAccess
    )
  }

  const handleGetPricing = () => {
    if (isFormValid()) {
      track('Lead Capture Popup Opened')
      setShowLeadCapture(true)
    }
  }

  const handleProblemToggle = (problemValue: string) => {
    const current = answers.identifiedProblems || []
    const newProblems = current.includes(problemValue)
      ? current.filter((p) => p !== problemValue)
      : [...current, problemValue]
    setAnswers((prev) => ({ ...prev, identifiedProblems: newProblems }))
  }

  const handleLeadSubmit = async (leadData: LeadData) => {
    setIsSubmittingLead(true)
    console.log('🟢 POPUP FORM SUBMITTED! Starting webhook process...')
    console.log('📝 Lead data:', leadData)
    console.log('🏠 Roof data:', roofData)
    console.log('❓ User answers:', answers)

    try {
      // First calculate pricing
      console.log('💰 Calculating pricing first...')
      let pricingData = null
      
      try {
        // Utiliser le calculateur d'isolation côté client
        const { calculateInsulationPricing } = await import('@/lib/insulation-calculator')
        
        const calculationInputs = {
          roofArea: roofAreaOverride,
          roofPitch: roofData.pitch,
          currentInsulation: answers.currentInsulation || 'partielle',
          atticAccess: answers.atticAccess || 'facile',
          heatingSystem: answers.heatingSystem || 'electricite',
          identifiedProblems: answers.identifiedProblems || [],
        }
        
        pricingData = calculateInsulationPricing(calculationInputs)
        console.log('✅ PRICING CALCULATED:', pricingData)
        
      } catch (pricingError) {
        console.error('💥 Pricing calculation error, using fallback:', pricingError)
        pricingData = {
          adjustedArea: roofData.roofArea || 2000,
          ranges: {
            economique: {
              totalCost: { min: roofData.roofArea * 0.9, max: roofData.roofArea * 1.0 },
              annualSavings: { min: 500, max: 700 },
              paybackPeriod: { min: 3, max: 5 }
            },
            standard: {
              totalCost: { min: roofData.roofArea * 1.2, max: roofData.roofArea * 1.8 },
              annualSavings: { min: 600, max: 900 },
              paybackPeriod: { min: 2.5, max: 4 }
            },
            premium: {
              totalCost: { min: roofData.roofArea * 4.0, max: roofData.roofArea * 6.0 },
              annualSavings: { min: 800, max: 1200 },
              paybackPeriod: { min: 5, max: 8 }
            }
          }
        }
      }

      // Generate shared eventId for client/server deduplication
      const eventId = crypto.randomUUID();

      // Fire Meta Pixel event (client-side)
      if (typeof window.fbq === 'function' && pricingData?.ranges?.standard) {
        const standardRange = pricingData.ranges.standard
        const estimatedValue = (standardRange.totalCost.min + standardRange.totalCost.max) / 2;
        console.log(`📱 Firing Meta Pixel "Lead" event (client-side) with value: ${estimatedValue}, eventId: ${eventId}`);
        window.fbq('track', 'Lead', {
            value: estimatedValue.toFixed(2),
            currency: 'CAD',
            service_type: 'isolation'
        }, { eventID: eventId });
      }

      // Now prepare complete lead data with pricing included
      const leadPayload = {
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        roofData,
        userAnswers: answers,
        pricingData,
        utmParams,
        eventId
      }
      
      console.log('📤 CALLING /api/leads with payload (including pricing):', leadPayload)
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload),
      })
      
      console.log('📥 Response status:', response.status)
      console.log('📥 Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API ERROR - Status:', response.status)
        console.error('❌ API ERROR - Text:', errorText)
        throw new Error(`API call failed: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('✅ WEBHOOK SUBMITTED SUCCESSFULLY:', result)
      
      const leadDataWithId = {
        ...leadData,
        leadId: result.leadId
      }
      
      setShowLeadCapture(false)
      onComplete(answers, leadDataWithId, pricingData)
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in popup submission:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      })
      const fallbackPricing = {
        lowEstimate: roofData.roofArea * 8,
        highEstimate: roofData.roofArea * 12,
        materialType: 'Standard',
        complexity: roofData.pitchComplexity || 'moderate'
      }
      setShowLeadCapture(false)
      onComplete(answers, leadData, fallbackPricing)
    } finally {
      setIsSubmittingLead(false)
      console.log('🏁 Popup submission process COMPLETED')
    }
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4">
        {/* Header with Progress */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            Question {currentStep + 1} sur {steps.length}
          </Badge>

          {/* Superficie modifiable — persiste tout au long du questionnaire */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm">
              <span className="text-gray-500">Superficie estimée :</span>
              {isEditingArea ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={areaInputValue}
                    onChange={(e) => setAreaInputValue(e.target.value)}
                    onBlur={() => {
                      const val = parseInt(areaInputValue)
                      if (val > 100) setRoofAreaOverride(val)
                      else setAreaInputValue(String(roofAreaOverride))
                      setIsEditingArea(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseInt(areaInputValue)
                        if (val > 100) setRoofAreaOverride(val)
                        else setAreaInputValue(String(roofAreaOverride))
                        setIsEditingArea(false)
                      }
                      if (e.key === 'Escape') {
                        setAreaInputValue(String(roofAreaOverride))
                        setIsEditingArea(false)
                      }
                    }}
                    className="w-20 text-sm font-semibold text-center border border-blue-400 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    autoFocus
                  />
                  <span className="text-gray-600 font-medium">pi²</span>
                  <button
                    onClick={() => {
                      const val = parseInt(areaInputValue)
                      if (val > 100) setRoofAreaOverride(val)
                      else setAreaInputValue(String(roofAreaOverride))
                      setIsEditingArea(false)
                    }}
                    className="text-green-600 hover:text-green-700"
                    aria-label="Confirmer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAreaInputValue(String(roofAreaOverride))
                    setIsEditingArea(true)
                  }}
                  className="flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                  aria-label="Modifier la superficie"
                >
                  {roofAreaOverride.toLocaleString('fr-CA')} pi²
                  <Pencil className="w-3 h-3 text-blue-400" />
                </button>
              )}
            </div>
            {roofData.source === 'fallback' && !isEditingArea && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-1">
                Estimation approximative
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{steps[currentStep].title}</h1>
          <p className="text-lg text-gray-600 mb-6">
            {steps[currentStep].description}
          </p>

          {/* Progress Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              {steps.map((step, index) => (
                <span key={index} className={index <= currentStep ? "text-blue-600 font-medium" : ""}>
                  {index + 1}
                </span>
              ))}
            </div>
            <Progress value={getProgress()} className="h-2 bg-gray-200" />
            <p className="text-sm text-gray-500 mt-2">{Math.round(getProgress())}% complété</p>
          </div>
        </div>

        {/* Wizard Card - Single card for all steps */}
        <Card className="border-0 shadow-2xl bg-white">
          <CardContent className="p-8 min-h-[450px] flex flex-col">
            <div className="flex-1">
              {/* Step 0: Système de chauffage */}
              {currentStep === 0 && (
                <RadioGroup
                  value={answers.heatingSystem}
                  onValueChange={(value) => setAnswers((prev) => ({ ...prev, heatingSystem: value }))}
                  className="space-y-3"
                >
                  {[
                    { value: "electricite", label: "Électricité (plinthes, air pulsé, thermopompe)" },
                    { value: "bi-energie", label: "Bi-énergie (Hydro + combustible)" },
                    { value: "gaz", label: "Gaz naturel" },
                    { value: "mazout", label: "Mazout" },
                    { value: "eau-chaude", label: "Système à eau chaude (chaudière/radiateurs)" },
                    { value: "autre", label: "Autre/Combinaison" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                        answers.heatingSystem === option.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                      onClick={() => setAnswers((prev) => ({ ...prev, heatingSystem: option.value }))}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="text-base font-medium cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Step 1: État de l'isolation */}
              {currentStep === 1 && (
                <RadioGroup
                  value={answers.currentInsulation}
                  onValueChange={(value) => setAnswers((prev) => ({ ...prev, currentInsulation: value }))}
                  className="space-y-3"
                >
                  {[
                    { value: "aucune", label: "Aucune isolation ou très peu" },
                    { value: "partielle", label: "Isolation partielle" },
                    { value: "complete", label: "Isolation complète mais ancienne" },
                    { value: "recente", label: "Isolation récente" },
                    { value: "inconnue", label: "Je ne sais pas" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                        answers.currentInsulation === option.value
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white hover:border-green-300"
                      }`}
                      onClick={() => setAnswers((prev) => ({ ...prev, currentInsulation: option.value }))}
                    >
                      <RadioGroupItem value={option.value} id={`insulation-${option.value}`} />
                      <Label htmlFor={`insulation-${option.value}`} className="text-base font-medium cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Step 2: Accès à l'entre-toit */}
              {currentStep === 2 && (
                <RadioGroup
                  value={answers.atticAccess}
                  onValueChange={(value) => setAnswers((prev) => ({ ...prev, atticAccess: value }))}
                  className="space-y-3"
                >
                  {[
                    { value: "facile", label: "Accès facile depuis l'intérieur" },
                    { value: "trappe", label: "Trappe d'accès disponible" },
                    { value: "difficile", label: "Accès difficile ou limité" },
                    { value: "aucun", label: "Aucun accès direct" },
                    { value: "inconnue", label: "Je ne sais pas" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                        answers.atticAccess === option.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 bg-white hover:border-purple-300"
                      }`}
                      onClick={() => setAnswers((prev) => ({ ...prev, atticAccess: option.value }))}
                    >
                      <RadioGroupItem value={option.value} id={`access-${option.value}`} />
                      <Label htmlFor={`access-${option.value}`} className="text-base font-medium cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Step 3: Problèmes identifiés */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">Sélectionnez tous les problèmes qui s'appliquent (optionnel)</p>
                  <div className="space-y-3">
                    {[
                      { value: "moisissure", label: "Moisissure ou humidité" },
                      { value: "courants-air", label: "Courants d'air" },
                      { value: "factures-elevees", label: "Factures d'énergie élevées" },
                      { value: "temperature-inegale", label: "Température inégale entre les pièces" },
                      { value: "glace", label: "Formation de glace sur le toit" },
                      { value: "aucun", label: "Aucun problème identifié" },
                    ].map((problem) => (
                      <div
                        key={problem.value}
                        className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                          answers.identifiedProblems.includes(problem.value)
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 bg-white hover:border-orange-300"
                        }`}
                        onClick={() => handleProblemToggle(problem.value)}
                      >
                        <Checkbox
                          id={problem.value}
                          checked={answers.identifiedProblems.includes(problem.value)}
                          onCheckedChange={() => handleProblemToggle(problem.value)}
                        />
                        <Label htmlFor={problem.value} className="text-base font-medium cursor-pointer flex-1">
                          {problem.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          {/* Navigation Buttons */}
          <div className="border-t p-6 bg-gray-50 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <div className="text-sm text-gray-600">
              Question {currentStep + 1} sur {steps.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Obtenir ma soumission
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Lead Capture Popup */}
      {showLeadCapture && (
        <LeadCapturePopup
          isOpen={showLeadCapture}
          onClose={() => setShowLeadCapture(false)}
          onSubmit={handleLeadSubmit}
          isSubmitting={isSubmittingLead}
          roofData={roofData}
        />
      )}
    </>
  )
}
