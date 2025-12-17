/**
 * Calculateur d'Efficacité de Chauffage
 * 
 * Ce module calcule les besoins en chauffage (BTU) pour une maison
 * et recommande des systèmes de chauffage appropriés.
 * 
 * Basé sur les normes québécoises et les facteurs climatiques locaux.
 */

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export interface RoomData {
  id: string
  name: string
  length: number                    // Pieds
  width: number                     // Pieds
  height: number                    // Pieds (défaut: 8)
  floor: number                     // 0=sous-sol, 1=RDC, 2=étage, etc.
  hasWindows: boolean
  windowCount: number
  windowSize: 'small' | 'medium' | 'large'
  exposureDirection: 'north' | 'south' | 'east' | 'west'
  insulationQuality: 'poor' | 'average' | 'good' | 'excellent'
}

export interface HouseData {
  address: string
  city: string
  province: string
  climateZone: string
  rooms: RoomData[]
  totalFloors: number
  houseAge: number
  constructionType: 'wood' | 'brick' | 'concrete' | 'mixed'
  basementType: 'none' | 'unfinished' | 'finished'
  atticType: 'none' | 'unfinished' | 'finished'
  currentHeatingSystem?: string
  currentAnnualCost?: number
}

export interface RoomBTUResult {
  roomId: string
  roomName: string
  area: number
  btuRequired: number
  btuPerSqFt: number
  floor: number
  factors: {
    base: number
    insulation: number
    ceiling: number
    exposure: number
    windows: number
    floorMultiplier: number
    age: number
  }
}

export interface BTUCalculationResult {
  totalBTU: number
  totalArea: number
  averageBTUPerSqFt: number
  roomResults: RoomBTUResult[]
  byFloor: {
    floor: number
    area: number
    btu: number
    rooms: number
  }[]
}

export interface HeatingDevice {
  id: string
  type: string
  name: string
  nameFr: string
  btuRange: { min: number; max: number }
  efficiency: number              // COP pour thermopompes, AFUE pour fournaises
  priceRange: { min: number; max: number }
  installationCost: { min: number; max: number }
  operatingCostPerYear: number
  lifespan: number
  pros: string[]
  cons: string[]
  idealFor: string[]
  energySource: 'electricity' | 'gas' | 'propane' | 'oil' | 'wood' | 'pellets'
}

export interface HeatingRecommendation {
  budget: 'economique' | 'standard' | 'premium'
  primarySystem: {
    device: HeatingDevice
    quantity: number
    totalBTU: number
    totalCost: number
    installationCost: number
    annualOperatingCost: number
    coverage: string[]
    placement: { roomId: string; deviceCount: number }[]
  }
  supplementarySystem?: {
    device: HeatingDevice
    quantity: number
    totalBTU: number
    totalCost: number
    coverage: string[]
  }
  totalInvestment: number
  annualOperatingCost: number
  annualSavingsVsCurrent: number
  paybackPeriod: number
  co2ReductionKg: number
  recommendations: string[]
  warnings: string[]
}

// ============================================================================
// CONSTANTES - ZONES CLIMATIQUES DU QUÉBEC
// ============================================================================

