# Proposition: Calculateur d'Efficacité de Chauffage
## Route proposée: `/efficacite-de-chauffage`

---

## 📋 Résumé Exécutif

Ce document propose la création d'un nouvel outil de calcul d'efficacité de chauffage qui s'intègre parfaitement dans l'architecture existante de SoumissionConfort.ai. L'outil permettra aux utilisateurs de:

1. **Calculer la superficie totale** de leur maison (incluant tous les étages)
2. **Déterminer le nombre d'appareils de chauffage** nécessaires
3. **Calculer la puissance requise** (en BTU ou kW) pour chaque pièce et l'ensemble de la maison
4. **Obtenir des recommandations** sur les types d'appareils (thermopompes, plinthes, etc.)
5. **Estimer les coûts** d'installation et d'opération

---

## 🏗️ Architecture Technique Actuelle

### Stack Technologique Identifié
- **Framework**: Next.js 15.2.4 (App Router)
- **UI**: React 19 + Radix UI + Tailwind CSS
- **Formulaires**: React Hook Form + Zod
- **Analytics**: Vercel Analytics + Meta Pixel
- **APIs**: Google Solar API, Google Geocoding API
- **Déploiement**: Vercel

### Patterns Architecturaux Existants

#### 1. **Structure de Routing**
```
/app
  /analysis/page.tsx          → Analyse d'isolation (actuel)
  /pricing/page.tsx            → Page de résultats de prix
  /api/roof-analysis/route.ts  → API d'analyse
  /api/pricing/route.ts        → API de calcul de prix
  /api/leads/route.ts          → Gestion des leads
```

#### 2. **Flow Utilisateur Standard**
```
Accueil → Saisie Adresse → Analyse → Questionnaire → Capture Lead → Résultats Prix → Success
```

#### 3. **Composants Réutilisables**
- `user-questionnaire-wizard.tsx` - Questionnaire multi-étapes
- `lead-capture-popup.tsx` - Capture des informations client
- `insulation-calculator.ts` - Logique de calcul métier
- `insulation-results.tsx` - Affichage des résultats

---

## 🎯 Proposition: Calculateur d'Efficacité de Chauffage

### Route et URL
```
https://soumissionconfort.com/efficacite-de-chauffage
```

### Objectifs de l'Outil

1. **Calcul de superficie**: Permettre aux utilisateurs de calculer la superficie totale chauffée
2. **Analyse thermique**: Déterminer les besoins en chauffage par pièce et par zone
3. **Recommandations d'appareils**: Suggérer le nombre et le type d'appareils
4. **Calcul de puissance**: Calculer les BTU/kW nécessaires
5. **Estimation de coûts**: Fournir des estimations d'installation et d'économies

---

## 📐 Méthodologie de Calcul

### 1. Calcul de Superficie

#### Données à Collecter
```typescript
interface RoomData {
  name: string                    // Ex: "Salon", "Chambre 1"
  length: number                  // Longueur en pieds
  width: number                   // Largeur en pieds
  height: number                  // Hauteur de plafond (défaut: 8 pieds)
  floor: number                   // Étage (0=sous-sol, 1=RDC, 2=étage)
  hasWindows: boolean
  windowCount: number
  windowSize: 'small' | 'medium' | 'large'
  exposureDirection: 'north' | 'south' | 'east' | 'west'
  insulationQuality: 'poor' | 'average' | 'good' | 'excellent'
}

interface HouseData {
  rooms: RoomData[]
  totalFloors: number
  basementType: 'none' | 'unfinished' | 'finished'
  atticType: 'none' | 'unfinished' | 'finished'
  houseAge: number
  constructionType: 'wood' | 'brick' | 'concrete'
  climateZone: string              // Basé sur l'adresse
}
```

### 2. Calcul des Besoins en Chauffage (BTU)

