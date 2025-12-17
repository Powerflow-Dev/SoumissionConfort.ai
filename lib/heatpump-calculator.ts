/**
 * Calculateur de Thermopompes
 * 
 * Calcule les besoins en BTU et les économies potentielles
 * basé sur la surface habitable et le profil thermique de la maison.
 */

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export interface GeometricData {
  solarArea: number           // Surface du toit (Google Solar)
  floors: number              // Nombre d'étages (1, 1.5, 2, 3)
  hasFinishedBasement: boolean
  garageType: 'none' | 'single' | 'double'
}

export interface ThermalProfile {
  constructionYear: number
  insulationUpgraded: boolean  // Isolation refaite/améliorée?
  currentHeatingType: 'electric' | 'forced-air' | 'oil-gas'
}

export interface SurfaceCalculation {
  solarArea: number
  adjustedRoofArea: number    // Solar_Area * 0.85
  garageArea: number          // Garage déduction
  baseArea: number            // (Adjusted - Garage)
  floorsMultiplier: number
  mainFloorArea: number       // Base * Floors
  basementArea: number        // Base * 0.75 si fini
  totalHabitableArea: number  // Surface finale
}

export interface BTUCalculation {
  habitableArea: number
  effectiveYear: number       // Année effective (réelle ou forcée à 2010)
  btuPerSqFt: number         // Facteur BTU selon année effective
  totalBTU: number           // Besoins totaux
  recommendedTonnage: number // En tonnes (1 tonne = 12,000 BTU)
  recommendedModel: string
}

export interface SavingsCalculation {
  habitableArea: number
  currentHeatingType: string
  estimatedCurrentCost: number    // Surface * 0.90$
  savingsPercentage: number       // 35% ou 50% si huile
  annualSavings: number
  savings5Years: number
  savings10Years: number
  savings15Years: number
  paybackPeriod: number
}

export interface HeatPumpRecommendation {
  surface: SurfaceCalculation
  btu: BTUCalculation
  savings: SavingsCalculation
  recommendation: {
    model: string
    tonnage: number
    btuCapacity: number
    estimatedCost: number
    installationCost: number
    totalInvestment: number
  }
}

// ============================================================================
// CONSTANTES
// ============================================================================

// Facteurs BTU par période de construction
const BTU_FACTORS: Record<string, { min: number; max: number; avg: number; label: string }> = {
  'pre-1980': {
    min: 40,
    max: 50,
    avg: 45,
    label: 'Avant 1980 (Passoire thermique)'
  },
  '1980-2005': {
    min: 28,
    max: 32,
    avg: 30,
    label: '1980-2005 (Standard moyen)'
  },
  '2006-2015': {
    min: 23,
    max: 27,
    avg: 25,
    label: '2006-2015 (Bonne isolation)'
  },
  '2016-plus': {
    min: 18,
    max: 22,
    avg: 20,
    label: '2016+ (Novoclimat/Récent)'
  }
}

// Surface typique des garages (en pi²)
const GARAGE_AREAS = {
  none: 0,
  single: 250,    // Garage simple: ~250 pi²
  double: 450     // Garage double: ~450 pi²
}

// Coûts estimés des thermopompes par tonnage
const HEATPUMP_COSTS = {
  1.5: { equipment: 3500, installation: 2500, total: 6000 },
  2.0: { equipment: 4500, installation: 3000, total: 7500 },
  2.5: { equipment: 5500, installation: 3500, total: 9000 },
  3.0: { equipment: 6500, installation: 4000, total: 10500 },
  3.5: { equipment: 7500, installation: 4500, total: 12000 },
  4.0: { equipment: 8500, installation: 5000, total: 13500 },
  5.0: { equipment: 10500, installation: 6000, total: 16500 }
}

// Pourcentage d'économies selon le type de chauffage actuel
const SAVINGS_PERCENTAGE = {
  'electric': 0.35,      // 35% d'économies vs plinthes électriques
  'forced-air': 0.35,    // 35% vs air pulsé électrique
  'oil-gas': 0.50        // 50% vs huile/gaz
}