export const QUEBEC_CLIMATE_ZONES: Record<string, {
  name: string
  nameFr: string
  btuPerSqFt: number
  heatingDegreeDays: number
  cities: string[]
}> = {
  'montreal': {
    name: 'Montreal Region',
    nameFr: 'Région de Montréal',
    btuPerSqFt: 45,
    heatingDegreeDays: 4300,
    cities: ['montréal', 'laval', 'longueuil', 'terrebonne', 'brossard', 'saint-jean-sur-richelieu']
  },
  'quebec-city': {
    name: 'Quebec City Region',
    nameFr: 'Région de Québec',
    btuPerSqFt: 50,
    heatingDegreeDays: 4900,
    cities: ['québec', 'lévis', 'beauport', 'sainte-foy']
  },
  'mauricie': {
    name: 'Mauricie',
    nameFr: 'Mauricie',
    btuPerSqFt: 50,
    heatingDegreeDays: 5000,
    cities: ['trois-rivières', 'shawinigan', 'grand-mère']
  },
  'estrie': {
    name: 'Eastern Townships',
    nameFr: 'Estrie',
    btuPerSqFt: 48,
    heatingDegreeDays: 4600,
    cities: ['sherbrooke', 'magog', 'granby']
  },
  'outaouais': {
    name: 'Outaouais',
    nameFr: 'Outaouais',
    btuPerSqFt: 47,
    heatingDegreeDays: 4500,
    cities: ['gatineau', 'hull', 'aylmer']
  },
  'saguenay': {
    name: 'Saguenay-Lac-Saint-Jean',
    nameFr: 'Saguenay-Lac-Saint-Jean',
    btuPerSqFt: 55,
    heatingDegreeDays: 5500,
    cities: ['saguenay', 'chicoutimi', 'alma', 'roberval']
  },
  'abitibi': {
    name: 'Abitibi-Témiscamingue',
    nameFr: 'Abitibi-Témiscamingue',
    btuPerSqFt: 60,
    heatingDegreeDays: 6000,
    cities: ['rouyn-noranda', 'val-d\'or', 'amos']
  },
  'cote-nord': {
    name: 'North Shore',
    nameFr: 'Côte-Nord',
    btuPerSqFt: 60,
    heatingDegreeDays: 6200,
    cities: ['sept-îles', 'baie-comeau', 'port-cartier']
  },
  'bas-saint-laurent': {
    name: 'Lower St. Lawrence',
    nameFr: 'Bas-Saint-Laurent',
    btuPerSqFt: 52,
    heatingDegreeDays: 5100,
    cities: ['rimouski', 'rivière-du-loup', 'matane']
  }
}

// ============================================================================
// CONSTANTES - FACTEURS DE CORRECTION
// ============================================================================

export const CORRECTION_FACTORS = {
  // Qualité d'isolation
  insulation: {
    poor: 1.30,       // Mauvaise isolation (pré-1980)
    average: 1.10,    // Isolation moyenne (1980-2000)
    good: 1.00,       // Bonne isolation (2000-2010)
    excellent: 0.85   // Excellente isolation (post-2010, R-40+)
  },
  
  // Hauteur de plafond (ratio par rapport à 8 pieds)
  ceilingHeight: (height: number): number => {
    return height / 8
  },
  
  // Exposition au soleil et aux vents
  exposure: {
    north: 1.15,      // Côté nord (plus froid, moins de soleil)
    east: 1.05,       // Côté est (soleil matin)
    west: 1.05,       // Côté ouest (soleil après-midi)
    south: 0.95       // Côté sud (plus de soleil, plus chaud)
  },
  
  // Fenêtres
  windows: {
    small: 1.00,      // Petites fenêtres (< 10 pi²)
    medium: 1.10,     // Fenêtres moyennes (10-20 pi²)
    large: 1.20       // Grandes fenêtres (> 20 pi²)
  },
  
  // Étage
  floor: {
    basement: 0.80,   // Sous-sol (plus chaud, terre isolante)
    ground: 1.00,     // Rez-de-chaussée
    upper: 1.10,      // Étage supérieur (plus de perte de chaleur)
    attic: 1.25       // Grenier aménagé (beaucoup de perte)
  },
  
  // Âge de la maison
  age: (years: number): number => {
    if (years < 10) return 0.90      // Neuve (< 10 ans)
    if (years < 30) return 1.00      // Récente (10-30 ans)
    if (years < 50) return 1.15      // Ancienne (30-50 ans)
    return 1.30                       // Très ancienne (> 50 ans)
  },
  
  // Type de construction
  construction: {
    wood: 1.05,       // Bois (isolation standard)
    brick: 1.00,      // Brique (bonne masse thermique)
    concrete: 0.95,   // Béton (excellente masse thermique)
    mixed: 1.00       // Mixte
  }
}

// ============================================================================
// CONSTANTES - COÛTS D'ÉNERGIE AU QUÉBEC (2024)
// ============================================================================

export const ENERGY_COSTS_QC = {
  electricity: {
    rate: 0.0735,     // $/kWh (tarif D résidentiel Hydro-Québec)
    unit: 'kWh',
    btuPerUnit: 3412,
    co2PerUnit: 0.001 // kg CO2/kWh (hydroélectricité)
  },
  naturalGas: {
    rate: 0.45,       // $/m³ (Énergir)
    unit: 'm³',
    btuPerUnit: 35300,
    co2PerUnit: 1.9   // kg CO2/m³
  },
  propane: {
    rate: 0.65,       // $/litre
    unit: 'L',
    btuPerUnit: 25000,
    co2PerUnit: 1.5   // kg CO2/L
  },
  oil: {
    rate: 1.30,       // $/litre
    unit: 'L',
    btuPerUnit: 38000,
    co2PerUnit: 2.7   // kg CO2/L
  },
  wood: {
    rate: 250,        // $/corde
    unit: 'corde',
    btuPerUnit: 20000000,
    co2PerUnit: 0     // Neutre en carbone
  },
  pellets: {
    rate: 300,        // $/tonne
    unit: 'tonne',
    btuPerUnit: 16500000,
    co2PerUnit: 0     // Neutre en carbone
  }
}

