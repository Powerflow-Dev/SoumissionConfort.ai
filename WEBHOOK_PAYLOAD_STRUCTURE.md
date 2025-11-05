# 📦 Structure du Webhook Payload - Isolation d'Entretoit

## Vue d'ensemble
Ce document décrit la structure complète du payload envoyé au webhook lors de la soumission d'un lead pour l'isolation d'entretoit.

---

## 🔑 Métadonnées

```typescript
{
  timestamp: string,              // ISO 8601 timestamp (ex: "2024-11-04T19:55:00.000Z")
  leadId: string,                 // Format: "LEAD{timestamp}{random8chars}"
  webhookType: "initial_contact", // Type de webhook
  source: "soumission-toiture-ai" // Source de la lead
}
```

---

## 👤 Contact

```typescript
contact: {
  firstName: string,    // Prénom du client
  lastName: string,     // Nom de famille du client
  email: string,        // Adresse courriel
  phone: string         // Numéro de téléphone (format: "(514) 123-4567")
}
```

**Exemple:**
```json
{
  "firstName": "Jean",
  "lastName": "Tremblay",
  "email": "jean.tremblay@example.com",
  "phone": "(514) 555-1234"
}
```

---

## 🏠 Propriété

```typescript
property: {
  address: string,           // Adresse complète
  city: string,              // Ville
  postalCode: string,        // Code postal
  roofArea: number,          // Superficie du toit en pieds carrés
  buildingHeight: number,    // Hauteur du bâtiment en pieds
  pitchComplexity: string,   // "simple" | "moderate" | "complex"
  obstacles: string[],       // Liste des obstacles identifiés
  coordinates: {             // Coordonnées GPS (si disponible)
    lat: number,
    lng: number
  } | null
}
```

**Exemple:**
```json
{
  "address": "123 Rue Principale, Montréal, QC",
  "city": "Montréal",
  "postalCode": "H1A 1A1",
  "roofArea": 2400,
  "buildingHeight": 25,
  "pitchComplexity": "moderate",
  "obstacles": ["cheminée", "ventilation"],
  "coordinates": {
    "lat": 45.5017,
    "lng": -73.5673
  }
}
```

---

## 📋 Détails du Projet (Questions d'Isolation)

```typescript
projectDetails: {
  // ⚡ NOUVELLES QUESTIONS D'ISOLATION
  heatingSystem: string,        // "electricite" | "gaz" | "mazout" | "autre"
  currentInsulation: string,    // "aucune" | "partielle" | "complete" | "recente" | "inconnue"
  atticAccess: string,          // "facile" | "trappe" | "difficile" | "aucun" | "inconnue"
  identifiedProblems: string[], // ["moisissure", "courants-air", "factures-elevees", etc.]
  
  // Anciennes questions (pour compatibilité)
  roofConditions: string[],     // Fallback vers identifiedProblems
  roofAge: string,
  roofMaterial: string,
  propertyAccess: string,       // Fallback vers atticAccess
  serviceType: string[],
  timeline: string,
  contactPreference: string,
  contactTime: string
}
```

**Exemple:**
```json
{
  "heatingSystem": "electricite",
  "currentInsulation": "partielle",
  "atticAccess": "facile",
  "identifiedProblems": ["courants-air", "factures-elevees"],
  "roofConditions": ["courants-air", "factures-elevees"],
  "roofAge": "",
  "roofMaterial": "",
  "propertyAccess": "facile",
  "serviceType": [],
  "timeline": "",
  "contactPreference": "",
  "contactTime": ""
}
```

### Options des questions:

#### heatingSystem
- `"electricite"` - Électricité (plinthes, air pulsé, thermopompe)
- `"gaz"` - Gaz naturel
- `"mazout"` - Mazout
- `"autre"` - Autre/Combinaison

#### currentInsulation
- `"aucune"` - Aucune isolation ou très peu (R-5)
- `"partielle"` - Isolation partielle (R-15)
- `"complete"` - Isolation complète mais ancienne (R-30)
- `"recente"` - Isolation récente (R-45)
- `"inconnue"` - Je ne sais pas (R-20)

