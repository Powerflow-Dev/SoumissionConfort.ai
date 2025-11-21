// Algorithme de calcul pour l'isolation d'entretoit

interface CalculationInputs {
  roofArea: number // Superficie en pieds carrés
  roofPitch?: number // Angle de pente en degrés
  currentInsulation: string // "aucune" | "partielle" | "complete" | "recente"
  atticAccess: string // "facile" | "trappe" | "difficile" | "aucun"
  heatingSystem: string // "electricite" | "gaz" | "mazout" | "autre"
  identifiedProblems: string[] // Liste des problèmes identifiés
}

interface InsulationRange {
  name: string
  type: string
  rValue: number
  thickness: string
  durability: string
  pricePerSqFt: { min: number; max: number }
  features: string[]
  icon: string
}

interface CalculationResult {
  adjustedArea: number
  ranges: {
    economique: RangeResult
    standard: RangeResult
    premium: RangeResult
  }
}

interface RangeResult {
  name: string
  type: string
  rValue: number
  thickness: string
  durability: string
  features: string[]
  icon: string
  totalCost: { min: number; max: number }
  annualSavings: { min: number; max: number }
  heatingReduction: { min: number; max: number }
  paybackPeriod: { min: number; max: number }
  savings25Years: { min: number; max: number }
  netGain25Years: { min: number; max: number }
}

// Étape 1: Multiplicateurs de pente
const PITCH_MULTIPLIERS: { [key: string]: number } = {
  '0-15': 1.00,
  '16-20': 1.06,
  '21-25': 1.10,
  '26-30': 1.15,
  '31-35': 1.20,
  '36-40': 1.31,
  '41-45': 1.41,
  '46-50': 1.56,
  '51-55': 1.74,
  '56-60': 1.93,
}

function getPitchMultiplier(pitch: number): number {
  if (pitch <= 15) return 1.00
  if (pitch <= 20) return 1.06
  if (pitch <= 25) return 1.10
  if (pitch <= 30) return 1.15
  if (pitch <= 35) return 1.20
  if (pitch <= 40) return 1.31
  if (pitch <= 45) return 1.41
  if (pitch <= 50) return 1.56
  if (pitch <= 55) return 1.74
  return 1.93
}

// Étape 2: Valeur R actuelle
function getCurrentRValue(currentInsulation: string): number {
  const rValues: { [key: string]: number } = {
    'aucune': 5,
    'partielle': 15,
    'complete': 30,
    'recente': 45,
    'inconnue': 20, // Valeur par défaut
  }
  return rValues[currentInsulation] || 20
}

// Étape 3: Gammes d'isolation (prix réduits de ~48% par rapport aux prix originaux)
const INSULATION_RANGES: { [key: string]: InsulationRange } = {
  economique: {
    name: 'Économique',
    type: 'Fibre de verre soufflée',
    rValue: 50,
    thickness: '12 pouces',
    durability: '20-25 ans',
    pricePerSqFt: { min: 0.47, max: 0.53 },
    features: [
      'Valeur R: 3,2-4,2 par pouce',
      'Installation rapide',
      'Bon rapport qualité-prix',
      'Résistant au feu',
    ],
    icon: '🥉',
  },
  standard: {
    name: 'Standard',
    type: 'Cellulose soufflée',
    rValue: 55,
    thickness: '15 pouces',
    durability: '25-30 ans',
    pricePerSqFt: { min: 0.63, max: 0.95 },
    features: [
      'Valeur R: 3,6-3,8 par pouce',
      'Matériau écologique (recyclé)',
      'Excellente insonorisation',
      'Traitement anti-feu et anti-moisissure',
    ],
    icon: '🥈',
  },
  premium: {
    name: 'Premium',
    type: 'Uréthane giclé à cellules fermées',
    rValue: 60,
    thickness: '10 pouces',
    durability: '30-50 ans',
    pricePerSqFt: { min: 2.10, max: 3.15 },
    features: [
      'Valeur R: 6,0-7,0 par pouce',
      'Barrière d\'air et d\'humidité',
      'Renforce la structure',
      'Performance maximale',
    ],
    icon: '🥇',
  },
}

// Étape 4A: Multiplicateur de complexité d'accès
function getAccessMultiplier(atticAccess: string): number {
  const multipliers: { [key: string]: number } = {
    'facile': 1.00,
    'trappe': 1.10,
    'difficile': 1.30,
    'aucun': 1.30,
    'inconnue': 1.10,
  }
  return multipliers[atticAccess] || 1.10
}

// Étape 4B: Supplément de retrait
function getRemovalSupplement(currentInsulation: string, adjustedArea: number): number {
  // Si l'isolation doit être retirée complètement
  if (currentInsulation === 'complete' || currentInsulation === 'recente') {
    return adjustedArea * 3.00 // $3/pi²
  }
  return 0
}