// ============================================================================
// CONSTANTES - APPAREILS DE CHAUFFAGE
// ============================================================================

export const HEATING_DEVICES: HeatingDevice[] = [
  {
    id: 'heat-pump-mini-split',
    type: 'heat-pump',
    name: 'Mini-Split Heat Pump',
    nameFr: 'Thermopompe murale (mini-split)',
    btuRange: { min: 9000, max: 36000 },
    efficiency: 3.5,  // COP moyen
    priceRange: { min: 1500, max: 4500 },
    installationCost: { min: 800, max: 2000 },
    operatingCostPerYear: 400,
    lifespan: 15,
    energySource: 'electricity',
    pros: [
      'Très efficace (COP 3.5+)',
      'Chauffage et climatisation',
      'Économies d\'énergie importantes',
      'Contrôle de température précis',
      'Silencieux',
      'Pas de conduits nécessaires'
    ],
    cons: [
      'Coût initial élevé',
      'Nécessite entretien régulier',
      'Performance réduite sous -15°C',
      'Unité extérieure visible',
      'Nécessite électricien et frigoriste'
    ],
    idealFor: [
      'Pièces individuelles',
      'Maisons bien isolées',
      'Zones spécifiques',
      'Ajout à système existant'
    ]
  },
  {
    id: 'heat-pump-central',
    type: 'heat-pump',
    name: 'Central Heat Pump',
    nameFr: 'Thermopompe centrale',
    btuRange: { min: 24000, max: 60000 },
    efficiency: 3.2,
    priceRange: { min: 5000, max: 12000 },
    installationCost: { min: 3000, max: 6000 },
    operatingCostPerYear: 1200,
    lifespan: 15,
    energySource: 'electricity',
    pros: [
      'Chauffe toute la maison',
      'Très efficace',
      'Climatisation incluse',
      'Distribution uniforme',
      'Augmente valeur de la propriété',
      'Éligible aux subventions'
    ],
    cons: [
      'Investissement initial important',
      'Nécessite système de conduits',
      'Installation complexe',
      'Chauffage d\'appoint nécessaire par grand froid'
    ],
    idealFor: [
      'Maisons entières',
      'Nouvelles constructions',
      'Rénovations majeures',
      'Remplacement de fournaise'
    ]
  },
  {
    id: 'electric-baseboard',
    type: 'electric',
    name: 'Electric Baseboard',
    nameFr: 'Plinthe électrique',
    btuRange: { min: 500, max: 2000 },
    efficiency: 1.0,
    priceRange: { min: 50, max: 300 },
    installationCost: { min: 150, max: 400 },
    operatingCostPerYear: 800,
    lifespan: 20,
    energySource: 'electricity',
    pros: [
      'Coût initial très bas',
      'Installation simple',
      'Fiable et durable',
      'Pas d\'entretien',
      'Contrôle par pièce',
      'Silencieux'
    ],
    cons: [
      'Coûts d\'opération élevés',
      'Moins efficace (100% vs COP 3+)',
      'Prend de l\'espace au sol',
      'Chauffe lentement',
      'Assèche l\'air'
    ],
    idealFor: [
      'Budget limité',
      'Chauffage d\'appoint',
      'Petites pièces',
      'Rénovations simples'
    ]
  },
  {
    id: 'radiant-floor',
    type: 'electric',
    name: 'Radiant Floor Heating',
    nameFr: 'Plancher radiant électrique',
    btuRange: { min: 10, max: 15 },  // Par pied carré
    efficiency: 1.0,
    priceRange: { min: 10, max: 20 },  // Par pied carré
    installationCost: { min: 15, max: 30 },  // Par pied carré
    operatingCostPerYear: 600,
    lifespan: 30,
    energySource: 'electricity',
    pros: [
      'Confort optimal',
      'Distribution uniforme de chaleur',
      'Invisible',
      'Silencieux',
      'Pas d\'entretien',
      'Efficace avec thermostat programmable'
    ],
    cons: [
      'Installation coûteuse',
      'Nécessite rénovation du plancher',
      'Temps de chauffe lent',
      'Difficile à réparer',
      'Pas de climatisation'
    ],
    idealFor: [
      'Salles de bain',
      'Cuisines',
      'Nouvelles constructions',
      'Rénovations majeures'
    ]
  },
  {
    id: 'gas-furnace',
    type: 'furnace',
    name: 'Natural Gas Furnace',
    nameFr: 'Fournaise au gaz naturel',
    btuRange: { min: 40000, max: 120000 },
    efficiency: 0.95,  // AFUE
    priceRange: { min: 2500, max: 6000 },
    installationCost: { min: 2000, max: 4000 },
    operatingCostPerYear: 900,
    lifespan: 20,
    energySource: 'gas',
    pros: [
      'Coûts d\'opération modérés',
      'Chauffe rapidement',
      'Fiable par grand froid',
      'Longue durée de vie',
      'Distribution par conduits'
    ],
    cons: [
      'Nécessite gaz naturel',
      'Entretien annuel requis',
      'Émissions de CO2',
      'Nécessite système de ventilation',
      'Pas de climatisation (sauf si ajout)'
    ],
    idealFor: [
      'Maisons avec accès au gaz',
      'Climats très froids',
      'Grandes maisons',
      'Remplacement de vieille fournaise'
    ]
  },
  {
    id: 'wood-pellet-stove',
    type: 'biomass',
    name: 'Wood Pellet Stove',
    nameFr: 'Poêle aux granules',
    btuRange: { min: 8000, max: 50000 },
    efficiency: 0.85,
    priceRange: { min: 2000, max: 5000 },
    installationCost: { min: 1500, max: 3000 },
    operatingCostPerYear: 700,
    lifespan: 15,
    energySource: 'pellets',
    pros: [
      'Combustible renouvelable',
      'Coûts d\'opération bas',
      'Ambiance chaleureuse',
      'Autonome en cas de panne',
      'Neutre en carbone',
      'Éligible aux subventions'
    ],
    cons: [
      'Nécessite espace de stockage',
      'Entretien régulier',
      'Chargement manuel',
      'Nécessite cheminée',
      'Distribution de chaleur limitée'
    ],
    idealFor: [
      'Zones rurales',
      'Chauffage principal ou d\'appoint',
      'Écologistes',
      'Maisons avec cheminée existante'
    ]
  }
]

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Détermine la zone climatique basée sur la ville
 */