#### Formule de Base (Méthode Québécoise)
```typescript
// BTU par pied carré selon la zone climatique du Québec
const BTU_PER_SQ_FT_BASE = {
  'zone-1': 45,  // Montréal, Laval, Rive-Sud
  'zone-2': 50,  // Québec, Trois-Rivières
  'zone-3': 55,  // Saguenay, Abitibi
  'zone-4': 60,  // Côte-Nord, Nord-du-Québec
}

// Facteurs de correction
const CORRECTION_FACTORS = {
  // Isolation
  insulation: {
    poor: 1.30,
    average: 1.10,
    good: 1.00,
    excellent: 0.85
  },
  
  // Hauteur de plafond
  ceilingHeight: {
    8: 1.00,
    9: 1.10,
    10: 1.20,
    12: 1.40
  },
  
  // Exposition
  exposure: {
    north: 1.15,    // Plus froid
    east: 1.05,
    west: 1.05,
    south: 0.95     // Plus chaud (soleil)
  },
  
  // Fenêtres
  windows: {
    none: 0.95,
    small: 1.00,
    medium: 1.10,
    large: 1.20
  },
  
  // Étage
  floor: {
    basement: 0.80,      // Sous-sol (plus chaud)
    ground: 1.00,        // Rez-de-chaussée
    upper: 1.10,         // Étage (plus de perte de chaleur)
    attic: 1.25          // Grenier aménagé
  },
  
  // Âge de la maison
  age: {
    new: 0.90,           // < 10 ans
    recent: 1.00,        // 10-30 ans
    old: 1.15,           // 30-50 ans
    veryOld: 1.30        // > 50 ans
  }
}

// Calcul pour une pièce
function calculateRoomBTU(room: RoomData, climateZone: string, houseAge: number): number {
  const area = room.length * room.width
  const baseBTU = BTU_PER_SQ_FT_BASE[climateZone] || 50
  
  // Appliquer tous les facteurs
  let totalBTU = area * baseBTU
  totalBTU *= CORRECTION_FACTORS.insulation[room.insulationQuality]
  totalBTU *= CORRECTION_FACTORS.ceilingHeight[room.height] || 1.0
  totalBTU *= CORRECTION_FACTORS.exposure[room.exposureDirection]
  
  // Fenêtres
  if (room.hasWindows) {
    totalBTU *= CORRECTION_FACTORS.windows[room.windowSize]
    totalBTU += (room.windowCount * 1000) // 1000 BTU par fenêtre additionnelle
  }
  
  // Étage
  const floorType = room.floor === 0 ? 'basement' : 
                    room.floor === 1 ? 'ground' : 'upper'
  totalBTU *= CORRECTION_FACTORS.floor[floorType]
  
  // Âge de la maison
  const ageCategory = houseAge < 10 ? 'new' :
                      houseAge < 30 ? 'recent' :
                      houseAge < 50 ? 'old' : 'veryOld'
  totalBTU *= CORRECTION_FACTORS.age[ageCategory]
  
  return Math.round(totalBTU)
}
```

### 3. Recommandations d'Appareils

