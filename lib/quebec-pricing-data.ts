export interface RoofMaterial {
  id: string
  name: string
  nameFr: string
  priceRange: {
    min: number
    max: number
  }
  durability: number // years
  description: string
  descriptionFr: string
  category: "economique" | "standard" | "premium" | "luxe"
  suitableFor: string[]
}

export const quebecRoofMaterials: RoofMaterial[] = [
  {
    id: "asphalt-shingles",
    name: "Asphalt Shingles",
    nameFr: "Bardeaux d'asphalte",
    priceRange: { min: 4, max: 12 },
    durability: 20,
    description: "Most economical option, 15-20 years lifespan",
    descriptionFr: "Option la plus économique, durée de vie 15-20 ans",
    category: "economique",
    suitableFor: ["residential", "sloped-roof"],
  },
  {
    id: "metal-steel-aluminum",
    name: "Metal Roofing (Steel/Aluminum)",
    nameFr: "Toiture métallique (acier/aluminium)",
    priceRange: { min: 10, max: 20 },
    durability: 50,
    description: "Very durable, 50+ years, high initial cost",
    descriptionFr: "Très durable 50+ ans, coût initial élevé",
    category: "standard",
    suitableFor: ["residential", "commercial", "sloped-roof"],
  },
  {
    id: "metal-copper",
    name: "Copper Roofing",
    nameFr: "Toiture en cuivre",
    priceRange: { min: 25, max: 30 },
    durability: 100,
    description: "Premium metal option, exceptional durability",
    descriptionFr: "Option métallique haut de gamme, durabilité exceptionnelle",
    category: "luxe",
    suitableFor: ["residential", "heritage", "sloped-roof"],
  },
  {
    id: "elastomeric-membrane",
    name: "Elastomeric Membrane",
    nameFr: "Membrane élastomère",
    priceRange: { min: 8, max: 20 },
    durability: 30,
    description: "Two-layer coating for flat roofs, 25-35 years lifespan",
    descriptionFr: "Revêtement bicouche pour toits plats, durée de vie 25-35 ans",
    category: "standard",
    suitableFor: ["flat-roof", "commercial", "residential"],
  },
  {
    id: "cedar-shingles",
    name: "Cedar Shingles",
    nameFr: "Bardeaux de cèdre",
    priceRange: { min: 12, max: 25 },
    durability: 25,
    description: "Premium rustic appearance, requires periodic maintenance",
    descriptionFr: "Aspect haut de gamme rustique, entretien périodique requis",
    category: "premium",
    suitableFor: ["residential", "sloped-roof", "heritage"],
  },
  {
    id: "clay-concrete-tiles",
    name: "Clay/Concrete Tiles",
    nameFr: "Tuiles d'argile ou de béton",
    priceRange: { min: 20, max: 30 },
    durability: 50,
    description: "Very durable and heavy materials, specialized installation",
    descriptionFr: "Matériaux très durables et lourds, installation spécialisée",
    category: "premium",
    suitableFor: ["residential", "sloped-roof", "mediterranean-style"],
  },
  {
    id: "green-roof-extensive",
    name: "Green Roof (Extensive)",
    nameFr: "Toiture végétale (extensive)",
    priceRange: { min: 18, max: 30 },
    durability: 40,
    description: "Thin substrate, light vegetation, eco-friendly",
    descriptionFr: "Substrat mince, végétation légère, écologique",
    category: "premium",
    suitableFor: ["flat-roof", "commercial", "eco-friendly"],
  },
  {
    id: "green-roof-intensive",
    name: "Green Roof (Intensive)",
    nameFr: "Toiture végétale (intensive)",
    priceRange: { min: 30, max: 48 },
    durability: 40,
    description: "Thick substrate, rooftop gardens, maximum eco benefits",
    descriptionFr: "Substrat épais, jardins sur toit, bénéfices écologiques maximaux",
    category: "luxe",
    suitableFor: ["flat-roof", "commercial", "eco-friendly", "urban-agriculture"],
  },
  {
    id: "slate-natural",
    name: "Natural Slate",
    nameFr: "Ardoise naturelle",
    priceRange: { min: 40, max: 60 },
    durability: 100,
    description: "Premium natural stone, exceptional longevity",
    descriptionFr: "Pierre naturelle haut de gamme, longévité exceptionnelle",
    category: "luxe",
    suitableFor: ["residential", "heritage", "sloped-roof", "luxury"],
  },
  {
    id: "tpo-epdm-membrane",
    name: "TPO/EPDM Membrane",
    nameFr: "Membrane TPO/EPDM",
    priceRange: { min: 11, max: 16 },
    durability: 25,
    description: "Alternative flat roof membrane, single-layer waterproofing",
    descriptionFr: "Membrane alternative pour toits plats, imperméabilisation monocouche",
    category: "economique",
    suitableFor: ["flat-roof", "commercial", "budget-conscious"],
  },
]