// Étape 4C: Suppléments pour problèmes
function getProblemSupplements(problems: string[]): number {
  const supplements: { [key: string]: number } = {
    'moisissure': 1750,
    'courants-air': 1000,
    'factures-elevees': 0, // Pas de supplément, c'est un symptôme
    'temperature-inegale': 0, // Pas de supplément, c'est un symptôme
    'glace': 1000, // Ventilation inadéquate
    'vermiculite': 2125,
    'pas-trappe': 550,
  }
  
  return problems.reduce((total, problem) => {
    return total + (supplements[problem] || 0)
  }, 0)
}

// Étape 5: Calcul des économies d'énergie
function calculateEnergySavings(
  adjustedArea: number,
  deltaR: number,
  heatingSystem: string
): { min: number; max: number } {
  // Tarif selon le système de chauffage
  const energyRates: { [key: string]: number } = {
    'electricite': 0.10, // $/kWh
    'gaz': 0.08,
    'mazout': 0.12,
    'autre': 0.10,
  }
  
  const rate = energyRates[heatingSystem] || 0.10
  
  // Formule simplifiée pour le Québec
  const savingsMin = adjustedArea * deltaR * 0.015 * rate
  const savingsMax = adjustedArea * deltaR * 0.018 * rate
  
  return {
    min: Math.round(savingsMin),
    max: Math.round(savingsMax),
  }
}

// Calcul du pourcentage de réduction
function getHeatingReduction(currentInsulation: string, targetR: number, currentR: number): { min: number; max: number } {
  const deltaR = targetR - currentR
  const basePercentage = (deltaR / targetR) * 100
  
  // Facteurs de correction
  const correctionFactors: { [key: string]: number } = {
    'aucune': 0.40,
    'partielle': 0.30,
    'complete': 0.15,
    'recente': 0.05,
    'inconnue': 0.25,
  }
  
  const factor = correctionFactors[currentInsulation] || 0.25
  const adjustedPercentage = basePercentage * factor
  
  return {
    min: Math.round(adjustedPercentage * 0.8),
    max: Math.round(adjustedPercentage * 1.2),
  }
}

// Fonction principale de calcul
export function calculateInsulationPricing(inputs: CalculationInputs): CalculationResult {
  // Étape 1: Superficie ajustée
  const pitchMultiplier = inputs.roofPitch ? getPitchMultiplier(inputs.roofPitch) : 1.00
  const adjustedArea = inputs.roofArea * pitchMultiplier
  
  // Étape 2: R actuel
  const currentR = getCurrentRValue(inputs.currentInsulation)
  
  // Étape 4: Ajustements
  const accessMultiplier = getAccessMultiplier(inputs.atticAccess)
  const removalSupplement = getRemovalSupplement(inputs.currentInsulation, adjustedArea)
  const problemSupplements = getProblemSupplements(inputs.identifiedProblems)
  
  // Calcul pour chaque gamme
  const ranges: any = {}
  
  Object.entries(INSULATION_RANGES).forEach(([key, range]) => {
    // Coût de base
    const baseCostMin = adjustedArea * range.pricePerSqFt.min
    const baseCostMax = adjustedArea * range.pricePerSqFt.max
    
    // Coût total
    const totalCostMin = Math.round(baseCostMin * accessMultiplier + removalSupplement + problemSupplements)
    const totalCostMax = Math.round(baseCostMax * accessMultiplier + removalSupplement + problemSupplements)
    
    // Économies
    const deltaR = range.rValue - currentR
    const annualSavings = calculateEnergySavings(adjustedArea, deltaR, inputs.heatingSystem)
    const heatingReduction = getHeatingReduction(inputs.currentInsulation, range.rValue, currentR)
    
    // Période de retour
    const avgCost = (totalCostMin + totalCostMax) / 2
    const avgSavings = (annualSavings.min + annualSavings.max) / 2
    const paybackMin = Math.round((avgCost / annualSavings.max) * 10) / 10
    const paybackMax = Math.round((avgCost / annualSavings.min) * 10) / 10
    
    // Économies sur 25 ans
    const savings25Min = annualSavings.min * 25
    const savings25Max = annualSavings.max * 25
    
    // Gain net
    const netGainMin = savings25Min - totalCostMax
    const netGainMax = savings25Max - totalCostMin
    
    ranges[key] = {
      ...range,
      totalCost: { min: totalCostMin, max: totalCostMax },
      annualSavings,
      heatingReduction,
      paybackPeriod: { min: paybackMin, max: paybackMax },
      savings25Years: { min: Math.round(savings25Min), max: Math.round(savings25Max) },
      netGain25Years: { min: Math.round(netGainMin), max: Math.round(netGainMax) },
    }
  })
  
  return {
    adjustedArea: Math.round(adjustedArea),
    ranges: {
      economique: ranges.economique,
      standard: ranges.standard,
      premium: ranges.premium,
    },
  }
}

// Fonction helper pour formater les prix
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Fonction helper pour formater les pourcentages
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}