export function getClimateZoneFromCity(city: string): string {
  const normalizedCity = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  for (const [zone, data] of Object.entries(QUEBEC_CLIMATE_ZONES)) {
    const found = data.cities.some(c => {
      const normalizedZoneCity = c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return normalizedCity.includes(normalizedZoneCity) || normalizedZoneCity.includes(normalizedCity)
    })
    if (found) return zone
  }
  
  return 'montreal' // Défaut
}

/**
 * Obtient le BTU de base par pied carré pour une zone
 */
export function getBaseBTUPerSqFt(climateZone: string): number {
  return QUEBEC_CLIMATE_ZONES[climateZone]?.btuPerSqFt || 50
}

// ============================================================================
// CALCUL BTU POUR UNE PIÈCE
// ============================================================================

/**
 * Calcule les BTU nécessaires pour une pièce spécifique
 */
export function calculateRoomBTU(
  room: RoomData,
  climateZone: string,
  houseAge: number,
  constructionType: string = 'wood'
): RoomBTUResult {
  // Superficie de base
  const area = room.length * room.width
  
  // BTU de base selon la zone climatique
  const baseBTUPerSqFt = getBaseBTUPerSqFt(climateZone)
  let totalBTU = area * baseBTUPerSqFt
  
  // Facteurs de correction
  const factors = {
    base: baseBTUPerSqFt,
    insulation: CORRECTION_FACTORS.insulation[room.insulationQuality],
    ceiling: CORRECTION_FACTORS.ceilingHeight(room.height),
    exposure: CORRECTION_FACTORS.exposure[room.exposureDirection],
    windows: 1.0,
    floorMultiplier: 1.0,
    age: CORRECTION_FACTORS.age(houseAge)
  }
  
  // Appliquer facteur d'isolation
  totalBTU *= factors.insulation
  
  // Appliquer facteur de hauteur de plafond
  totalBTU *= factors.ceiling
  
  // Appliquer facteur d'exposition
  totalBTU *= factors.exposure
  
  // Appliquer facteur de fenêtres
  if (room.hasWindows) {
    factors.windows = CORRECTION_FACTORS.windows[room.windowSize]
    totalBTU *= factors.windows
    // Ajouter BTU supplémentaires par fenêtre
    totalBTU += room.windowCount * 1000
  }
  
  // Appliquer facteur d'étage
  const floorType = room.floor === 0 ? 'basement' : 
                    room.floor === 1 ? 'ground' : 
                    room.floor >= 3 ? 'attic' : 'upper'
  factors.floorMultiplier = CORRECTION_FACTORS.floor[floorType]
  totalBTU *= factors.floorMultiplier
  
  // Appliquer facteur d'âge
  totalBTU *= factors.age
  
  // Appliquer facteur de construction
  const constructionFactor = CORRECTION_FACTORS.construction[constructionType as keyof typeof CORRECTION_FACTORS.construction] || 1.0
  totalBTU *= constructionFactor
  
  return {
    roomId: room.id,
    roomName: room.name,
    area,
    btuRequired: Math.round(totalBTU),
    btuPerSqFt: Math.round(totalBTU / area),
    floor: room.floor,
    factors
  }
}

