"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { LeadCapturePopup, type LeadData } from "@/components/lead-capture-popup"
import { AddressInput } from "@/components/address-input"
import { NavLogo } from "@/components/nav-logo"
import {
  Wind,
  Home,
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
import { getCurrentUTMParameters, type UTMParameters } from "@/lib/utm-utils"
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
  const [postalCode, setPostalCode] = useState("")
  const [city, setCity] = useState("")
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
  const [utmParams, setUtmParams] = useState<UTMParameters>({})

  const extractPostalCode = (input: string) => {
    const match = input.match(/[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/)
    return match ? match[0].toUpperCase().replace(/\s+/, " ") : ""
  }

  const getPriceRange = (total?: number) => {
    if (!total || total <= 0) return null
    const min = Math.round(total * 0.95)
    const max = Math.round(total * 1.05)
    return { min, max }
  }

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

  // Capture UTM parameters from URL/session once on mount
  useEffect(() => {
    const params = getCurrentUTMParameters()
    if (Object.keys(params).length > 0) {
      setUtmParams(params)
    }
  }, [])

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
      const detectedPostal = data.roofData?.postalCode || extractPostalCode(data.roofData?.address || address)
      const detectedCity = data.roofData?.city || ""

      setSolarArea(roofArea)
      if (detectedPostal) setPostalCode(detectedPostal)
      if (detectedCity) setCity(detectedCity)
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
    setShowLeadCapture(true)
  }

  // ============================================================================
  // STEP 5: LEAD CAPTURE (GATE)
  // ============================================================================

  const handleLeadSubmit = async (data: LeadData) => {
    setLeadData(data)
    track('HeatPump_Lead_Captured', { email: data.email })

    // Calculer la recommandation
    const rec = await calculateRecommendation()
    const resolvedRec = rec ?? recommendation
    const basePrice = resolvedRec?.recommendation?.totalInvestment
    const priceRange = getPriceRange(basePrice)

    // Generate shared eventId for client/server deduplication
    const eventId = crypto.randomUUID();

    // Facebook Pixel tracking (client-side) — fire before API for reliability
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        service_type: 'thermopompe'
      }, { eventID: eventId });
    }

    // Envoyer le lead au CRM
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          leadType: 'hvac',
          address,
          postalCode,
          city,
          solarArea,
          geometric,
          thermal,
          finalArea,
          wantsOilTankRemoval: thermal.wantsOilTankRemoval ?? null,
          estimatedPrice: basePrice,
          estimatedPriceMin: priceRange?.min,
          estimatedPriceMax: priceRange?.max,
          eventId,
          utmParams: {
            utm_source: utmParams.utm_source,
            utm_campaign: utmParams.utm_campaign,
            utm_content: utmParams.utm_content
          }
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
      return data.recommendation

    } catch (error) {
      console.error('Erreur calcul:', error)
      return null
    }
  }

  // ============================================================================
  // RENDU DES STEPS
  // ============================================================================
  const priceRange = getPriceRange(recommendation?.recommendation?.totalInvestment)

  return (
    <div className="min-h-screen bg-[#fffff6]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffff6]/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between">
            <NavLogo />
            <span className="bg-[#aedee5] text-[#002042] font-source-serif font-semibold text-sm px-3 py-1.5 rounded-full flex items-center gap-1">
              <ThermometerSnowflake className="w-4 h-4" />
              Thermopompes
            </span>
          </div>

          {/* Progress Bar */}
          {currentStep > 1 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-source-serif text-[#10002c]/60">Étape {currentStep} sur 6</span>
                <span className="font-source-serif text-[#10002c]/60">{Math.round(getProgress())}%</span>
              </div>
              <div className="h-2 bg-[#f2f2f7] rounded-full overflow-hidden">
                <div className="h-full bg-[#b9e15c] transition-all duration-500" style={{ width: `${getProgress()}%` }} />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* STEP 1: ADRESSE */}
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-[#10002c] mb-4">
                Obtenez une estimation de thermopompe en{" "}
                <span className="text-[#002042]">60 secondes</span>
              </h1>
            </div>

            <div className="max-w-2xl mx-auto bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 space-y-6">
              <p className="font-source-serif text-sm text-[#10002c]/70">
                Découvrez instantanément vos économies potentielles avec une thermopompe
              </p>
              <Label className="font-source-serif text-lg font-semibold mb-4 block text-[#002042]">
                Entrez votre adresse pour commencer l'analyse
              </Label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <AddressInput
                    onAddressSelect={(value) => {
                      setAddress(value)
                      const pc = extractPostalCode(value)
                      if (pc) setPostalCode(pc)
                    }}
                    onAnalyze={handleAddressSubmit}
                    isLoading={isAnalyzing}
                    className="max-w-full"
                  />
                </div>
                <button
                  onClick={handleAddressSubmit}
                  disabled={!address || isAnalyzing}
                  className="bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <span className="text-[#002042] text-lg font-semibold">Analyser</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-700 p-1">
                <div className="flex items-center bg-white px-3 py-1 rounded-md border">
                  <img src="/hydro-quebec.svg" alt="Hydro-Québec" className="h-6 w-auto" />
                </div>
                <div className="flex items-center bg-white px-3 py-1 rounded-md border">
                  <img src="/Rénoclimat.jpg" alt="Rénoclimat" className="h-6 w-auto" />
                </div>
                <div className="flex items-center bg-white px-3 py-1 rounded-md border">
                  <img src="/Gouvernement_du_Canada_logo.svg" alt="Gouvernement du Canada" className="h-6 w-auto" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="flex flex-col items-center">
                  <img src="/icons/icon-check.svg" alt="" className="w-6 h-6 mb-2" />
                  <span className="font-source-serif text-[#10002c]/70">Analyse IA</span>
                </div>
                <div className="flex flex-col items-center">
                  <img src="/icons/icon-check.svg" alt="" className="w-6 h-6 mb-2" />
                  <span className="font-source-serif text-[#10002c]/70">100% gratuit</span>
                </div>
                <div className="flex flex-col items-center">
                  <img src="/icons/icon-check.svg" alt="" className="w-6 h-6 mb-2" />
                  <span className="font-source-serif text-[#10002c]/70">60 secondes</span>
                </div>
              </div>
            </div>

            {/* Carousel Section */}
            <div className="mt-12 space-y-6">
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                {[
                  { src: "/images/installation-clim.jpg", alt: "Installation de thermopompe" },
                  { src: "/images/Unité extérieure de thermopompe en hiver.jpg", alt: "Unité extérieure de thermopompe en hiver" },
                  { src: "/images/thermompompe-wow.png", alt: "Thermopompe haute efficacité" }
                ].map((item, idx) => (
                  <div
                    key={item.src}
                    className="min-w-[280px] md:min-w-0 md:flex-1 snap-start"
                  >
                    <div className="h-56 rounded-[16px] overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-[#f2f2f7]">
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
                <div key={item.name} className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 space-y-3 h-full">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-[#10002c]">{item.name}</p>
                      <p className="font-source-serif text-sm text-[#10002c]/60">{item.city}</p>
                    </div>
                  </div>
                  <p className="font-source-serif text-[#10002c] text-sm leading-relaxed">
                    "{item.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: RAFFINEMENT GÉOMÉTRIQUE */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 md:p-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#10002c]">
                Pour valider l'analyse satellite, nous avons besoin de précisions
              </h2>
              <p className="font-source-serif text-[#10002c]/70 mt-2">
                Ces informations nous permettent de calculer précisément votre surface habitable
              </p>
            </div>
            <div className="space-y-6 mt-6">
              {/* Nombre d'étages */}
              {geometricQuestionStep === 0 && (
                <div>
                  <Label className="font-source-serif text-lg font-semibold mb-3 block text-[#002042]">
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
                        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-[#aedee5]/20 cursor-pointer transition ${
                          geometric.floors?.toString() === option.value ? "border-[#002042] bg-[#aedee5]/20" : "border-[#f2f2f7]"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`floors-${option.value}`} />
                        <Label htmlFor={`floors-${option.value}`} className="flex-1 cursor-pointer font-source-serif font-semibold text-[#10002c]">
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
                  <Label className="font-source-serif text-lg font-semibold mb-3 block text-[#002042]">
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
                        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-[#aedee5]/20 cursor-pointer transition ${
                          geometric.hasFinishedBasement?.toString() === option.value ? "border-[#002042] bg-[#aedee5]/20" : "border-[#f2f2f7]"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`basement-${option.value}`} />
                        <Label htmlFor={`basement-${option.value}`} className="flex-1 cursor-pointer font-source-serif font-semibold text-[#10002c]">
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
                  <Label className="font-source-serif text-lg font-semibold mb-3 block text-[#002042]">
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
                        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-[#aedee5]/20 cursor-pointer transition ${
                          geometric.garageType === option.value ? "border-[#002042] bg-[#aedee5]/20" : "border-[#f2f2f7]"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`garage-${option.value}`} />
                        <Label htmlFor={`garage-${option.value}`} className="flex-1 cursor-pointer font-source-serif font-semibold text-[#10002c]">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: VALIDATION SURFACE */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 md:p-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#10002c]">
                Validation de la surface habitable
              </h2>
            </div>
            <div className="space-y-6 mt-6">
              <div className="bg-[#aedee5]/20 border-2 border-[#aedee5] rounded-lg p-6 text-center space-y-4">
                <p className="font-source-serif text-[#10002c]">
                  L'IA estime votre surface habitable à
                </p>
                {!isEditingSurface ? (
                  <>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-5xl font-bold text-[#002042]">
                        {formatArea(Number.parseFloat(userCorrectedArea) || estimatedArea)}
                      </p>
                    </div>
                    <button
                      className="bg-white border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-3 px-6 rounded-full hover:bg-[#002042] hover:text-white transition-all text-sm"
                      onClick={() => setIsEditingSurface(true)}
                    >
                      Modifier la surface
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Input
                      type="number"
                      value={userCorrectedArea}
                      onChange={(e) => setUserCorrectedArea(e.target.value)}
                      className="max-w-[200px] text-center text-3xl font-bold h-14"
                    />
                    <span className="text-2xl font-semibold text-[#002042]">pi²</span>
                    <button
                      className="bg-white border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-3 px-6 rounded-full hover:bg-[#002042] hover:text-white transition-all text-sm ml-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => setIsEditingSurface(false)}
                      disabled={!userCorrectedArea}
                    >
                      Terminer
                    </button>
                  </div>
                )}
                <p className="font-source-serif text-sm text-[#10002c]/60">
                  (Basé sur l'analyse satellite et vos réponses — ajustez si nécessaire)
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleSurfaceValidation}
                  disabled={!userCorrectedArea}
                  className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Continuer avec cette surface
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PROFIL THERMIQUE */}
        {currentStep === 4 && (
          <div className="max-w-2xl mx-auto bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 md:p-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#10002c]">
                Profil thermique de votre maison
              </h2>
              <p className="font-source-serif text-[#10002c]/70 mt-2">
                Ces informations nous permettent de calculer précisément vos besoins en chauffage
              </p>
            </div>
            <div className="space-y-6 mt-6">
              {/* Année de construction */}
              {thermalQuestionStep === 0 && (
                <div>
                  <Label className="font-source-serif text-lg font-semibold mb-3 block text-[#002042]">
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
                    <button
                      onClick={() => {
                        if (isValidConstructionYear(thermal.constructionYear)) {
                          setThermalQuestionStep(1)
                          handleThermalSubmit({ constructionYear: thermal.constructionYear })
                        }
                      }}
                      disabled={!isValidConstructionYear(thermal.constructionYear)}
                      className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {/* Isolation refaite - QUESTION CRITIQUE */}
              {thermalQuestionStep === 1 && (
                <div>
                  <Label className="font-source-serif text-lg font-semibold mb-3 block text-[#002042]">
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
                        className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-[#aedee5]/20 cursor-pointer transition ${
                          thermal.insulationUpgraded?.toString() === option.value ? "border-[#002042] bg-[#aedee5]/20" : "border-[#f2f2f7]"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`insulation-${option.value}`} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={`insulation-${option.value}`} className="cursor-pointer font-source-serif font-semibold text-[#10002c] block">
                            {option.label}
                          </Label>
                          <p className="font-source-serif text-sm text-[#10002c]/60 mt-1">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Type de chauffage actuel */}
              {thermalQuestionStep === 2 && (
                <div>
                  <Label className="font-source-serif text-lg font-semibold mb-3 block text-[#002042]">
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
                        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-[#aedee5]/20 cursor-pointer transition ${
                          thermal.currentHeatingType === option.value ? "border-[#002042] bg-[#aedee5]/20" : "border-[#f2f2f7]"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`heating-${option.value}`} />
                        <Label htmlFor={`heating-${option.value}`} className="flex-1 cursor-pointer font-source-serif font-semibold text-[#10002c]">
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
                  <Label className="font-source-serif text-lg font-semibold mb-3 block text-[#002042]">
                    Souhaitez-vous enlever votre réservoir de mazout ?
                  </Label>
                  <p className="font-source-serif text-sm text-[#10002c]/60 mb-4">
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
                        className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-[#aedee5]/20 cursor-pointer transition ${
                          thermal.wantsOilTankRemoval?.toString() === option.value ? "border-[#002042] bg-[#aedee5]/20" : "border-[#f2f2f7]"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={`oil-removal-${option.value}`} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={`oil-removal-${option.value}`} className="cursor-pointer font-source-serif font-semibold text-[#10002c] block">
                            {option.label}
                          </Label>
                          <p className="font-source-serif text-sm text-[#10002c]/60 mt-1">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: LEAD CAPTURE */}
        {currentStep === 5 && showLeadCapture && null}

        {/* STEP 6: RÉSULTATS */}
        {currentStep === 6 && recommendation && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Investissement (mis en avant) */}
            <div className="bg-[#aedee5]/20 border-2 border-[#aedee5] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6">
              <h3 className="text-2xl font-bold text-[#002042] mb-2">Investissement Estimé</h3>
              <p className="font-source-serif text-sm text-[#002042]/70 mb-4">
                Basé sur votre maison et le modèle recommandé.
              </p>
              <div className="space-y-2 text-[#002042]">
                <div className="flex justify-between">
                  <span className="font-source-serif">Équipement:</span>
                  <span className="font-source-serif font-semibold">{formatPrice(recommendation.recommendation.estimatedCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-source-serif">Installation:</span>
                  <span className="font-source-serif font-semibold">{formatPrice(recommendation.recommendation.installationCost)}</span>
                </div>
                <div className="flex justify-center text-lg font-bold border-t-2 border-[#aedee5] pt-3 bg-white rounded-lg px-4 py-3 shadow-sm">
                  {priceRange ? (
                    <span className="text-[#002042] text-3xl font-extrabold font-display">
                      {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                    </span>
                  ) : (
                    <span className="text-[#002042] text-3xl font-extrabold font-display">
                      {formatPrice(recommendation.recommendation.totalInvestment)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA sous l'investissement */}
            <div className="bg-white border-2 border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 text-center">
              <h3 className="font-display text-2xl font-bold text-[#10002c] mb-4">
                Prêt à économiser {formatPrice(recommendation.savings.annualSavings)} par an ?
              </h3>
              <p className="font-source-serif text-[#10002c]/60 mb-6">
                Obtenez jusqu'à 3 soumissions gratuites d'entrepreneurs certifiés
              </p>
              <button
                className="bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg hover:brightness-105 transition-all w-full max-w-xl mx-auto flex items-center justify-center"
                onClick={() => router.push('/success')}
              >
                Obtenir soumissions gratuites
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Hero Results */}
            <div
              className="rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] text-white overflow-hidden"
              style={{ background: "linear-gradient(135deg, #002042 0%, #002042 100%)" }}
            >
              <div className="p-8 text-center">
                <h2 className="font-display text-3xl font-bold mb-4">
                  Votre Rapport d'Économies Personnalisé
                </h2>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                    <p className="font-source-serif text-sm opacity-90 mb-2">Économies Annuelles</p>
                    <p className="font-display text-4xl font-bold">
                      {formatPrice(recommendation.savings.annualSavings)}
                    </p>
                    <p className="font-source-serif text-sm opacity-75 mt-2">
                      {formatPercentage(recommendation.savings.savingsPercentage)} de réduction
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                    <p className="font-source-serif text-sm opacity-90 mb-2">Économies 15 ans</p>
                    <p className="font-display text-4xl font-bold">
                      {formatPrice(recommendation.savings.savings15Years)}
                    </p>
                    <p className="font-source-serif text-sm opacity-75 mt-2">
                      Retour sur investissement
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                    <p className="font-source-serif text-sm opacity-90 mb-2">Période de Retour</p>
                    <p className="font-display text-4xl font-bold">
                      {recommendation.savings.paybackPeriod} ans
                    </p>
                    <p className="font-source-serif text-sm opacity-75 mt-2">
                      Investissement rentable
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandation Technique */}
            <div className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 md:p-8">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-[#10002c] flex items-center">
                  <Wind className="w-8 h-8 mr-3 text-[#002042]" />
                  Thermopompe Recommandée
                </h2>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="font-source-serif text-[#10002c]/60">Modèle</Label>
                    <p className="font-source-serif text-xl font-semibold text-[#10002c]">{recommendation.recommendation.model}</p>
                  </div>
                  <div>
                    <Label className="font-source-serif text-[#10002c]/60">Puissance</Label>
                    <p className="font-source-serif text-xl font-semibold text-[#10002c]">
                      {recommendation.btu.recommendedTonnage} tonnes ({formatBTU(recommendation.btu.totalBTU)} BTU)
                    </p>
                  </div>
                  <div>
                    <Label className="font-source-serif text-[#10002c]/60">Surface Habitable</Label>
                    <p className="font-source-serif text-xl font-semibold text-[#10002c]">{formatArea(recommendation.surface.totalHabitableArea)}</p>
                  </div>
                  <div>
                    <Label className="font-source-serif text-[#10002c]/60">Profil Thermique</Label>
                    <p className="font-source-serif text-xl font-semibold text-[#10002c]">
                      {getThermalProfileDescription(recommendation.btu.effectiveYear)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Back-to-top CTA (uniquement sur l'étape 1) */}
      {currentStep === 1 && (
        <div className="max-w-4xl mx-auto px-4 pb-12 flex justify-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg hover:brightness-105 transition-all"
          >
            Obtenir votre soumission
          </button>
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