// ============================================================================
// CALCUL DE LA SURFACE HABITABLE
// ============================================================================

/**
 * Calcule la surface habitable totale basée sur les données géométriques
 */
export function calculateHabitableSurface(data: GeometricData): SurfaceCalculation {
  // Étape 1: Ajuster la surface du toit (85% de la surface satellite)
  const adjustedRoofArea = Math.round(data.solarArea * 0.85)
  
  // Étape 2: Déduire la surface du garage
  const garageArea = GARAGE_AREAS[data.garageType]
  
  // Étape 3: Surface de base (au sol)
  const baseArea = adjustedRoofArea - garageArea
  
  // Étape 4: Multiplicateur d'étages
  let floorsMultiplier = data.floors
  
  // Étape 5: Surface des étages principaux
  const mainFloorArea = Math.round(baseArea * floorsMultiplier)
  
  // Étape 6: Ajouter le sous-sol fini (75% de la surface de base)
  const basementArea = data.hasFinishedBasement ? Math.round(baseArea * 0.75) : 0
  
  // Étape 7: Surface habitable totale
  const totalHabitableArea = mainFloorArea + basementArea
  
  return {
    solarArea: data.solarArea,
    adjustedRoofArea,
    garageArea,
    baseArea,
    floorsMultiplier,
    mainFloorArea,
    basementArea,
    totalHabitableArea
  }
}

// ============================================================================
// CALCUL DES BESOINS EN BTU (avec Année Effective)
// ============================================================================

/**
 * Détermine l'année effective pour le calcul BTU
 * 
 * LOGIQUE CRITIQUE:
 * - Si isolation refaite/améliorée: forcer à 2010 (standard moderne)
 * - Sinon: utiliser l'année de construction réelle
 */
function getEffectiveYear(constructionYear: number, insulationUpgraded: boolean): number {
  if (insulationUpgraded) {
    // Forcer à 2010 = considérer comme maison moderne bien isolée
    return 2010
  }
  return constructionYear
}

/**
 * Détermine le facteur BTU/pi² selon l'année effective
 */
function getBTUFactor(effectiveYear: number): number {
  if (effectiveYear < 1980) {
    return BTU_FACTORS['pre-1980'].avg
  } else if (effectiveYear <= 2005) {
    return BTU_FACTORS['1980-2005'].avg
  } else if (effectiveYear <= 2015) {
    return BTU_FACTORS['2006-2015'].avg
  } else {
    return BTU_FACTORS['2016-plus'].avg
  }
}

/**
 * Calcule les besoins en BTU et recommande une thermopompe
 */
export function calculateBTUNeeds(
  habitableArea: number,
  thermalProfile: ThermalProfile
): BTUCalculation {
  // Étape 1: Déterminer l'année effective
  const effectiveYear = getEffectiveYear(
    thermalProfile.constructionYear,
    thermalProfile.insulationUpgraded
  )
  
  // Étape 2: Obtenir le facteur BTU
  const btuPerSqFt = getBTUFactor(effectiveYear)
  
  // Étape 3: Calculer les besoins totaux
  const totalBTU = Math.round(habitableArea * btuPerSqFt)
  
  // Étape 4: Convertir en tonnage (1 tonne = 12,000 BTU)
  const exactTonnage = totalBTU / 12000
  
  // Étape 5: Arrondir au demi-tonne supérieur
  const recommendedTonnage = Math.ceil(exactTonnage * 2) / 2
  
  // Étape 6: Déterminer le modèle recommandé
  let recommendedModel = ''
  if (recommendedTonnage <= 2) {
    recommendedModel = 'Thermopompe murale (Mini-Split)'
  } else if (recommendedTonnage <= 3) {
    recommendedModel = 'Thermopompe centrale 2-3 tonnes'
  } else if (recommendedTonnage <= 4) {
    recommendedModel = 'Thermopompe centrale 3-4 tonnes'
  } else {
    recommendedModel = 'Thermopompe centrale 4-5 tonnes + appoint'
  }
  
  return {
    habitableArea,
    effectiveYear,
    btuPerSqFt,
    totalBTU,
    recommendedTonnage,
    recommendedModel
  }
}