// ============================================================================
// CALCUL BTU POUR TOUTE LA MAISON
// ============================================================================

/**
 * Calcule les BTU nécessaires pour toute la maison
 */
export function calculateHouseBTU(houseData: HouseData): BTUCalculationResult {
  // Calculer BTU pour chaque pièce
  const roomResults = houseData.rooms.map(room =>
    calculateRoomBTU(room, houseData.climateZone, houseData.houseAge, houseData.constructionType)
  )
  
  // Totaux
  const totalBTU = roomResults.reduce((sum, r) => sum + r.btuRequired, 0)
  const totalArea = roomResults.reduce((sum, r) => sum + r.area, 0)
  
  // Grouper par étage
  const floorMap = new Map<number, { area: number; btu: number; rooms: number }>()
  
  roomResults.forEach(result => {
    const existing = floorMap.get(result.floor) || { area: 0, btu: 0, rooms: 0 }
    floorMap.set(result.floor, {
      area: existing.area + result.area,
      btu: existing.btu + result.btuRequired,
      rooms: existing.rooms + 1
    })
  })
  
  const byFloor = Array.from(floorMap.entries())
    .map(([floor, data]) => ({ floor, ...data }))
    .sort((a, b) => a.floor - b.floor)
  
  return {
    totalBTU,
    totalArea,
    averageBTUPerSqFt: Math.round(totalBTU / totalArea),
    roomResults,
    byFloor
  }
}

// ============================================================================
// RECOMMANDATIONS D'APPAREILS
// ============================================================================

/**
 * Recommande des systèmes de chauffage basés sur les besoins
 */