#### Types d'Appareils de Chauffage
```typescript
interface HeatingDevice {
  type: string
  name: string
  btuRange: { min: number; max: number }
  efficiency: number              // COP ou HSPF
  priceRange: { min: number; max: number }
  installationCost: { min: number; max: number }
  operatingCostPerYear: number
  lifespan: number
  pros: string[]
  cons: string[]
  idealFor: string[]
}

const HEATING_DEVICES: HeatingDevice[] = [
  {
    type: 'heat-pump-mini-split',
    name: 'Thermopompe murale (mini-split)',
    btuRange: { min: 9000, max: 36000 },
    efficiency: 3.5,  // COP moyen
    priceRange: { min: 1500, max: 4500 },
    installationCost: { min: 800, max: 2000 },
    operatingCostPerYear: 400,
    lifespan: 15,
    pros: [
      'Très efficace (chauffage et climatisation)',
      'Économies d\'énergie importantes',
      'Contrôle de température précis',
      'Silencieux'
    ],
    cons: [
      'Coût initial élevé',
      'Nécessite entretien régulier',
      'Performance réduite par grand froid'
    ],
    idealFor: ['Pièces individuelles', 'Maisons bien isolées', 'Zones spécifiques']
  },
  {
    type: 'heat-pump-central',
    name: 'Thermopompe centrale',
    btuRange: { min: 24000, max: 60000 },
    efficiency: 3.2,
    priceRange: { min: 5000, max: 12000 },
    installationCost: { min: 3000, max: 6000 },
    operatingCostPerYear: 1200,
    lifespan: 15,
    pros: [
      'Chauffe toute la maison',
      'Très efficace',
      'Climatisation incluse',
      'Augmente valeur de la propriété'
    ],
    cons: [
      'Investissement initial important',
      'Nécessite système de distribution d\'air',
      'Installation complexe'
    ],
    idealFor: ['Maisons entières', 'Nouvelles constructions', 'Rénovations majeures']
  },
  {
    type: 'electric-baseboard',
    name: 'Plinthe électrique',
    btuRange: { min: 500, max: 2000 },
    efficiency: 1.0,  // 100% mais coûteux
    priceRange: { min: 50, max: 300 },
    installationCost: { min: 150, max: 400 },
    operatingCostPerYear: 800,
    lifespan: 20,
    pros: [
      'Coût initial très bas',
      'Installation simple',
      'Fiable et durable',
      'Pas d\'entretien'
    ],
    cons: [
      'Coûts d\'opération élevés',
      'Moins efficace',
      'Prend de l\'espace au sol',
      'Chauffe lentement'
    ],
    idealFor: ['Budget limité', 'Chauffage d\'appoint', 'Petites pièces']
  },
  {
    type: 'radiant-floor',
    name: 'Plancher radiant électrique',
    btuRange: { min: 10, max: 15 },  // Par pied carré
    efficiency: 1.0,
    priceRange: { min: 10, max: 20 },  // Par pied carré
    installationCost: { min: 15, max: 30 },  // Par pied carré
    operatingCostPerYear: 600,
    lifespan: 30,
    pros: [
      'Confort optimal',
      'Distribution uniforme de chaleur',
      'Invisible',
      'Silencieux'
    ],
    cons: [
      'Installation coûteuse',
      'Nécessite rénovation du plancher',
      'Temps de chauffe lent',
      'Difficile à réparer'
    ],
    idealFor: ['Salles de bain', 'Cuisines', 'Nouvelles constructions']
  },
  {
    type: 'gas-furnace',
    name: 'Fournaise au gaz naturel',
    btuRange: { min: 40000, max: 120000 },
    efficiency: 0.95,  // AFUE
    priceRange: { min: 2500, max: 6000 },
    installationCost: { min: 2000, max: 4000 },
    operatingCostPerYear: 900,
    lifespan: 20,
    pros: [
      'Coûts d\'opération modérés',
      'Chauffe rapidement',
      'Fiable par grand froid',
      'Longue durée de vie'
    ],
    cons: [
      'Nécessite gaz naturel',
      'Entretien annuel requis',
      'Émissions de CO2',
      'Nécessite système de ventilation'
    ],
    idealFor: ['Maisons avec accès au gaz', 'Climats très froids', 'Grandes maisons']
  },
  {
    type: 'wood-pellet-stove',
    name: 'Poêle aux granules',
    btuRange: { min: 8000, max: 50000 },
    efficiency: 0.85,
    priceRange: { min: 2000, max: 5000 },
    installationCost: { min: 1500, max: 3000 },
    operatingCostPerYear: 700,
    lifespan: 15,
    pros: [
      'Combustible renouvelable',
      'Coûts d\'opération bas',
      'Ambiance chaleureuse',
      'Autonome en cas de panne'
    ],
    cons: [
      'Nécessite espace de stockage',
      'Entretien régulier',
      'Chargement manuel',
      'Nécessite cheminée'
    ],
    idealFor: ['Zones rurales', 'Chauffage principal ou d\'appoint', 'Écologistes']
  }
]
```