// ============================================================================
// CALCUL DES ÉCONOMIES
// ============================================================================

/**
 * Calcule les économies potentielles avec une thermopompe
 */
export function calculateSavings(
  habitableArea: number,
  currentHeatingType: 'electric' | 'forced-air' | 'oil-gas'
): SavingsCalculation {
  // Étape 1: Estimer le coût actuel (0.90$ par pi²)
  const estimatedCurrentCost = Math.round(habitableArea * 0.90)
  
  // Étape 2: Déterminer le pourcentage d'économies
  const savingsPercentage = SAVINGS_PERCENTAGE[currentHeatingType]
  
  // Étape 3: Calculer les économies annuelles
  const annualSavings = Math.round(estimatedCurrentCost * savingsPercentage)
  
  // Étape 4: Projections à long terme
  const savings5Years = annualSavings * 5
  const savings10Years = annualSavings * 10
  const savings15Years = annualSavings * 15
  
  // Étape 5: Période de retour (sera calculée avec le coût d'installation)
  const paybackPeriod = 0 // Calculé plus tard
  
  return {
    habitableArea,
    currentHeatingType,
    estimatedCurrentCost,
    savingsPercentage,
    annualSavings,
    savings5Years,
    savings10Years,
    savings15Years,
    paybackPeriod
  }
}

// ============================================================================
// RECOMMANDATION COMPLÈTE
// ============================================================================

/**
 * Génère une recommandation complète de thermopompe
 */
export function generateHeatPumpRecommendation(
  geometric: GeometricData,
  thermal: ThermalProfile
): HeatPumpRecommendation {
  // Étape 1: Calculer la surface habitable
  const surface = calculateHabitableSurface(geometric)
  
  // Étape 2: Calculer les besoins en BTU
  const btu = calculateBTUNeeds(surface.totalHabitableArea, thermal)
  
  // Étape 3: Calculer les économies
  const savings = calculateSavings(surface.totalHabitableArea, thermal.currentHeatingType)
  
  // Étape 4: Obtenir les coûts estimés
  const tonnageKey = btu.recommendedTonnage as keyof typeof HEATPUMP_COSTS
  const costs = HEATPUMP_COSTS[tonnageKey] || HEATPUMP_COSTS[3.0]
  
  // Étape 5: Calculer la période de retour
  const paybackPeriod = savings.annualSavings > 0 
    ? Math.round((costs.total / savings.annualSavings) * 10) / 10
    : 999
  
  return {
    surface,
    btu,
    savings: {
      ...savings,
      paybackPeriod
    },
    recommendation: {
      model: btu.recommendedModel,
      tonnage: btu.recommendedTonnage,
      btuCapacity: btu.totalBTU,
      estimatedCost: costs.equipment,
      installationCost: costs.installation,
      totalInvestment: costs.total
    }
  }
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Valide si une surface estimée semble correcte
 */
export function validateSurfaceEstimate(
  estimatedArea: number,
  userCorrectedArea?: number
): number {
  if (userCorrectedArea && userCorrectedArea > 0) {
    return userCorrectedArea
  }
  return estimatedArea
}

/**
 * Formate un nombre en BTU
 */
export function formatBTU(btu: number): string {
  return new Intl.NumberFormat('fr-CA').format(Math.round(btu))
}

/**
 * Formate un prix en CAD
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Formate une surface en pi²
 */
export function formatArea(area: number): string {
  return `${Math.round(area).toLocaleString('fr-CA')} pi²`
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Obtient une description du profil thermique
 */
export function getThermalProfileDescription(effectiveYear: number): string {
  if (effectiveYear < 1980) {
    return 'Isolation faible - Besoins élevés en chauffage'
  } else if (effectiveYear <= 2005) {
    return 'Isolation standard - Besoins moyens'
  } else if (effectiveYear <= 2015) {
    return 'Bonne isolation - Besoins modérés'
  } else {
    return 'Excellente isolation - Besoins réduits'
  }
}