export function recommendHeatingSystem(
  houseData: HouseData,
  btuCalculation: BTUCalculationResult,
  budget: 'economique' | 'standard' | 'premium',
  currentAnnualCost: number = 1500
): HeatingRecommendation {
  const { totalBTU, totalArea, roomResults } = btuCalculation
  
  let primaryDevice: HeatingDevice
  let quantity: number
  let placement: { roomId: string; deviceCount: number }[] = []
  
  // Sélection du système selon le budget et les besoins
  if (budget === 'economique') {
    // Plinthes électriques
    primaryDevice = HEATING_DEVICES.find(d => d.id === 'electric-baseboard')!
    quantity = roomResults.length // Une par pièce
    placement = roomResults.map(r => ({ roomId: r.roomId, deviceCount: 1 }))
    
  } else if (budget === 'standard') {
    // Mini-splits
    primaryDevice = HEATING_DEVICES.find(d => d.id === 'heat-pump-mini-split')!
    
    // Calculer nombre de mini-splits nécessaires (max 36,000 BTU chacun)
    quantity = Math.ceil(totalBTU / 30000)
    
    // Placer dans les plus grandes pièces
    const sortedRooms = [...roomResults].sort((a, b) => b.btuRequired - a.btuRequired)
    placement = sortedRooms.slice(0, quantity).map(r => ({ roomId: r.roomId, deviceCount: 1 }))
    
  } else {
    // Premium: Thermopompe centrale
    primaryDevice = HEATING_DEVICES.find(d => d.id === 'heat-pump-central')!
    quantity = 1
    placement = [{ roomId: 'central', deviceCount: 1 }]
  }
  
  // Calculs de coûts
  const deviceCost = (primaryDevice.priceRange.min + primaryDevice.priceRange.max) / 2
  const installCost = (primaryDevice.installationCost.min + primaryDevice.installationCost.max) / 2
  
  const totalCost = deviceCost * quantity
  const installationCost = installCost * quantity
  const totalInvestment = totalCost + installationCost
  
  // Coûts d'opération annuels
  const annualOperatingCost = calculateOperatingCost(totalBTU, primaryDevice.efficiency, primaryDevice.energySource)
  const annualSavingsVsCurrent = currentAnnualCost - annualOperatingCost
  const paybackPeriod = annualSavingsVsCurrent > 0 ? totalInvestment / annualSavingsVsCurrent : 999
  
  // Réduction CO2
  const co2ReductionKg = calculateCO2Reduction(totalBTU, 'electricity', primaryDevice.energySource, primaryDevice.efficiency)
  
  // Recommandations personnalisées
  const recommendations: string[] = []
  const warnings: string[] = []
  
  if (budget === 'economique') {
    recommendations.push('Considérez ajouter une thermopompe dans les pièces principales pour réduire les coûts')
    recommendations.push('Installez des thermostats programmables pour économiser jusqu\'à 10%')
  }
  
  if (budget === 'standard') {
    recommendations.push('Installez les mini-splits dans les pièces les plus utilisées')
    recommendations.push('Gardez les plinthes existantes comme chauffage d\'appoint')
  }
  
  if (budget === 'premium') {
    recommendations.push('Assurez-vous d\'avoir un système de conduits en bon état')
    recommendations.push('Ajoutez un chauffage d\'appoint pour les journées très froides (-25°C et moins)')
  }
  
  if (houseData.houseAge > 30) {
    warnings.push('Votre maison est ancienne. Améliorez l\'isolation avant d\'installer un nouveau système')
  }
  
  if (totalBTU / totalArea > 55) {
    warnings.push('Vos besoins en chauffage sont élevés. Vérifiez l\'isolation et l\'étanchéité')
  }
  
  return {
    budget,
    primarySystem: {
      device: primaryDevice,
      quantity,
      totalBTU,
      totalCost,
      installationCost,
      annualOperatingCost,
      coverage: roomResults.map(r => r.roomName),
      placement
    },
    totalInvestment,
    annualOperatingCost,
    annualSavingsVsCurrent,
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    co2ReductionKg: Math.round(co2ReductionKg),
    recommendations,
    warnings
  }
}

/**
 * Calcule les coûts d'opération annuels
 */
function calculateOperatingCost(
  totalBTU: number,
  efficiency: number,
  energySource: string
): number {
  const energyCost = ENERGY_COSTS_QC[energySource as keyof typeof ENERGY_COSTS_QC]
  if (!energyCost) return 0
  
  // Heures de chauffage annuelles au Québec (environ 5000 heures)
  const heatingHours = 5000
  
  // BTU total par saison
  const seasonalBTU = totalBTU * heatingHours
  
  // Convertir en unités d'énergie
  const energyUnits = seasonalBTU / (energyCost.btuPerUnit * efficiency)
  
  // Coût total
  return Math.round(energyUnits * energyCost.rate)
}

/**
 * Calcule la réduction de CO2
 */
function calculateCO2Reduction(
  totalBTU: number,
  currentSource: string,
  newSource: string,
  efficiency: number
): number {
  const currentEnergy = ENERGY_COSTS_QC[currentSource as keyof typeof ENERGY_COSTS_QC]
  const newEnergy = ENERGY_COSTS_QC[newSource as keyof typeof ENERGY_COSTS_QC]
  
  if (!currentEnergy || !newEnergy) return 0
  
  const heatingHours = 5000
  const seasonalBTU = totalBTU * heatingHours
  
  // CO2 actuel
  const currentUnits = seasonalBTU / currentEnergy.btuPerUnit
  const currentCO2 = currentUnits * currentEnergy.co2PerUnit
  
  // CO2 nouveau système
  const newUnits = seasonalBTU / (newEnergy.btuPerUnit * efficiency)
  const newCO2 = newUnits * newEnergy.co2PerUnit
  
  return currentCO2 - newCO2
}

// ============================================================================
// FONCTIONS DE FORMATAGE
// ============================================================================

export function formatBTU(btu: number): string {
  return new Intl.NumberFormat('fr-CA').format(Math.round(btu))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatArea(area: number): string {
  return `${Math.round(area)} pi²`
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}