### 4. Algorithme de Recommandation

```typescript
interface HeatingRecommendation {
  primarySystem: {
    device: HeatingDevice
    quantity: number
    totalBTU: number
    totalCost: number
    installationCost: number
    annualOperatingCost: number
    coverage: string[]  // Liste des pièces couvertes
  }
  supplementarySystem?: {
    device: HeatingDevice
    quantity: number
    totalBTU: number
    totalCost: number
    coverage: string[]
  }
  totalInvestment: number
  annualSavingsVsCurrent: number
  paybackPeriod: number
  recommendations: string[]
}

function recommendHeatingSystem(
  houseData: HouseData,
  totalBTUNeeded: number,
  budget: 'economique' | 'standard' | 'premium',
  currentSystem?: string
): HeatingRecommendation {
  
  // Logique de recommandation basée sur:
  // 1. BTU total nécessaire
  // 2. Budget
  // 3. Configuration de la maison
  // 4. Préférences écologiques
  // 5. Système actuel
  
  // Exemple: Pour une maison de 1500 pi² nécessitant 75,000 BTU
  if (totalBTUNeeded < 30000) {
    // Petite maison ou appartement
    // Recommander: 1-2 thermopompes murales
  } else if (totalBTUNeeded < 80000) {
    // Maison moyenne
    // Recommander: Thermopompe centrale ou 3-4 mini-splits
  } else {
    // Grande maison
    // Recommander: Système hybride (thermopompe + appoint)
  }
  
  // Retourner recommandation complète
}
```

---

## 🎨 Interface Utilisateur Proposée

### Flow Utilisateur

```
1. Page d'accueil (/efficacite-de-chauffage)
   ↓
2. Saisie de l'adresse (pour zone climatique)
   ↓
3. Questionnaire - Informations sur la maison
   - Type de maison (plain-pied, 2 étages, etc.)
   - Année de construction
   - Type de construction
   - Qualité d'isolation
   ↓
4. Saisie des pièces (interface interactive)
   - Ajouter chaque pièce avec dimensions
   - Fenêtres et exposition
   - Étage
   ↓
5. Système actuel (optionnel)
   - Type de chauffage actuel
   - Coûts annuels actuels
   ↓
6. Capture des informations de contact
   ↓
7. Résultats détaillés
   - Superficie totale
   - BTU nécessaires par pièce et total
   - Recommandations d'appareils (3 options)
   - Estimations de coûts
   - Économies potentielles
   - Plan de disposition suggéré
```

### Composants UI à Créer

```typescript
// 1. Formulaire de saisie de pièces
<RoomInputForm />
  - Champs: nom, longueur, largeur, hauteur
  - Sélection d'étage
  - Configuration des fenêtres
  - Bouton "Ajouter une autre pièce"

// 2. Visualisation de la maison
<HouseVisualization rooms={rooms} />
  - Vue 2D/3D simple de la maison
  - Affichage des pièces avec dimensions
  - Indicateurs de BTU par pièce

// 3. Calculateur en temps réel
<BTUCalculator rooms={rooms} />
  - Affichage du total BTU
  - Graphique par étage
  - Graphique par pièce

// 4. Comparateur d'appareils
<HeatingDeviceComparator recommendations={recommendations} />
  - 3 options côte à côte
  - Économique / Standard / Premium
  - Détails des appareils
  - Coûts et économies

// 5. Plan de disposition
<HeatingLayout rooms={rooms} devices={devices} />
  - Suggestion de placement des appareils
  - Carte interactive
```

---

## 💻 Structure de Code Proposée

### Nouvelle Structure de Fichiers