export const quebecRoofingMaterials = quebecRoofMaterials

export function calculateRoofingCost(
  roofArea: number,
  materialId: string,
  complexity: "simple" | "moderate" | "complex" = "moderate",
): {
  material: RoofMaterial | null
  materialCost: number
  laborCost: number
  totalCost: number
  pricePerSqFt: number
} {
  const material = quebecRoofMaterials.find((m) => m.id === materialId)

  if (!material) {
    return {
      material: null,
      materialCost: 0,
      laborCost: 0,
      totalCost: 0,
      pricePerSqFt: 0,
    }
  }

  // Calculate average price per sq ft
  const avgPricePerSqFt = (material.priceRange.min + material.priceRange.max) / 2

  // Complexity multipliers
  const complexityMultipliers = {
    simple: 0.9,
    moderate: 1.0,
    complex: 1.3,
  }

  const complexityMultiplier = complexityMultipliers[complexity]
  const adjustedPricePerSqFt = avgPricePerSqFt * complexityMultiplier

  // Split between materials (60%) and labor (40%)
  const materialCostPerSqFt = adjustedPricePerSqFt * 0.6
  const laborCostPerSqFt = adjustedPricePerSqFt * 0.4

  const materialCost = Math.round(materialCostPerSqFt * roofArea)
  const laborCost = Math.round(laborCostPerSqFt * roofArea)
  const totalCost = materialCost + laborCost

  return {
    material,
    materialCost,
    laborCost,
    totalCost,
    pricePerSqFt: adjustedPricePerSqFt,
  }
}

export function getRecommendedMaterials(
  roofType: "sloped" | "flat",
  budget: "low" | "medium" | "high" | "luxury",
  preferences: string[] = [],
): RoofMaterial[] {
  let filtered = quebecRoofMaterials.filter((material) => {
    // Filter by roof type
    if (roofType === "flat" && !material.suitableFor.includes("flat-roof")) {
      return false
    }
    if (
      roofType === "sloped" &&
      !material.suitableFor.includes("sloped-roof") &&
      !material.suitableFor.includes("residential")
    ) {
      return false
    }
    return true
  })

  // Filter by budget
  const budgetRanges = {
    low: { max: 12 },
    medium: { min: 8, max: 25 },
    high: { min: 20, max: 40 },
    luxury: { min: 30 },
  }

  const budgetRange = budgetRanges[budget]
  filtered = filtered.filter((material) => {
    const avgPrice = (material.priceRange.min + material.priceRange.max) / 2
    if (budgetRange.min && avgPrice < budgetRange.min) return false
    if (budgetRange.max && avgPrice > budgetRange.max) return false
    return true
  })

  // Sort by price (ascending)
  filtered.sort((a, b) => {
    const avgA = (a.priceRange.min + a.priceRange.max) / 2
    const avgB = (b.priceRange.min + b.priceRange.max) / 2
    return avgA - avgB
  })

  return filtered.slice(0, 5) // Return top 5 recommendations
}

export function calculateQuebecPricing(
  roofArea: number,
  materialId: string,
  complexityFactor = 1,
  accessFactor = 1,
  conditionFactor = 1,
) {
  // Base calculation using existing helper
  const base = calculateRoofingCost(roofArea, materialId)

  // If material not found, return zeros so the caller can handle gracefully
  if (!base.material) {
    return {
      material: { nameFr: "Inconnu", name: "Unknown" } as any,
      lowEstimate: 0,
      highEstimate: 0,
      pricePerSqFt: 0,
    }
  }

  // Apply multipliers
  const multiplier = complexityFactor * accessFactor * conditionFactor
  const adjustedPricePerSqFt = base.pricePerSqFt * multiplier

  // Provide a ±10% range
  const lowEstimate = Math.round(adjustedPricePerSqFt * 0.9 * roofArea)
  const highEstimate = Math.round(adjustedPricePerSqFt * 1.1 * roofArea)

  return {
    material: base.material,
    lowEstimate,
    highEstimate,
    pricePerSqFt: adjustedPricePerSqFt,
  }
}