#### atticAccess
- `"facile"` - Accès facile depuis l'intérieur
- `"trappe"` - Trappe d'accès disponible
- `"difficile"` - Accès difficile ou limité
- `"aucun"` - Aucun accès direct
- `"inconnue"` - Je ne sais pas

#### identifiedProblems (array)
- `"moisissure"` - Moisissure ou humidité (+$1,750)
- `"courants-air"` - Courants d'air (+$1,000)
- `"factures-elevees"` - Factures d'énergie élevées (symptôme, pas de supplément)
- `"temperature-inegale"` - Température inégale entre les pièces (symptôme)
- `"glace"` - Formation de glace sur le toit (+$1,000)
- `"aucun"` - Aucun problème identifié

---

## 💰 Pricing (3 Fourchettes de Prix)

```typescript
pricing: {
  // Estimation principale (peut être null si calcul échoue)
  estimatedCost: object | null,
  
  // 🥉 GAMME ÉCONOMIQUE
  ranges: {
    economique: {
      name: "Économique",
      type: "Fibre de verre soufflée",
      rValue: 50,
      min: number,              // Prix minimum en $CAD
      max: number,              // Prix maximum en $CAD
      annualSavings: {
        min: number,            // Économies annuelles min en $CAD
        max: number             // Économies annuelles max en $CAD
      },
      paybackPeriod: {
        min: number,            // Période de retour min en années
        max: number             // Période de retour max en années
      }
    },
    
    // 🥈 GAMME STANDARD (Recommandée)
    standard: {
      name: "Standard",
      type: "Cellulose soufflée",
      rValue: 55,
      recommended: true,        // Badge "Recommandé"
      min: number,
      max: number,
      annualSavings: {
        min: number,
        max: number
      },
      paybackPeriod: {
        min: number,
        max: number
      }
    },
    
    // 🥇 GAMME PREMIUM
    premium: {
      name: "Premium",
      type: "Uréthane giclé",
      rValue: 60,
      min: number,
      max: number,
      annualSavings: {
        min: number,
        max: number
      },
      paybackPeriod: {
        min: number,
        max: number
      }
    }
  },
  
  // Détails de calcul
  adjustedArea: number,         // Superficie ajustée avec pente
  calculationFactors: {
    pitchMultiplier: number,    // Multiplicateur de pente (1.0 - 1.93)
    accessMultiplier: number,   // Multiplicateur d'accès (1.0 - 1.3)
    currentRValue: number       // Valeur R actuelle (5 - 45)
  }
}
```

**Exemple complet:**
```json
{
  "estimatedCost": null,
  "ranges": {
    "economique": {
      "name": "Économique",
      "type": "Fibre de verre soufflée",
      "rValue": 50,
      "min": 2160,
      "max": 2400,
      "annualSavings": {
        "min": 648,
        "max": 778
      },
      "paybackPeriod": {
        "min": 2.8,
        "max": 3.7
      }
    },
    "standard": {
      "name": "Standard",
      "type": "Cellulose soufflée",
      "rValue": 55,
      "recommended": true,
      "min": 2880,
      "max": 4320,
      "annualSavings": {
        "min": 756,
        "max": 907
      },
      "paybackPeriod": {
        "min": 3.2,
        "max": 5.7
      }
    },
    "premium": {
      "name": "Premium",
      "type": "Uréthane giclé",
      "rValue": 60,
      "min": 9600,
      "max": 14400,
      "annualSavings": {
        "min": 864,
        "max": 1037
      },
      "paybackPeriod": {
        "min": 9.3,
        "max": 16.7
      }
    }
  },
  "adjustedArea": 2400,
  "calculationFactors": {
    "pitchMultiplier": 1.0,
    "accessMultiplier": 1.0,
    "currentRValue": 15
  }
}
```

---

## 🏷️ UTM Parameters (Tracking Marketing)