```
/app
  /efficacite-de-chauffage
    /page.tsx                          → Page principale
    /layout.tsx                        → Layout spécifique (optionnel)
  
  /api
    /heating-calculation
      /route.ts                        → API de calcul BTU
    /heating-recommendations
      /route.ts                        → API de recommandations d'appareils

/lib
  /heating-calculator.ts               → Logique de calcul BTU
  /heating-devices.ts                  → Base de données d'appareils
  /climate-zones.ts                    → Zones climatiques du Québec

/components
  /heating
    /room-input-form.tsx               → Formulaire de saisie de pièces
    /house-visualization.tsx           → Visualisation de la maison
    /btu-calculator.tsx                → Calculateur en temps réel
    /heating-device-comparator.tsx     → Comparateur d'appareils
    /heating-layout.tsx                → Plan de disposition
    /heating-results.tsx               → Page de résultats
    /heating-questionnaire.tsx         → Questionnaire initial
```

### Exemple de Code: heating-calculator.ts

```typescript
// /lib/heating-calculator.ts

export interface RoomData {
  id: string
  name: string
  length: number
  width: number
  height: number
  floor: number
  hasWindows: boolean
  windowCount: number
  windowSize: 'small' | 'medium' | 'large'
  exposureDirection: 'north' | 'south' | 'east' | 'west'
  insulationQuality: 'poor' | 'average' | 'good' | 'excellent'
}

export interface HouseData {
  address: string
  climateZone: string
  rooms: RoomData[]
  totalFloors: number
  houseAge: number
  constructionType: 'wood' | 'brick' | 'concrete'
  currentHeatingSystem?: string
  currentAnnualCost?: number
}

export interface BTUCalculationResult {
  totalBTU: number
  roomResults: Array<{
    roomId: string
    roomName: string
    area: number
    btuRequired: number
    btuPerSqFt: number
  }>
  totalArea: number
  averageBTUPerSqFt: number
}

// Constantes de calcul
const BTU_BASE_BY_ZONE: Record<string, number> = {
  'montreal': 45,
  'quebec': 50,
  'saguenay': 55,
  'abitibi': 60,
  'default': 50
}

const CORRECTION_FACTORS = {
  insulation: {
    poor: 1.30,
    average: 1.10,
    good: 1.00,
    excellent: 0.85
  },
  ceilingHeight: (height: number) => height / 8,
  exposure: {
    north: 1.15,
    east: 1.05,
    west: 1.05,
    south: 0.95
  },
  windows: {
    small: 1.00,
    medium: 1.10,
    large: 1.20
  },
  floor: {
    basement: 0.80,
    ground: 1.00,
    upper: 1.10
  }
}

export function calculateRoomBTU(
  room: RoomData,
  climateZone: string,
  houseAge: number
): number {
  const area = room.length * room.width
  const baseBTU = BTU_BASE_BY_ZONE[climateZone] || BTU_BASE_BY_ZONE.default
  
  let totalBTU = area * baseBTU
  
  // Appliquer facteurs de correction
  totalBTU *= CORRECTION_FACTORS.insulation[room.insulationQuality]
  totalBTU *= CORRECTION_FACTORS.ceilingHeight(room.height)
  totalBTU *= CORRECTION_FACTORS.exposure[room.exposureDirection]
  
  if (room.hasWindows) {
    totalBTU *= CORRECTION_FACTORS.windows[room.windowSize]
    totalBTU += room.windowCount * 1000
  }
  
  const floorType = room.floor === 0 ? 'basement' : 
                    room.floor === 1 ? 'ground' : 'upper'
  totalBTU *= CORRECTION_FACTORS.floor[floorType]
  
  // Facteur d'âge
  if (houseAge > 50) totalBTU *= 1.30
  else if (houseAge > 30) totalBTU *= 1.15
  else if (houseAge > 10) totalBTU *= 1.00
  else totalBTU *= 0.90
  
  return Math.round(totalBTU)
}

export function calculateHouseBTU(houseData: HouseData): BTUCalculationResult {
  const roomResults = houseData.rooms.map(room => {
    const area = room.length * room.width
    const btuRequired = calculateRoomBTU(room, houseData.climateZone, houseData.houseAge)
    
    return {
      roomId: room.id,
      roomName: room.name,
      area,
      btuRequired,
      btuPerSqFt: Math.round(btuRequired / area)
    }
  })
  
  const totalBTU = roomResults.reduce((sum, r) => sum + r.btuRequired, 0)
  const totalArea = roomResults.reduce((sum, r) => sum + r.area, 0)
  
  return {
    totalBTU,
    roomResults,
    totalArea,
    averageBTUPerSqFt: Math.round(totalBTU / totalArea)
  }
}
```

