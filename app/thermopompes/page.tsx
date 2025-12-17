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
  
  // Résultats
  const [recommendation, setRecommendation] = useState<HeatPumpRecommendation | null>(null)
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [leadData, setLeadData] = useState<LeadData | null>(null)

  // Calcul du progrès
  const getProgress = () => {
    return (currentStep / 6) * 100
  }

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
      
    } catch (error) {
      console.error('Erreur analyse:', error)
      // Fallback: utiliser une valeur par défaut
      setSolarArea(2000)
      setCurrentStep(2)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ============================================================================
  // STEP 2: RAFFINEMENT GÉOMÉTRIQUE
  // ============================================================================
  
  const handleGeometricSubmit = () => {
    if (!geometric.floors || geometric.hasFinishedBasement === undefined || !geometric.garageType) {
      return
    }
    
    track('HeatPump_Geometric_Complete', geometric)
    
    // Calculer la surface estimée
    const adjustedRoof = solarArea * 0.85
    const garageArea = geometric.garageType === 'double' ? 450 : 
                       geometric.garageType === 'single' ? 250 : 0
    const baseArea = adjustedRoof - garageArea
    const mainFloors = baseArea * (geometric.floors || 1)
    const basement = geometric.hasFinishedBasement ? baseArea * 0.75 : 0
    const total = Math.round(mainFloors + basement)
    
    setEstimatedArea(total)
    setCurrentStep(3)
  }

  // ============================================================================
  // STEP 3: VALIDATION DE LA SURFACE
  // ============================================================================
  
  const handleSurfaceValidation = (isCorrect: boolean) => {
    if (isCorrect) {
      setFinalArea(estimatedArea)
      track('HeatPump_Surface_Validated', { area: estimatedArea, corrected: false })
      setCurrentStep(4)
    } else {
      // L'utilisateur va corriger
      track('HeatPump_Surface_Correction_Started')
    }
  }
  
  const handleSurfaceCorrection = () => {
    const corrected = parseInt(userCorrectedArea)
    if (corrected && corrected > 0) {
      setFinalArea(corrected)
      track('HeatPump_Surface_Validated', { area: corrected, corrected: true })
      setCurrentStep(4)
    }
  }

  // ============================================================================
  // STEP 4: PROFIL THERMIQUE
  // ============================================================================
  
  const handleThermalSubmit = () => {
    if (!thermal.constructionYear || 
        thermal.insulationUpgraded === undefined || 
        !thermal.currentHeatingType) {
      return
    }
    
    track('HeatPump_Thermal_Complete', thermal)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img 
              src="/images/logosoumissionconfort-1.png" 
              alt="Soumission Confort AI" 
              className="h-[100px] md:h-[120px] w-auto" 
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <Wind className="w-10 h-10 text-blue-600" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Économisez jusqu'à 50% sur votre chauffage
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Découvrez combien vous pourriez économiser avec une thermopompe
              </p>
            </div>

            <Card className="max-w-2xl mx-auto shadow-2xl border-2 border-blue-100">
              <CardContent className="p-8">
                <Label className="text-lg font-semibold mb-4 block">
                  Entrez votre adresse pour commencer l'analyse
                </Label>
                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    type="text"
                    placeholder="123 Rue Exemple, Montréal, QC"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddressSubmit()}
                    className="flex-1 text-lg h-14"
                    disabled={isAnalyzing}
                  />
                  <Button 
                    onClick={handleAddressSubmit}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 h-14 px-8"
                    disabled={!address || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyse...
                      </>
                    ) : (
                      <>
                        Analyser
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-gray-600">Analyse IA</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-gray-600">Gratuit</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-gray-600">2 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Section */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="border-blue-100">
                <CardHeader>
                  <TrendingDown className="w-10 h-10 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">Économies Garanties</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Réduisez vos coûts de chauffage de 35% à 50%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <Zap className="w-10 h-10 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">Efficacité Maximale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Chauffage et climatisation en un seul système
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <DollarSign className="w-10 h-10 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">Subventions Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Jusqu'à 5,000$ en subventions gouvernementales
                  </p>
                </CardContent>
              </Card>
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
              <div>
                <Label className="text-lg font-semibold mb-3 block">
                  Combien d'étages a votre maison ?
                </Label>
                <RadioGroup
                  value={geometric.floors?.toString()}
                  onValueChange={(value) => setGeometric({ ...geometric, floors: parseFloat(value) })}
                >
                  {[
                    { value: '1', label: '1 étage (plain-pied)' },
                    { value: '1.5', label: '1.5 étage (avec mezzanine)' },
                    { value: '2', label: '2 étages' },
                    { value: '3', label: '3 étages ou plus' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={`floors-${option.value}`} />
                      <Label htmlFor={`floors-${option.value}`} className="flex-1 cursor-pointer font-medium">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Sous-sol fini */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">
                  Avez-vous un sous-sol fini (aménagé) ?
                </Label>
                <RadioGroup
                  value={geometric.hasFinishedBasement?.toString()}
                  onValueChange={(value) => setGeometric({ ...geometric, hasFinishedBasement: value === 'true' })}
                >
                  {[
                    { value: 'true', label: 'Oui, sous-sol aménagé' },
                    { value: 'false', label: 'Non, pas de sous-sol ou non-aménagé' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={`basement-${option.value}`} />
                      <Label htmlFor={`basement-${option.value}`} className="flex-1 cursor-pointer font-medium">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Garage */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">
                  Type de garage attaché ?
                </Label>
                <RadioGroup
                  value={geometric.garageType}
                  onValueChange={(value: any) => setGeometric({ ...geometric, garageType: value })}
                >
                  {[
                    { value: 'none', label: 'Aucun garage ou détaché' },
                    { value: 'single', label: 'Garage simple (1 voiture)' },
                    { value: 'double', label: 'Garage double (2 voitures)' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={`garage-${option.value}`} />
                      <Label htmlFor={`garage-${option.value}`} className="flex-1 cursor-pointer font-medium">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                onClick={handleGeometricSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                disabled={!geometric.floors || geometric.hasFinishedBasement === undefined || !geometric.garageType}
              >
                Continuer
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
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
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                <p className="text-gray-700 mb-2">
                  L'IA estime votre surface habitable à
                </p>
                <p className="text-5xl font-bold text-blue-600 mb-2">
                  {formatArea(estimatedArea)}
                </p>
                <p className="text-sm text-gray-600">
                  (Basé sur l'analyse satellite et vos réponses)
                </p>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-4 block">
                  Est-ce que cela semble correct ?
                </Label>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Button
                    onClick={() => handleSurfaceValidation(true)}
                    variant="outline"
                    className="h-16 text-lg border-2 border-green-500 hover:bg-green-50"
                  >
                    <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                    Oui, c'est correct
                  </Button>
                  <Button
                    onClick={() => handleSurfaceValidation(false)}
                    variant="outline"
                    className="h-16 text-lg border-2 border-orange-500 hover:bg-orange-50"
                  >
                    Non, je veux corriger
                  </Button>
                </div>

                {/* Champ de correction */}
                <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <Label className="font-semibold mb-2 block">
                    Entrez la surface correcte (en pi²)
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder="Ex: 1500"
                      value={userCorrectedArea}
                      onChange={(e) => setUserCorrectedArea(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSurfaceCorrection}
                      disabled={!userCorrectedArea}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Valider
                    </Button>
                  </div>
                </div>
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
              <div>
                <Label className="text-lg font-semibold mb-3 block">
                  Année de construction de la maison ?
                </Label>
                <Input
                  type="number"
                  placeholder="Ex: 1995"
                  value={thermal.constructionYear || ''}
                  onChange={(e) => setThermal({ ...thermal, constructionYear: parseInt(e.target.value) })}
                  className="text-lg h-12"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              {/* Isolation refaite - QUESTION CRITIQUE */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">
                  L'isolation (murs/toit/fenêtres) a-t-elle été refaite ou améliorée significativement depuis la construction ?
                </Label>
                <RadioGroup
                  value={thermal.insulationUpgraded?.toString()}
                  onValueChange={(value) => setThermal({ ...thermal, insulationUpgraded: value === 'true' })}
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
                    <div key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer">
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

              {/* Type de chauffage actuel */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">
                  Type de chauffage actuel ?
                </Label>
                <RadioGroup
                  value={thermal.currentHeatingType}
                  onValueChange={(value: any) => setThermal({ ...thermal, currentHeatingType: value })}
                >
                  {[
                    { value: 'electric', label: 'Plinthes électriques' },
                    { value: 'forced-air', label: 'Air pulsé (fournaise électrique)' },
                    { value: 'oil-gas', label: 'Huile ou Gaz naturel' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={`heating-${option.value}`} />
                      <Label htmlFor={`heating-${option.value}`} className="flex-1 cursor-pointer font-medium">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                onClick={handleThermalSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                disabled={!thermal.constructionYear || thermal.insulationUpgraded === undefined || !thermal.currentHeatingType}
              >
                Voir mon rapport d'économies
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
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

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
                  <h4 className="font-semibold text-lg mb-3">Investissement Estimé</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Équipement:</span>
                      <span className="font-semibold">{formatPrice(recommendation.recommendation.estimatedCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Installation:</span>
                      <span className="font-semibold">{formatPrice(recommendation.recommendation.installationCost)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t-2 pt-2">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatPrice(recommendation.recommendation.totalInvestment)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Final */}
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
                  className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg"
                  onClick={() => router.push('/success')}
                >
                  Obtenir mes soumissions gratuites
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Lead Capture Popup */}
      <LeadCapturePopup
        isOpen={showLeadCapture}
        onSubmit={handleLeadSubmit}
        onClose={() => setShowLeadCapture(false)}
      />
    </div>
  )
}