```typescript
utmParams: {
  utm_source?: string,      // Source de la campagne (ex: "google", "facebook")
  utm_medium?: string,      // Medium (ex: "cpc", "social")
  utm_campaign?: string,    // Nom de la campagne
  utm_term?: string,        // Terme de recherche
  utm_content?: string      // Contenu de l'annonce
}
```

**Exemple:**
```json
{
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "isolation-hiver-2024",
  "utm_term": "isolation entretoit montreal",
  "utm_content": "ad-variant-a"
}
```

---

## 📊 Exemple Complet du Payload

```json
{
  "timestamp": "2024-11-04T19:55:23.456Z",
  "leadId": "LEAD1730751323abc12345",
  "webhookType": "initial_contact",
  "source": "soumission-toiture-ai",
  
  "contact": {
    "firstName": "Jean",
    "lastName": "Tremblay",
    "email": "jean.tremblay@example.com",
    "phone": "(514) 555-1234"
  },
  
  "property": {
    "address": "123 Rue Principale, Montréal, QC",
    "city": "Montréal",
    "postalCode": "H1A 1A1",
    "roofArea": 2400,
    "buildingHeight": 25,
    "pitchComplexity": "moderate",
    "obstacles": ["cheminée"],
    "coordinates": {
      "lat": 45.5017,
      "lng": -73.5673
    }
  },
  
  "projectDetails": {
    "heatingSystem": "electricite",
    "currentInsulation": "partielle",
    "atticAccess": "facile",
    "identifiedProblems": ["courants-air", "factures-elevees"],
    "roofConditions": ["courants-air", "factures-elevees"],
    "roofAge": "",
    "roofMaterial": "",
    "propertyAccess": "facile",
    "serviceType": [],
    "timeline": "",
    "contactPreference": "",
    "contactTime": ""
  },
  
  "pricing": {
    "estimatedCost": null,
    "ranges": {
      "economique": {
        "name": "Économique",
        "type": "Fibre de verre soufflée",
        "rValue": 50,
        "min": 2160,
        "max": 2400,
        "annualSavings": { "min": 648, "max": 778 },
        "paybackPeriod": { "min": 2.8, "max": 3.7 }
      },
      "standard": {
        "name": "Standard",
        "type": "Cellulose soufflée",
        "rValue": 55,
        "recommended": true,
        "min": 2880,
        "max": 4320,
        "annualSavings": { "min": 756, "max": 907 },
        "paybackPeriod": { "min": 3.2, "max": 5.7 }
      },
      "premium": {
        "name": "Premium",
        "type": "Uréthane giclé",
        "rValue": 60,
        "min": 9600,
        "max": 14400,
        "annualSavings": { "min": 864, "max": 1037 },
        "paybackPeriod": { "min": 9.3, "max": 16.7 }
      }
    },
    "adjustedArea": 2400,
    "calculationFactors": {
      "pitchMultiplier": 1.0,
      "accessMultiplier": 1.0,
      "currentRValue": 15
    }
  },
  
  "utmParams": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "isolation-hiver-2024"
  }
}
```

---

## 🔍 Notes Importantes

### Champs Requis
Les champs suivants sont **obligatoires** et validés côté serveur:
- `firstName`
- `lastName`
- `email`
- `phone`
- `roofData`
- `userAnswers`
- `pricingData`

### Calcul des Prix
Les prix sont calculés automatiquement selon l'algorithme suivant:
1. **Superficie ajustée** = roofArea × pitchMultiplier
2. **Coût de base** = adjustedArea × prix/pi² (selon la gamme)
3. **Ajustements**:
   - Complexité d'accès: ×1.0 à ×1.3
   - Retrait d'isolation: +$3/pi² si nécessaire
   - Problèmes: +$550 à +$2,125 selon le type

### Meta Pixel Tracking
La valeur envoyée au Meta Pixel est calculée comme:
```
valeur = (standard.min + standard.max) / 2
```

### Compatibilité
Les anciens champs (`roofConditions`, `propertyAccess`) sont maintenus pour assurer la compatibilité avec les systèmes existants.

---

## 📞 Support
Pour toute question sur la structure du payload, contactez l'équipe technique.