---

## 🔗 Intégration avec l'Existant

### 1. Réutilisation des Composants

```typescript
// Réutiliser les composants existants:
import { LeadCapturePopup } from '@/components/lead-capture-popup'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Adapter le questionnaire wizard
import { UserQuestionnaire } from '@/components/user-questionnaire-wizard'
// Créer une version pour le chauffage: HeatingQuestionnaire
```

### 2. Partage de la Logique Lead

```typescript
// Utiliser le même système de capture de leads
// /api/leads/route.ts peut gérer les deux types de leads

interface HeatingLead extends LeadData {
  leadType: 'heating'  // vs 'insulation'
  houseData: HouseData
  btuCalculation: BTUCalculationResult
  recommendations: HeatingRecommendation
}
```

### 3. Analytics et Tracking

```typescript
// Réutiliser le même système d'analytics
import { track } from '@vercel/analytics'

track('Heating Calculator Started', { address })
track('Room Added', { roomCount: rooms.length })
track('BTU Calculation Completed', { totalBTU })
track('Heating Lead Captured', { leadId })
```

---

## 📊 Données et Constantes Québécoises

### Zones Climatiques du Québec

```typescript
// /lib/climate-zones.ts

export const QUEBEC_CLIMATE_ZONES = {
  'montreal': {
    name: 'Montréal et Région',
    btuPerSqFt: 45,
    heatingDegreeD days: 4300,
    cities: ['Montréal', 'Laval', 'Longueuil', 'Terrebonne', 'Brossard']
  },
  'quebec-city': {
    name: 'Québec et Région',
    btuPerSqFt: 50,
    heatingDegreeDays: 4900,
    cities: ['Québec', 'Lévis', 'Beauport']
  },
  'mauricie': {
    name: 'Mauricie',
    btuPerSqFt: 50,
    heatingDegreeDays: 5000,
    cities: ['Trois-Rivières', 'Shawinigan']
  },
  'estrie': {
    name: 'Estrie',
    btuPerSqFt: 48,
    heatingDegreeDays: 4600,
    cities: ['Sherbrooke', 'Magog']
  },
  'saguenay': {
    name: 'Saguenay-Lac-Saint-Jean',
    btuPerSqFt: 55,
    heatingDegreeDays: 5500,
    cities: ['Saguenay', 'Alma', 'Roberval']
  },
  'abitibi': {
    name: 'Abitibi-Témiscamingue',
    btuPerSqFt: 60,
    heatingDegreeDays: 6000,
    cities: ['Rouyn-Noranda', 'Val-d\'Or', 'Amos']
  },
  'cote-nord': {
    name: 'Côte-Nord',
    btuPerSqFt: 60,
    heatingDegreeDays: 6200,
    cities: ['Sept-Îles', 'Baie-Comeau']
  }
}

export function getClimateZoneFromCity(city: string): string {
  for (const [zone, data] of Object.entries(QUEBEC_CLIMATE_ZONES)) {
    if (data.cities.some(c => city.toLowerCase().includes(c.toLowerCase()))) {
      return zone
    }
  }
  return 'montreal' // Défaut
}
```

### Coûts d'Énergie au Québec (2024)

