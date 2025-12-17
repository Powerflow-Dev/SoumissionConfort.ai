# 🌬️ Landing Page Thermopompes - Documentation Technique

## 📋 Vue d'Ensemble

Landing page intelligente pour la génération de leads thermopompes avec un funnel en 6 étapes optimisé pour la conversion.

**URL**: `https://soumissionconfort.com/thermopompes`

---

## 🎯 Architecture du Funnel

### Flow Complet (6 Étapes)

```
Step 1: Adresse
    ↓
Step 2: Raffinement Géométrique
    ↓
Step 3: Validation Surface
    ↓
Step 4: Profil Thermique
    ↓
Step 5: Lead Capture (Gate)
    ↓
Step 6: Résultats & Économies
```

---

## 📐 Step 1: Détection & Hook (Auto)

### Objectif
Capturer l'adresse et lancer l'analyse satellite automatiquement.

### Fonctionnement
1. Utilisateur entre son adresse
2. Appel API Google Solar (réutilise `/api/roof-analysis`)
3. Récupération de `roofArea` (surface du toit)
4. **Transition immédiate** vers Step 2 (pas d'affichage de chiffres)

### Code Clé
```typescript
const handleAddressSubmit = async () => {
  const response = await fetch('/api/roof-analysis', {
    method: 'POST',
    body: JSON.stringify({ address })
  })
  
  const data = await response.json()
  setSolarArea(data.roofData?.roofArea || 2000)
  setCurrentStep(2) // Transition immédiate
}
```

### Analytics
```typescript
track('HeatPump_Address_Entered', { address })
track('HeatPump_Solar_Analysis_Complete', { roofArea })
```

---

## 🏠 Step 2: Raffinement Géométrique

### Objectif
Collecter les données nécessaires pour calculer la surface habitable précise.

### Questions Posées

#### A. Nombre d'Étages
- Options: 1, 1.5, 2, 3+
- Stocké dans: `geometric.floors`

#### B. Sous-sol Fini
- Options: Oui / Non
- Stocké dans: `geometric.hasFinishedBasement`

#### C. Garage Attaché
- Options: Aucun / Simple / Double
- Stocké dans: `geometric.garageType`

### Calcul de Surface Estimée

```typescript
const adjustedRoof = solarArea * 0.85
const garageArea = {
  'none': 0,
  'single': 250,
  'double': 450
}[garageType]

const baseArea = adjustedRoof - garageArea
const mainFloors = baseArea * floors
const basement = hasFinishedBasement ? baseArea * 0.75 : 0
const totalArea = mainFloors + basement
```

### Formule Complète
```
Surface_Estimée = ((Solar_Area × 0.85) - Garage) × Étages + (Sous_sol × 0.75)
```

### Analytics
```typescript
track('HeatPump_Geometric_Complete', { floors, basement, garage })
```

---

## ✅ Step 3: Validation de la Surface

### Objectif
Permettre à l'utilisateur de valider ou corriger l'estimation.

### Affichage
```
L'IA estime votre surface habitable à X pi²
```

### Options
1. **Bouton "Oui, c'est correct"**
   - Utilise `estimatedArea` comme `finalArea`
   - Passe à Step 4

2. **Bouton "Non, je veux corriger"**
   - Affiche champ de correction
   - Utilisateur entre la surface réelle
   - Utilise `userCorrectedArea` comme `finalArea`

### Code Clé
```typescript
const handleSurfaceValidation = (isCorrect: boolean) => {
  if (isCorrect) {
    setFinalArea(estimatedArea)
    setCurrentStep(4)
  }
}

const handleSurfaceCorrection = () => {
  const corrected = parseInt(userCorrectedArea)
  setFinalArea(corrected)
  setCurrentStep(4)
}
```

### Analytics
```typescript
track('HeatPump_Surface_Validated', { 
  area: finalArea, 
  corrected: boolean 
})
```

---

## 🌡️ Step 4: Profil Thermique (CRITIQUE)

### Objectif
Déterminer le profil thermique pour calculer les BTU avec précision.

### Questions Posées

#### A. Année de Construction
- Input numérique
- Range: 1900 - Année actuelle
- Stocké dans: `thermal.constructionYear`

#### B. Isolation Refaite/Améliorée? (QUESTION CRITIQUE)
**Cette question est la clé de l'algorithme d'année effective**

- Options:
  - **Oui**: Isolation améliorée significativement
  - **Non**: Isolation d'origine

- Stocké dans: `thermal.insulationUpgraded`

**Impact sur le Calcul:**
```typescript
// Si insulationUpgraded === true
effectiveYear = 2010  // Forcé à 2010 (standard moderne)

// Si insulationUpgraded === false
effectiveYear = constructionYear  // Utilise l'année réelle
```

#### C. Type de Chauffage Actuel
- Options:
  - Plinthes électriques → `'electric'`
  - Air pulsé → `'forced-air'`
  - Huile/Gaz → `'oil-gas'`

- Stocké dans: `thermal.currentHeatingType`

**Impact sur les Économies:**
```typescript
const savingsPercentage = {
  'electric': 0.35,      // 35% d'économies
  'forced-air': 0.35,    // 35% d'économies
  'oil-gas': 0.50        // 50% d'économies (huile/gaz plus cher)
}
```

### Analytics
```typescript
track('HeatPump_Thermal_Complete', { 
  year: constructionYear,
  upgraded: insulationUpgraded,
  heating: currentHeatingType
})
```

---

## 🔐 Step 5: Lead Capture (Gate)

### Objectif
Capturer les informations de contact avant d'afficher les résultats.

### Affichage
```
Analyse terminée !
Où souhaitez-vous recevoir votre rapport d'économies ?
```

### Formulaire (via LeadCapturePopup)
- Nom
- Email
- Téléphone

### Actions
1. Soumission du formulaire
2. Envoi au CRM via `/api/leads`
3. Calcul de la recommandation
4. Transition vers Step 6

### Code Clé
```typescript
const handleLeadSubmit = async (data: LeadData) => {
  // 1. Stocker les données
  setLeadData(data)
  
  // 2. Calculer la recommandation
  await calculateRecommendation()
  
  // 3. Envoyer au CRM
  await fetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      leadType: 'heatpump',
      address,
      geometric,
      thermal,
      finalArea
    })
  })
  
  // 4. Afficher les résultats
  setCurrentStep(6)
}
```

### Analytics
```typescript
track('HeatPump_Lead_Captured', { email })
```

---

## 📊 Step 6: Résultats & Économies

### Objectif
Afficher les résultats personnalisés et inciter à l'action.

### Calculs Effectués

#### A. Calcul BTU avec Année Effective

**Algorithme d'Année Effective:**
```typescript
function getEffectiveYear(constructionYear, insulationUpgraded) {
  if (insulationUpgraded) {
    return 2010  // Forcer à 2010 = maison moderne
  }
  return constructionYear  // Utiliser année réelle
}
```

**Facteurs BTU par Période:**
```typescript
const BTU_FACTORS = {
  'pre-1980': 45,        // Passoire thermique
  '1980-2005': 30,       // Standard moyen
  '2006-2015': 25,       // Bonne isolation (ou Rénové)
  '2016-plus': 20        // Novoclimat/Récent
}
```

**Calcul:**
```typescript
effectiveYear = getEffectiveYear(constructionYear, insulationUpgraded)
btuPerSqFt = getBTUFactor(effectiveYear)
totalBTU = finalArea × btuPerSqFt
tonnage = Math.ceil((totalBTU / 12000) × 2) / 2  // Arrondi au 0.5 supérieur
```

**Exemple:**
```
Maison de 1985, isolation refaite
- constructionYear = 1985
- insulationUpgraded = true
- effectiveYear = 2010 (forcé)
- btuPerSqFt = 25 (2006-2015)
- surface = 1500 pi²
- totalBTU = 1500 × 25 = 37,500 BTU
- tonnage = 3.5 tonnes
```

#### B. Calcul des Économies

**Formule:**
```typescript
estimatedCurrentCost = finalArea × 0.90  // 0.90$ par pi²

savingsPercentage = {
  'electric': 0.35,
  'forced-air': 0.35,
  'oil-gas': 0.50
}[currentHeatingType]

annualSavings = estimatedCurrentCost × savingsPercentage
```

**Exemple:**
```
Surface: 1500 pi²
Chauffage actuel: Plinthes électriques

estimatedCurrentCost = 1500 × 0.90 = 1,350$
savingsPercentage = 0.35 (35%)
annualSavings = 1,350 × 0.35 = 472.50$

Économies 15 ans = 472.50 × 15 = 7,087.50$
```

#### C. Recommandation de Modèle

**Logique:**
```typescript
if (tonnage <= 2) {
  model = "Thermopompe murale (Mini-Split)"
} else if (tonnage <= 3) {
  model = "Thermopompe centrale 2-3 tonnes"
} else if (tonnage <= 4) {
  model = "Thermopompe centrale 3-4 tonnes"
} else {
  model = "Thermopompe centrale 4-5 tonnes + appoint"
}
```

#### D. Coûts d'Installation

**Table de Prix par Tonnage:**
```typescript
const HEATPUMP_COSTS = {
  1.5: { equipment: 3500, installation: 2500, total: 6000 },
  2.0: { equipment: 4500, installation: 3000, total: 7500 },
  2.5: { equipment: 5500, installation: 3500, total: 9000 },
  3.0: { equipment: 6500, installation: 4000, total: 10500 },
  3.5: { equipment: 7500, installation: 4500, total: 12000 },
  4.0: { equipment: 8500, installation: 5000, total: 13500 },
  5.0: { equipment: 10500, installation: 6000, total: 16500 }
}
```

#### E. Période de Retour

**Formule:**
```typescript
paybackPeriod = totalInvestment / annualSavings
```

**Exemple:**
```
Investissement: 12,000$
Économies annuelles: 472.50$
Période de retour: 12,000 / 472.50 = 25.4 ans
```

### Affichage des Résultats

**Carte Hero (Gradient Bleu):**
- Économies annuelles
- Économies 15 ans
- Période de retour

**Carte Technique:**
- Modèle recommandé
- Puissance (tonnes + BTU)
- Surface habitable
- Profil thermique
- Investissement détaillé

**CTA Final:**
```
Prêt à économiser X$ par an ?
[Obtenir mes soumissions gratuites]
```

### Analytics
```typescript
track('HeatPump_Recommendation_Generated', {
  btu: totalBTU,
  tonnage: recommendedTonnage,
  savings: annualSavings
})
```

---

## 🔧 Fichiers Créés

### 1. `/lib/heatpump-calculator.ts`
Bibliothèque de calcul complète avec:
- Types TypeScript
- Constantes (BTU, coûts, etc.)
- `calculateHabitableSurface()` - Calcul surface
- `calculateBTUNeeds()` - Calcul BTU avec année effective
- `calculateSavings()` - Calcul économies
- `generateHeatPumpRecommendation()` - Recommandation complète
- Fonctions de formatage

### 2. `/app/api/heatpump-calculation/route.ts`
API endpoint pour le calcul:
- Validation des données
- Appel au calculateur
- Gestion des corrections utilisateur
- Retour JSON

### 3. `/app/thermopompes/page.tsx`
Page principale avec:
- Gestion des 6 steps
- Intégration Google Solar API
- Formulaires interactifs
- Affichage des résultats
- Lead capture
- Analytics

---

## 📊 Analytics Events

### Événements Trackés

```typescript
// Step 1
'HeatPump_Address_Entered'
'HeatPump_Solar_Analysis_Complete'

// Step 2
'HeatPump_Geometric_Complete'

// Step 3
'HeatPump_Surface_Validated'
'HeatPump_Surface_Correction_Started'

// Step 4
'HeatPump_Thermal_Complete'

// Step 5
'HeatPump_Lead_Captured'

// Step 6
'HeatPump_Recommendation_Generated'
```

### Données Collectées

Chaque événement inclut les données pertinentes:
- Adresse
- Surface (estimée, finale)
- Données géométriques
- Données thermiques
- BTU calculés
- Économies estimées

---

## 🧪 Tests Recommandés

### Test 1: Maison Ancienne Sans Rénovation
```
Année: 1975
Isolation refaite: Non
Surface: 1500 pi²

Résultat attendu:
- effectiveYear = 1975
- btuPerSqFt = 45
- totalBTU = 67,500
- tonnage = 5.5 tonnes
```

### Test 2: Maison Ancienne Avec Rénovation
```
Année: 1975
Isolation refaite: Oui  ← CRITIQUE
Surface: 1500 pi²

Résultat attendu:
- effectiveYear = 2010 (forcé)
- btuPerSqFt = 25
- totalBTU = 37,500
- tonnage = 3.5 tonnes
```

### Test 3: Maison Récente
```
Année: 2018
Isolation refaite: Non
Surface: 1500 pi²

Résultat attendu:
- effectiveYear = 2018
- btuPerSqFt = 20
- totalBTU = 30,000
- tonnage = 2.5 tonnes
```

### Test 4: Économies Huile vs Électrique
```
Surface: 1500 pi²
Coût estimé: 1,350$

Chauffage électrique:
- Économies: 35% = 472.50$/an

Chauffage huile:
- Économies: 50% = 675$/an
```

---

## 🚀 Déploiement

### Checklist Pré-Déploiement

- [ ] Tests unitaires du calculateur
- [ ] Tests d'intégration de l'API
- [ ] Tests du funnel complet (6 steps)
- [ ] Validation des calculs BTU
- [ ] Validation des calculs d'économies
- [ ] Test de l'intégration Google Solar
- [ ] Test de la capture de leads
- [ ] Test des analytics
- [ ] Responsive mobile vérifié
- [ ] Performance (Lighthouse >90)
- [ ] SEO (meta tags, schema.org)

### Variables d'Environnement

Aucune nouvelle variable requise. Utilise:
- `GOOGLE_SOLAR_API_KEY` (existant)
- Variables CRM (existantes)

### Commandes

```bash
# Build local
npm run build

# Test
npm run dev
# Naviguer vers http://localhost:3000/thermopompes

# Déployer
vercel --prod
```

---

## 📈 Optimisations Futures

### Phase 2
- [ ] A/B testing des CTAs
- [ ] Optimisation du taux de conversion par step
- [ ] Ajout de témoignages clients
- [ ] Intégration calculateur de subventions
- [ ] Export PDF du rapport

### Phase 3
- [ ] Visualisation 3D de la maison
- [ ] Comparaison multi-scénarios
- [ ] Calculateur de ROI avancé
- [ ] Intégration programmes gouvernementaux
- [ ] Mode "Comparer avec isolation"

---

## 🔑 Points Clés à Retenir

### 1. Année Effective (CRITIQUE)
```typescript
// Cette logique est TRANSPARENTE pour l'utilisateur
// mais ESSENTIELLE pour le calcul

if (insulationUpgraded === true) {
  effectiveYear = 2010  // Considérer comme moderne
} else {
  effectiveYear = constructionYear  // Utiliser année réelle
}
```

### 2. Facteurs BTU
```
< 1980:      45 BTU/pi² (Passoire)
1980-2005:   30 BTU/pi² (Standard)
2006-2015:   25 BTU/pi² (Bon) ← Rénové aussi
2016+:       20 BTU/pi² (Excellent)
```

### 3. Économies
```
Électrique/Air pulsé: 35%
Huile/Gaz:           50%
```

### 4. Surface Habitable
```
((Solar × 0.85) - Garage) × Étages + (Sous-sol × 0.75)
```

---

## 📞 Support

**Questions techniques**: Référer à ce document
**Modifications du calculateur**: Éditer `/lib/heatpump-calculator.ts`
**Modifications du funnel**: Éditer `/app/thermopompes/page.tsx`
**Modifications de l'API**: Éditer `/app/api/heatpump-calculation/route.ts`

---

**Créé le**: 10 décembre 2024  
**Version**: 1.0  
**Statut**: Prêt pour déploiement
