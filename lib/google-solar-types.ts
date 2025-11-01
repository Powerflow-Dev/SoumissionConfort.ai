// TypeScript types for Google Solar API responses

export interface GoogleSolarBuildingInsights {
  name: string
  center: {
    latitude: number
    longitude: number
  }
  boundingBox: {
    sw: { latitude: number; longitude: number }
    ne: { latitude: number; longitude: number }
  }
  imageryDate: {
    year: number
    month: number
    day: number
  }
  solarPotential: {
    maxArrayPanelsCount: number
    maxArrayAreaMeters2: number
    maxSunshineHoursPerYear: number
    carbonOffsetFactorKgPerMwh: number
    wholeRoofStats: {
      areaMeters2: number
      sunshineQuantiles: number[]
      groundAreaMeters2: number
    }
    roofSegmentStats: Array<{
      pitchDegrees: number
      azimuthDegrees: number
      stats: {
        areaMeters2: number
        sunshineQuantiles: number[]
        groundAreaMeters2: number
      }
      center: {
        latitude: number
        longitude: number
      }
      boundingBox: {
        sw: { latitude: number; longitude: number }
        ne: { latitude: number; longitude: number }
      }
    }>
    solarPanels: Array<{
      center: { latitude: number; longitude: number }
      orientation: string
      yearlyEnergyDcKwh: number
      segmentIndex: number
    }>
    financialAnalyses: Array<{
      monthlyBill: {
        currencyCode: string
        units: string
      }
      defaultBill: boolean
      averageKwhPerMonth: number
      // ... more financial data
    }>
  }
}

export interface ProcessedRoofData {
  roofArea: number
  usableArea: number
  segments: number
  pitchComplexity: "simple" | "moderate" | "complex"
  buildingHeight: number
  obstacles: string[]
  accessDifficulty: "easy" | "moderate" | "difficult"
  roofShape: "simple" | "moderate" | "complex"
  coordinates: {
    lat: number
    lng: number
  }
  googleData?: GoogleSolarBuildingInsights
}