```typescript
export const ENERGY_COSTS_QC = {
  electricity: {
    rate: 0.0735,  // $/kWh (tarif D résidentiel Hydro-Québec)
    unit: 'kWh',
    btuPerUnit: 3412
  },
  naturalGas: {
    rate: 0.45,    // $/m³ (Énergir)
    unit: 'm³',
    btuPerUnit: 35300
  },
  propane: {
    rate: 0.65,    // $/litre
    unit: 'L',
    btuPerUnit: 25000
  },
  oil: {
    rate: 1.30,    // $/litre
    unit: 'L',
    btuPerUnit: 38000
  },
  wood: {
    rate: 250,     // $/corde
    unit: 'corde',
    btuPerUnit: 20000000
  },
  pellets: {
    rate: 300,     // $/tonne
    unit: 'tonne',
    btuPerUnit: 16500000
  }
}
```

---

## 🎯 Fonctionnalités Avancées (Phase 2)

### 1. Intégration Google Maps
- Afficher la maison sur une carte
- Détecter automatiquement l'orientation (exposition)
- Calculer la zone climatique précise

### 2. Visualisation 3D
- Modèle 3D simple de la maison
- Placement visuel des appareils
- Zones de chaleur colorées

### 3. Comparaison de Scénarios
- Comparer plusieurs configurations
- Système actuel vs recommandé
- Économies sur 5, 10, 20 ans

### 4. Intégration avec Programmes de Subventions
- Détecter l'éligibilité aux subventions
- Calculer les montants disponibles
- Liens vers les programmes (Rénoclimat, etc.)

### 5. Mode Expert
- Paramètres avancés
- Facteurs de correction personnalisés
- Export PDF détaillé

---

## 📈 Métriques de Succès

### KPIs à Suivre
1. **Taux de complétion** du calculateur
2. **Taux de conversion** (visiteur → lead)
3. **Temps moyen** passé sur l'outil
4. **Nombre de pièces** ajoutées en moyenne
5. **Taux de partage** des résultats
6. **Satisfaction utilisateur** (sondage post-calcul)

### Analytics Events
```typescript
// Events à tracker
track('Heating_Calculator_Started')
track('Address_Entered', { city, province })
track('House_Info_Completed', { floors, age, type })
track('Room_Added', { roomType, floor, area })
track('BTU_Calculated', { totalBTU, totalArea })
track('Recommendations_Viewed', { budget })
track('Lead_Captured', { leadId, totalBTU })
track('Results_Shared', { method })
```

---

## 🚀 Plan d'Implémentation

### Phase 1: MVP (2-3 semaines)
- [ ] Créer la structure de base (/efficacite-de-chauffage)
- [ ] Implémenter le calculateur BTU de base
- [ ] Créer le formulaire de saisie de pièces
- [ ] Intégrer la capture de leads
- [ ] Page de résultats simple
- [ ] Tests et validation

### Phase 2: Améliorations (1-2 semaines)
- [ ] Ajouter les recommandations d'appareils
- [ ] Créer le comparateur 3 options
- [ ] Améliorer l'UX du formulaire
- [ ] Ajouter la visualisation de la maison
- [ ] Intégrer les coûts et économies

### Phase 3: Fonctionnalités Avancées (2-3 semaines)
- [ ] Intégration Google Maps
- [ ] Visualisation 3D
- [ ] Comparaison de scénarios
- [ ] Programmes de subventions
- [ ] Export PDF
- [ ] Mode expert

### Phase 4: Optimisation (Continu)
- [ ] A/B testing
- [ ] Optimisation SEO
- [ ] Amélioration des conversions
- [ ] Feedback utilisateurs
- [ ] Ajout de nouvelles fonctionnalités

---

## 💰 Estimation des Coûts de Développement

### Temps de Développement Estimé
- **Phase 1 (MVP)**: 80-120 heures
- **Phase 2 (Améliorations)**: 40-60 heures
- **Phase 3 (Avancé)**: 80-100 heures
- **Phase 4 (Optimisation)**: Continu

