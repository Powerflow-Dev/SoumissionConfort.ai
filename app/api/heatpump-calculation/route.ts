import { NextResponse } from "next/server"
import { 
  generateHeatPumpRecommendation,
  validateSurfaceEstimate,
  type GeometricData,
  type ThermalProfile
} from "@/lib/heatpump-calculator"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { 
      geometric,
      thermal,
      userCorrectedArea
    }: { 
      geometric: GeometricData
      thermal: ThermalProfile
      userCorrectedArea?: number
    } = body

    // Validation des données
    if (!geometric || !thermal) {
      return NextResponse.json(
        { error: "Données géométriques ou thermiques manquantes" },
        { status: 400 }
      )
    }

    if (!geometric.solarArea || geometric.solarArea <= 0) {
      return NextResponse.json(
        { error: "Surface du toit invalide" },
        { status: 400 }
      )
    }

    // Générer la recommandation complète
    const recommendation = generateHeatPumpRecommendation(geometric, thermal)

    // Appliquer la correction utilisateur si fournie
    if (userCorrectedArea && userCorrectedArea > 0) {
      const correctedArea = validateSurfaceEstimate(
        recommendation.surface.totalHabitableArea,
        userCorrectedArea
      )
      
      // Recalculer avec la surface corrigée
      const correctedRecommendation = generateHeatPumpRecommendation(
        {
          ...geometric,
          // Ajuster solarArea pour obtenir la surface souhaitée
          solarArea: (userCorrectedArea / recommendation.surface.totalHabitableArea) * geometric.solarArea
        },
        thermal
      )
      
      return NextResponse.json({
        success: true,
        recommendation: correctedRecommendation,
        userCorrected: true,
        originalEstimate: recommendation.surface.totalHabitableArea
      })
    }

    return NextResponse.json({
      success: true,
      recommendation,
      userCorrected: false
    })

  } catch (error) {
    console.error("[HEATPUMP_CALCULATION]", error)
    return NextResponse.json(
      { error: "Erreur lors du calcul de la thermopompe" },
      { status: 500 }
    )
  }
}
