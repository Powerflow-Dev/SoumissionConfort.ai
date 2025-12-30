"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { LeadCapturePopup, type LeadData } from "@/components/lead-capture-popup"
import { AddressInput } from "@/components/address-input"
import { 
  Wind, 
  Home, 
  CheckCircle, 
  ArrowRight, 
  Loader2,
  TrendingDown,
  DollarSign,
  Zap,
  ThermometerSnowflake
} from "lucide-react"
import { track } from '@vercel/analytics'
import type { 
  GeometricData, 
  ThermalProfile, 
  HeatPumpRecommendation 
} from "@/lib/heatpump-calculator"
import {
  formatBTU,
  formatPrice,
  formatArea,
  formatPercentage,
  getThermalProfileDescription
} from "@/lib/heatpump-calculator"

type FunnelStep = 1 | 2 | 3 | 4 | 5 | 6

export default function ThermopompesPage() {
  const router = useRouter()
  
  // État du funnel
  const [currentStep, setCurrentStep] = useState<FunnelStep>(1)
  const [address, setAddress] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Données collectées
  const [solarArea, setSolarArea] = useState<number>(0)
  const [geometric, setGeometric] = useState<Partial<GeometricData>>({})
  const [thermal, setThermal] = useState<Partial<ThermalProfile>>({})
  const [estimatedArea, setEstimatedArea] = useState<number>(0)
  const [finalArea, setFinalArea] = useState<number>(0)
  const [userCorrectedArea, setUserCorrectedArea] = useState<string>("")
  const [isEditingSurface, setIsEditingSurface] = useState(false)
  const [geometricQuestionStep, setGeometricQuestionStep] = useState(0)
  const [thermalQuestionStep, setThermalQuestionStep] = useState(0)
  
  // Résultats
  const [recommendation, setRecommendation] = useState<HeatPumpRecommendation | null>(null)
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [leadData, setLeadData] = useState<LeadData | null>(null)

  // Calcul du progrès
  const getProgress = () => {
    return (currentStep / 6) * 100
  }

  const isValidConstructionYear = (year?: number) => {
    const currentYear = new Date().getFullYear()
    return Number.isFinite(year) && (year as number) >= 1900 && (year as number) <= currentYear
  }

  // Garder l'input de surface synchronisé avec l'estimation initiale
  useEffect(() => {
    if (estimatedArea) {
      setUserCorrectedArea(estimatedArea.toString())
      setIsEditingSurface(false)
    }
  }, [estimatedArea])

  // ============================================================================
  // STEP 1: DÉTECTION & HOOK (AUTO)
  // ============================================================================
  
  const handleAddressSubmit = async () => {
    if (!address) return
    
    setIsAnalyzing(true)
    track('HeatPump_Address_Entered', { address })
    
    try {
      // Appel à l'API Google Solar existante
      const response = await fetch('/api/roof-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })
      
      if (!response.ok) {
        throw new Error('Analyse échouée')
      }
      
      const data = await response.json()
      const roofArea = data.roofData?.roofArea || 2000
      
      setSolarArea(roofArea)
      track('HeatPump_Solar_Analysis_Complete', { roofArea })
      
      // Transition immédiate vers Step 2
      setCurrentStep(2)
      setGeometricQuestionStep(0)
      
    } catch (error) {
      console.error('Erreur analyse:', error)
      // Fallback: utiliser une valeur par défaut
      setSolarArea(2000)
      setCurrentStep(2)
      setGeometricQuestionStep(0)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ============================================================================
  // STEP 2: RAFFINEMENT GÉOMÉTRIQUE
  // ============================================================================
  
  const handleGeometricSubmit = (data?: Partial<GeometricData>) => {
    const currentGeometric: GeometricData = {
      solarArea,
      floors: data?.floors ?? geometric.floors ?? 0,
      hasFinishedBasement: data?.hasFinishedBasement ?? geometric.hasFinishedBasement ?? false,
      garageType: data?.garageType ?? geometric.garageType ?? 'none'
    }

    if (!currentGeometric.floors || currentGeometric.hasFinishedBasement === undefined || !currentGeometric.garageType) {
      return
    }
    
    track('HeatPump_Geometric_Complete', currentGeometric)
    
    // Calculer la surface estimée
    const adjustedRoof = solarArea * 0.85
    const garageArea = currentGeometric.garageType === 'double' ? 450 : 
                       currentGeometric.garageType === 'single' ? 250 : 0
    const baseArea = adjustedRoof - garageArea
    const mainFloors = baseArea * (currentGeometric.floors || 1)
    const basement = currentGeometric.hasFinishedBasement ? baseArea * 0.75 : 0
    const total = Math.round(mainFloors + basement)
    
    setEstimatedArea(total)
    setCurrentStep(3)
  }
  const goToNextGeometricQuestion = () => {
    setGeometricQuestionStep((prev) => Math.min(prev + 1, 2))
  }

  const handleGarageSelect = (value: 'none' | 'single' | 'double') => {
    const nextGeometric = { ...geometric, garageType: value }
    setGeometric(nextGeometric)
    if (!nextGeometric.floors || nextGeometric.hasFinishedBasement === undefined) return
    handleGeometricSubmit(nextGeometric as GeometricData)
  }

  // ============================================================================
  // STEP 3: VALIDATION DE LA SURFACE
  // ============================================================================
  
  const handleSurfaceValidation = () => {
    const parsedArea = parseFloat(userCorrectedArea)
    const finalAreaValue = Number.isFinite(parsedArea) && parsedArea > 0 ? parsedArea : estimatedArea

    setFinalArea(finalAreaValue)
    track('HeatPump_Surface_Validated', { area: finalAreaValue, corrected: finalAreaValue !== estimatedArea })
    setCurrentStep(4)
    setThermalQuestionStep(0)
  }

  // ============================================================================
  // STEP 4: PROFIL THERMIQUE
  // ============================================================================
  
  const handleThermalSubmit = (data?: Partial<ThermalProfile>) => {
    const merged = { ...thermal, ...data }
    setThermal(merged)
    
    if (!merged.constructionYear || 
        merged.insulationUpgraded === undefined || 
        !merged.currentHeatingType) {
      return
    }
    
    if (merged.currentHeatingType === 'oil-gas' && merged.wantsOilTankRemoval === undefined) {
      return
    }
    
    track('HeatPump_Thermal_Complete', merged as ThermalProfile)
    setCurrentStep(5)
  }

  // ============================================================================
  // STEP 5: LEAD CAPTURE (GATE)
  // ============================================================================
  
  const handleLeadSubmit = async (data: LeadData) => {
    setLeadData(data)
    track('HeatPump_Lead_Captured', { email: data.email })
    
    // Calculer la recommandation
    await calculateRecommendation()
    
    // Envoyer le lead au CRM
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          leadType: 'heatpump',
          address,
          solarArea,
          geometric,
          thermal,
          finalArea
        })
      })
    } catch (error) {
      console.error('Erreur envoi lead:', error)
    }
    
    setShowLeadCapture(false)
    setCurrentStep(6)
  }

  // ============================================================================
  // STEP 6: CALCUL ET RÉSULTATS
  // ============================================================================
  
  const calculateRecommendation = async () => {
    try {
      const response = await fetch('/api/heatpump-calculation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geometric: {
            solarArea,
            floors: geometric.floors,
            hasFinishedBasement: geometric.hasFinishedBasement,
            garageType: geometric.garageType
          },
          thermal: {
            constructionYear: thermal.constructionYear,
            insulationUpgraded: thermal.insulationUpgraded,
            currentHeatingType: thermal.currentHeatingType
          },
          userCorrectedArea: finalArea !== estimatedArea ? finalArea : undefined
        })
      })
      
      const data = await response.json()
      setRecommendation(data.recommendation)
      track('HeatPump_Recommendation_Generated', {
        btu: data.recommendation.btu.totalBTU,
        tonnage: data.recommendation.btu.recommendedTonnage
      })
      
    } catch (error) {
      console.error('Erreur calcul:', error)
    }
  }

  // ============================================================================
  // RENDU DES STEPS
  // ============================================================================

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img 
              src="/images/logosoumissionconfort-1.png" 
              alt="Soumission Confort AI" 
              className="h-16 w-auto" 
            />
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <ThermometerSnowflake className="w-4 h-4 mr-1" />
              Thermopompes
            </Badge>
          </div>
          
          {/* Progress Bar */}
          {currentStep > 1 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Étape {currentStep} sur 6</span>
                <span>{Math.round(getProgress())}%</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* STEP 1: ADRESSE */}
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Obtenez votre estimation gratuite en{" "}
                <span className="text-green-600">60 secondes</span>
              </h1>
              
            </div>

            <Card className="max-w-2xl mx-auto shadow-2xl border-2 border-blue-100">
              <CardContent className="p-8 space-y-6">
                <p className="text-sm text-gray-600">
                  Découvrez instantanément vos économies potentielles avec une thermopompe
                </p>
                <Label className="text-lg font-semibold mb-4 block">
                  Entrez votre adresse pour commencer l'analyse
                </Label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <AddressInput
                      onAddressSelect={setAddress}
                      onAnalyze={handleAddressSubmit}
                      isLoading={isAnalyzing}
                      className="max-w-full"
                    />
                  </div>
                  <Button 
                    onClick={handleAddressSubmit}
                    size="lg"
                    className="bg-gradient-to-r from-lime-200 via-emerald-300 to-green-500 text-black font-semibold h-14 px-10 shadow-md hover:brightness-95 rounded-full border border-emerald-100"
                    disabled={!address || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyse...
                      </>
                    ) : (
                      <>
                        <span className="text-black text-lg font-semibold">Analyser</span>
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-700 border border-blue-100 rounded-md p-3 bg-blue-50/70">
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border">
                    <img src="/hydro-quebec.svg" alt="Hydro-Québec" className="h-6 w-auto" />
                    <span className="text-xs font-medium">Hydro-Québec</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border">
                    <img src="/Rénoclimat.jpg" alt="Rénoclimat" className="h-6 w-auto" />
                    <span className="text-xs font-medium">Rénoclimat</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border">
                    <img src="/Gouvernement_du_Canada_logo.svg" alt="Gouvernement du Canada" className="h-6 w-auto" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-gray-600">Analyse IA</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-gray-600">100% gratuit</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-gray-600">60 secondes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carousel Section */}
            <div className="mt-12 space-y-6">
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                {[
                  { src: "/images/installation-clim.jpg", alt: "Installation de thermopompe" },
                  { src: "/images/Unité extérieure de thermopompe en hiver.jpg", alt: "Unité extérieure de thermopompe en hiver" },
                  { src: "/images/thermompompe-wow.png", alt: "Thermopompe haute efficacité" }
                ].map((item, idx) => (
                  <div
                    key={item.src}
                    className="min-w-[280px] md:min-w-0 md:flex-1 snap-start"
                  >
                    <div className="h-56 rounded-xl overflow-hidden shadow-md border border-blue-100">
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="h-full w-full object-cover"
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-6 mt-10">
              {[
                { name: "Carole P.", city: "Laval", text: "Évaluation en une minute, subvention confirmée et économies immédiates.", avatar: "/images/CAROLE.jpg" },
                { name: "Jean M.", city: "Québec", text: "Processus simple, équipe rapide et crédits Rénoclimat obtenus.", avatar: "/images/Jean.jpg" },
                { name: "Michael R.", city: "Montréal", text: "Rapport clair et installation recommandée en quelques jours.", avatar: "/images/Michael.jpg" }
              ].map((item) => (
                <Card key={item.name} className="border-blue-100 h-full">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover border"
                        loading="lazy"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.city}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      “{item.text}”
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: RAFFINEMENT GÉOMÉTRIQUE */}
        {currentStep === 2 && (
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                Pour valider l'analyse satellite, nous avons besoin de précisions
              </CardTitle>
              <p className="text-gray-600">
                Ces informations nous permettent de calculer précisément votre surface habitable
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nombre d'étages */}
              {geometricQuestionStep === 0 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Combien d'étages a votre maison ?
                  </Label>
                  <RadioGroup
                    value={geometric.floors?.toString()}
                    onValueChange={(value) => {
                      setGeometric({ ...geometric, floors: parseFloat(value) })
                      goToNextGeometricQuestion()
                    }}
                  >
                    {[
                      { value: '1', label: '1 étage (plain-pied)' },
                      { value: '1.5', label: '1.5 étage (avec mezzanine)' },
                      { value: '2', label: '2 étages' },
                      { value: '3', label: '3 étages ou plus' }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setGeometric({ ...geometric, floors: parseFloat(option.value) })
                          goToNextGeometricQuestion()
                        }}
                        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition ${
                          geometric.floors?.toString() === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`floors-${option.value}`} />
                        <Label htmlFor={`floors-${option.value}`} className="flex-1 cursor-pointer font-medium">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Sous-sol fini */}
              {geometricQuestionStep === 1 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Avez-vous un sous-sol fini (aménagé) ?
                  </Label>
                  <RadioGroup
                    value={geometric.hasFinishedBasement?.toString()}
                    onValueChange={(value) => {
                      setGeometric({ ...geometric, hasFinishedBasement: value === 'true' })
                      goToNextGeometricQuestion()
                    }}
                  >
                    {[
                      { value: 'true', label: 'Oui, sous-sol aménagé' },
                      { value: 'false', label: 'Non, pas de sous-sol ou non-aménagé' }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setGeometric({ ...geometric, hasFinishedBasement: option.value === 'true' })
                          goToNextGeometricQuestion()
                        }}
                        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition ${
                          geometric.hasFinishedBasement?.toString() === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`basement-${option.value}`} />
                        <Label htmlFor={`basement-${option.value}`} className="flex-1 cursor-pointer font-medium">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Garage */}
              {geometricQuestionStep === 2 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Type de garage attaché ?
                  </Label>
                  <RadioGroup
                    value={geometric.garageType}
                    onValueChange={(value: any) => handleGarageSelect(value)}
                  >
                    {[
                      { value: 'none', label: 'Aucun garage ou détaché' },
                      { value: 'single', label: 'Garage simple (1 voiture)' },
                      { value: 'double', label: 'Garage double (2 voitures)' }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => handleGarageSelect(option.value)}
                        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition ${
                          geometric.garageType === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`garage-${option.value}`} />
                        <Label htmlFor={`garage-${option.value}`} className="flex-1 cursor-pointer font-medium">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 3: VALIDATION SURFACE */}
        {currentStep === 3 && (
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                Validation de la surface habitable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center space-y-4">
                <p className="text-gray-700">
                  L'IA estime votre surface habitable à
                </p>
                {!isEditingSurface ? (
                  <>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-5xl font-bold text-blue-600">
                        {formatArea(Number.parseFloat(userCorrectedArea) || estimatedArea)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-white"
                      onClick={() => setIsEditingSurface(true)}
                    >
                      Modifier la surface
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Input
                      type="number"
                      value={userCorrectedArea}
                      onChange={(e) => setUserCorrectedArea(e.target.value)}
                      className="max-w-[200px] text-center text-3xl font-bold h-14"
                    />
                    <span className="text-2xl font-semibold text-blue-700">pi²</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="ml-2"
                      onClick={() => setIsEditingSurface(false)}
                      disabled={!userCorrectedArea}
                    >
                      Terminer
                    </Button>
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  (Basé sur l'analyse satellite et vos réponses — ajustez si nécessaire)
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleSurfaceValidation}
                  className="w-full h-14 text-lg bg-gradient-to-r from-lime-200 via-emerald-300 to-green-500 text-black font-semibold shadow-md hover:brightness-95 rounded-full border border-emerald-100 disabled:opacity-60"
                  disabled={!userCorrectedArea}
                >
                  Continuer avec cette surface
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: PROFIL THERMIQUE */}
        {currentStep === 4 && (
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                Profil thermique de votre maison
              </CardTitle>
              <p className="text-gray-600">
                Ces informations nous permettent de calculer précisément vos besoins en chauffage
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Année de construction */}
              {thermalQuestionStep === 0 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Année de construction de la maison ?
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ex: 1995"
                    value={thermal.constructionYear || ''}
                    onChange={(e) => {
                      const year = parseInt(e.target.value)
                      setThermal({ ...thermal, constructionYear: year })
                    }}
                    className="text-lg h-12"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  <div className="mt-4">
                    <Button
                      onClick={() => {
                        if (isValidConstructionYear(thermal.constructionYear)) {
                          setThermalQuestionStep(1)
                          handleThermalSubmit({ constructionYear: thermal.constructionYear })
                        }
                      }}
                      className="w-full h-12 bg-gradient-to-r from-lime-200 via-emerald-300 to-green-500 text-black font-semibold shadow-md hover:brightness-95 rounded-full border border-emerald-100 disabled:opacity-60"
                      disabled={!isValidConstructionYear(thermal.constructionYear)}
                    >
                      Continuer
                    </Button>
                  </div>
                </div>
              )}

              {/* Isolation refaite - QUESTION CRITIQUE */}
              {thermalQuestionStep === 1 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    L'isolation (murs/toit/fenêtres) a-t-elle été refaite ou améliorée significativement depuis la construction ?
                  </Label>
                  <RadioGroup
                    value={thermal.insulationUpgraded?.toString()}
                    onValueChange={(value) => {
                      setThermal({ ...thermal, insulationUpgraded: value === 'true' })
                      setThermalQuestionStep(2)
                      handleThermalSubmit({ insulationUpgraded: value === 'true' })
                    }}
                  >
                    {[
                      { 
                        value: 'true', 
                        label: 'Oui, isolation améliorée',
                        description: 'Rénovations majeures d\'isolation effectuées'
                      },
                      { 
                        value: 'false', 
                        label: 'Non, isolation d\'origine',
                        description: 'Aucune amélioration majeure depuis la construction'
                      }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setThermal({ ...thermal, insulationUpgraded: option.value === 'true' })
                          setThermalQuestionStep(2)
                          handleThermalSubmit({ insulationUpgraded: option.value === 'true' })
                        }}
                        className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition ${
                          thermal.insulationUpgraded?.toString() === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`insulation-${option.value}`} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={`insulation-${option.value}`} className="cursor-pointer font-medium block">
                            {option.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Type de chauffage actuel */}
              {thermalQuestionStep === 2 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Type de chauffage actuel ?
                  </Label>
                  <RadioGroup
                    value={thermal.currentHeatingType}
                    onValueChange={(value: any) => {
                      setThermal({ ...thermal, currentHeatingType: value, wantsOilTankRemoval: undefined })
                      if (value === 'oil-gas') {
                        setThermalQuestionStep(3)
                      } else {
                        handleThermalSubmit({ currentHeatingType: value, wantsOilTankRemoval: undefined })
                      }
                    }}
                  >
                    {[
                      { value: 'electric', label: 'Plinthes électriques' },
                      { value: 'forced-air', label: 'Air pulsé (fournaise électrique)' },
                      { value: 'bi-energy', label: 'Bi-énergie (Hydro + combustible)' },
                      { value: 'hot-water', label: 'Système à eau chaude (chaudière/radiateurs)' },
                      { value: 'oil-gas', label: 'Huile ou Gaz naturel' }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setThermal({ ...thermal, currentHeatingType: option.value, wantsOilTankRemoval: undefined })
                          if (option.value === 'oil-gas') {
                            setThermalQuestionStep(3)
                          } else {
                            handleThermalSubmit({ currentHeatingType: option.value, wantsOilTankRemoval: undefined })
                          }
                        }}
                        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition ${
                          thermal.currentHeatingType === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`heating-${option.value}`} />
                        <Label htmlFor={`heating-${option.value}`} className="flex-1 cursor-pointer font-medium">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Enlèvement du réservoir de mazout - CONDITIONNEL */}
              {thermal.currentHeatingType === 'oil-gas' && thermalQuestionStep === 3 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Souhaitez-vous enlever votre réservoir de mazout ?
                  </Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Cette opération peut être subventionnée jusqu'à 10,000$ par le gouvernement du Québec lors de l'installation d'une thermopompe.
                  </p>
                  <RadioGroup
                    value={thermal.wantsOilTankRemoval?.toString()}
                    onValueChange={(value) => {
                      setThermal({ ...thermal, wantsOilTankRemoval: value === 'true' })
                      handleThermalSubmit({ wantsOilTankRemoval: value === 'true' })
                    }}
                  >
                    {[
                      { 
                        value: 'true', 
                        label: 'Oui, inclure l\'enlèvement du réservoir',
                        description: 'Coût estimé: 6,000$ (subvention gouvernementale possible)'
                      },
                      { 
                        value: 'false', 
                        label: 'Non, garder le système actuel',
                        description: 'Pas de coût supplémentaire pour l\'enlèvement'
                      }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setThermal({ ...thermal, wantsOilTankRemoval: option.value === 'true' })
                          handleThermalSubmit({ wantsOilTankRemoval: option.value === 'true' })
                        }}
                        className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition ${
                          thermal.wantsOilTankRemoval?.toString() === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`oil-removal-${option.value}`} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={`oil-removal-${option.value}`} className="cursor-pointer font-medium block">
                            {option.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 5: LEAD CAPTURE */}
        {currentStep === 5 && (
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">
                Analyse terminée !
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Où souhaitez-vous recevoir votre rapport d'économies personnalisé ?
              </p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowLeadCapture(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg"
              >
                Recevoir mon rapport gratuit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-gray-600">100% Gratuit</span>
                </div>
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-gray-600">Sans engagement</span>
                </div>
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-gray-600">Instantané</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 6: RÉSULTATS */}
        {currentStep === 6 && recommendation && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Investissement (mis en avant) */}
            <Card className="bg-green-50 border-2 border-green-200">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-green-900 mb-2">Investissement Estimé</h3>
                <p className="text-sm text-green-700 mb-4">
                  Basé sur votre maison et le modèle recommandé.
                </p>
                <div className="space-y-2 text-green-900">
                  <div className="flex justify-between">
                    <span>Équipement:</span>
                    <span className="font-semibold">{formatPrice(recommendation.recommendation.estimatedCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Installation:</span>
                    <span className="font-semibold">{formatPrice(recommendation.recommendation.installationCost)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold border-t-2 border-green-200 pt-3 bg-white rounded-lg px-4 py-3 shadow-sm">
                    <span className="text-2xl text-green-800 font-extrabold">Total</span>
                    <span className="text-green-600 text-3xl font-extrabold">{formatPrice(recommendation.recommendation.totalInvestment)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA sous l'investissement */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Prêt à économiser {formatPrice(recommendation.savings.annualSavings)} par an ?
                </h3>
                <p className="text-gray-600 mb-6">
                  Obtenez jusqu'à 3 soumissions gratuites d'entrepreneurs certifiés
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-14 px-8 text-lg w-full max-w-xl mx-auto shadow-lg hover:shadow-xl transition"
                  onClick={() => router.push('/success')}
                >
                  Obtenir mes soumissions gratuites
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Hero Results */}
            <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-2xl">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Votre Rapport d'Économies Personnalisé
                </h2>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                    <p className="text-sm opacity-90 mb-2">Économies Annuelles</p>
                    <p className="text-4xl font-bold">
                      {formatPrice(recommendation.savings.annualSavings)}
                    </p>
                    <p className="text-sm opacity-75 mt-2">
                      {formatPercentage(recommendation.savings.savingsPercentage)} de réduction
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                    <p className="text-sm opacity-90 mb-2">Économies 15 ans</p>
                    <p className="text-4xl font-bold">
                      {formatPrice(recommendation.savings.savings15Years)}
                    </p>
                    <p className="text-sm opacity-75 mt-2">
                      Retour sur investissement
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                    <p className="text-sm opacity-90 mb-2">Période de Retour</p>
                    <p className="text-4xl font-bold">
                      {recommendation.savings.paybackPeriod} ans
                    </p>
                    <p className="text-sm opacity-75 mt-2">
                      Investissement rentable
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommandation Technique */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Wind className="w-8 h-8 mr-3 text-blue-600" />
                  Thermopompe Recommandée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-600">Modèle</Label>
                    <p className="text-xl font-semibold">{recommendation.recommendation.model}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Puissance</Label>
                    <p className="text-xl font-semibold">
                      {recommendation.btu.recommendedTonnage} tonnes ({formatBTU(recommendation.btu.totalBTU)} BTU)
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Surface Habitable</Label>
                    <p className="text-xl font-semibold">{formatArea(recommendation.surface.totalHabitableArea)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Profil Thermique</Label>
                    <p className="text-xl font-semibold">
                      {getThermalProfileDescription(recommendation.btu.effectiveYear)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </main>

      {/* Back-to-top CTA (uniquement sur l'étape 1) */}
      {currentStep === 1 && (
        <div className="max-w-4xl mx-auto px-4 pb-12 flex justify-center">
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition"
          >
            Obtenir votre soumission
          </Button>
        </div>
      )}

      {/* Lead Capture Popup */}
      <LeadCapturePopup
        isOpen={showLeadCapture}
        onSubmit={handleLeadSubmit}
        onClose={() => setShowLeadCapture(false)}
      />
    </div>
  )
}