### Coûts Additionnels
- **APIs**: Google Maps API (si nécessaire)
- **Hébergement**: Inclus dans Vercel actuel
- **Design**: Si design custom requis
- **Tests utilisateurs**: Budget pour incentives

---

## 🎨 Maquettes UI (Descriptions)

### Page d'Accueil
```
┌─────────────────────────────────────────────┐
│  🏠 Calculateur d'Efficacité de Chauffage   │
│                                             │
│  Déterminez vos besoins en chauffage       │
│  et obtenez des recommandations d'experts  │
│                                             │
│  [Entrez votre adresse]  [Commencer →]     │
│                                             │
│  ✓ Calcul de BTU précis                    │
│  ✓ Recommandations d'appareils             │
│  ✓ Estimation des coûts                    │
│  ✓ Économies potentielles                  │
└─────────────────────────────────────────────┘
```

### Formulaire de Pièces
```
┌─────────────────────────────────────────────┐
│  Ajoutez vos pièces                         │
│                                             │
│  Pièce 1: Salon                            │
│  ├─ Longueur: [15] pieds                   │
│  ├─ Largeur:  [20] pieds                   │
│  ├─ Hauteur:  [8] pieds                    │
│  ├─ Étage:    [○ Sous-sol ● RDC ○ Étage]  │
│  ├─ Fenêtres: [2] [Moyennes ▼]            │
│  └─ Exposition: [Sud ▼]                    │
│                                             │
│  [+ Ajouter une autre pièce]               │
│  [Calculer mes besoins →]                  │
│                                             │
│  Superficie totale: 300 pi²                │
│  BTU estimé: 13,500                        │
└─────────────────────────────────────────────┘
```

### Page de Résultats
```
┌─────────────────────────────────────────────┐
│  Vos Résultats                              │
│                                             │
│  🏠 Superficie totale: 1,500 pi²           │
│  🔥 BTU nécessaires: 75,000                │
│  📊 Moyenne: 50 BTU/pi²                    │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ Économique  │ Standard  │ Premium     │ │
│  ├─────────────┼───────────┼─────────────┤ │
│  │ 3 Plinthes  │ 2 Mini-   │ Thermo-     │ │
│  │ électriques │ splits    │ pompe       │ │
│  │             │           │ centrale    │ │
│  │ 2,500$      │ 8,000$    │ 15,000$     │ │
│  │ 1,200$/an   │ 600$/an   │ 400$/an     │ │
│  └─────────────┴───────────┴─────────────┘ │
│                                             │
│  [Obtenir des soumissions →]               │
└─────────────────────────────────────────────┘
```

---

## 📝 Conclusion

Ce calculateur d'efficacité de chauffage s'intègre parfaitement dans l'écosystème existant de SoumissionConfort.ai en:

1. **Réutilisant** l'architecture Next.js et les composants UI
2. **Suivant** les mêmes patterns de flow utilisateur
3. **Partageant** le système de capture de leads
4. **Utilisant** les mêmes APIs et services
5. **Maintenant** la cohérence de marque et d'expérience

L'outil apporte une **valeur ajoutée significative** en:
- Aidant les propriétaires à dimensionner correctement leur système de chauffage
- Fournissant des recommandations basées sur des calculs précis
- Générant des leads qualifiés pour les entrepreneurs partenaires
- Positionnant SoumissionConfort.ai comme expert en efficacité énergétique

**Prochaines étapes recommandées:**
1. Valider le concept avec des utilisateurs potentiels
2. Créer des maquettes détaillées
3. Développer le MVP (Phase 1)
4. Tester avec un groupe beta
5. Lancer publiquement
6. Itérer basé sur les retours

---

**Document créé le:** 9 décembre 2024  
**Version:** 1.0  
**Auteur:** Cascade AI  
**Pour:** SoumissionConfort.ai
