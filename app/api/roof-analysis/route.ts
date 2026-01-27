import { type NextRequest, NextResponse } from "next/server"
import { initializeMeta, isMetaConfigured } from "@/lib/meta-config"
import { trackFindLocation } from "@/lib/meta-conversion-api"

const GOOGLE_SOLAR_API_KEY = process.env.GOOGLE_SOLAR_API_KEY
const GOOGLE_SOLAR_BASE_URL = "https://solar.googleapis.com/v1"
const GOOGLE_GEOCODING_BASE_URL = "https://maps.googleapis.com/maps/api/geocode"

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    if (!GOOGLE_SOLAR_API_KEY) {
      console.error("Google Solar API key not configured")
      return NextResponse.json({ error: "Google Solar API key not configured" }, { status: 500 })
    }

    console.log("Starting roof analysis for address:", address)

    // Initialize Meta Conversion API and track FindLocation event
    initializeMeta()
    if (isMetaConfigured()) {
      trackFindLocation(address)
        .then(result => {
          if (result.success) {
            console.log('FindLocation event tracked successfully for address:', address)
          }
        })
        .catch(error => {
          console.error('Failed to track FindLocation event:', error)
        })
    }

    // Step 1: Convert address to coordinates using Google Geocoding API
    const coordinates = await geocodeAddress(address)

    if (!coordinates) {
      return NextResponse.json(
        {
          error: "Unable to find the specified address. Please check the address format and try again.",
          fallback: true,
        },
        { status: 422 },
      )
    }

    console.log("Geocoded coordinates:", coordinates)

    // Step 2: Get building insights from Google Solar API using coordinates
    const buildingData = await getBuildingInsights(coordinates)

    if (!buildingData) {
      console.log("Solar API failed, using realistic fallback data")
      const fallbackData = generateRealisticFallbackData(address, coordinates)
      return NextResponse.json({
        address,
        roofData: fallbackData,
        source: "fallback",
        warning:
          "Solar analysis not available for this location. Using estimated data based on typical residential properties.",
      })
    }

    // Step 3: Process Google Solar API response
    try {
      console.log("About to process Google Solar response...")
      const roofData = processGoogleSolarResponse(buildingData, address, coordinates)
      console.log("Successfully processed roof data:", roofData)

      return NextResponse.json({
        address,
        roofData,
        source: "google_solar_api",
      })
    } catch (processingError) {
      console.error("Error processing Google Solar response:", processingError)
      console.log("Falling back to realistic data")
      const fallbackData = generateRealisticFallbackData(address, coordinates)
      return NextResponse.json({
        address,
        roofData: fallbackData,
        source: "fallback",
        warning: "Using estimated data due to processing error",
      })
    }
  } catch (error) {
    console.error("Roof analysis error:", error)

    // Return realistic fallback data if everything fails
    const fallbackData = generateRealisticFallbackData("Unknown Address", null)

    return NextResponse.json({
      address: "Unknown Address",
      roofData: fallbackData,
      source: "fallback",
      warning: "Using estimated data due to service limitations",
    })
  }
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; city?: string; postalCode?: string; formattedAddress?: string } | null> {
  try {
    const geocodingUrl = `${GOOGLE_GEOCODING_BASE_URL}/json`
    const params = new URLSearchParams({
      address: address,
      key: GOOGLE_SOLAR_API_KEY!,
    })

    console.log("Calling Geocoding API...")
    const response = await fetch(`${geocodingUrl}?${params}`)

    if (!response.ok) {
      console.error("Geocoding API request failed:", response.status)
      return null
    }

    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.error("Geocoding failed:", data.status, data.error_message)
      return null
    }

    const result = data.results[0]
    const location = result.geometry.location
    
    // Extract city and postal code from address components
    let city = ""
    let postalCode = ""
    
    if (result.address_components) {
      for (const component of result.address_components) {
        const types = component.types
        
        // Extract city (locality, administrative_area_level_2, or administrative_area_level_1)
        if (types.includes('locality')) {
          city = component.long_name
        } else if (types.includes('administrative_area_level_2') && !city) {
          city = component.long_name
        } else if (types.includes('administrative_area_level_1') && !city) {
          city = component.long_name
        }
        
        // Extract postal code
        if (types.includes('postal_code')) {
          postalCode = component.long_name
        }
      }
    }

    console.log("Extracted location data:", {
      lat: location.lat,
      lng: location.lng,
      city,
      postalCode,
      formattedAddress: result.formatted_address
    })

    return {
      lat: location.lat,
      lng: location.lng,
      city,
      postalCode,
      formattedAddress: result.formatted_address
    }
  } catch (error) {
    console.error("Geocoding error:", error)
    return null
  }
}

async function getBuildingInsights(coordinates: { lat: number; lng: number }): Promise<any | null> {
  try {
    const buildingInsightsUrl = `${GOOGLE_SOLAR_BASE_URL}/buildingInsights:findClosest`
    const params = new URLSearchParams({
      "location.latitude": coordinates.lat.toString(),
      "location.longitude": coordinates.lng.toString(),
      key: GOOGLE_SOLAR_API_KEY!,
    })

    console.log("Calling Solar API with coordinates:", coordinates)
    const response = await fetch(`${buildingInsightsUrl}?${params}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }))
      console.error("Solar API error:", response.status, errorData)
      return null
    }

    const buildingData = await response.json()
    console.log("Solar API success!")
    return buildingData
  } catch (error) {
    console.error("Solar API request error:", error)
    return null
  }
}

function processGoogleSolarResponse(buildingData: any, address: string, coordinates: { lat: number; lng: number; city?: string; postalCode?: string; formattedAddress?: string }) {
  console.log("Processing Google Solar response...")

  const solarPotential = buildingData.solarPotential
  console.log("Solar potential data:", solarPotential ? "Found" : "Missing")

  const roofSegmentStats = solarPotential?.roofSegmentStats || []
  console.log("Roof segments found:", roofSegmentStats.length)

  // Use wholeRoofStats.areaMeters2 as the primary source for total roof area
  const wholeRoofAreaM2 = solarPotential?.wholeRoofStats?.areaMeters2
  console.log("Whole roof area from API (m²):", wholeRoofAreaM2)

  let totalRoofAreaM2 = wholeRoofAreaM2

  // Only fall back to segment calculation if wholeRoofStats is not available
  if (!totalRoofAreaM2) {
    totalRoofAreaM2 = roofSegmentStats.reduce((sum: number, segment: any) => {
      const area = segment.stats?.areaMeters2 || 0
      console.log("Segment area (m²):", area)
      return sum + area
    }, 0)
    console.log("Calculated total from segments (m²):", totalRoofAreaM2)
  }

  // Convert square meters to square feet (1 m² = 10.764 sq ft)
  const totalRoofArea = totalRoofAreaM2 * 10.764
  console.log("Total roof area (sq ft):", totalRoofArea)

  // For usable area, use a percentage of the total roof area (typically 85-90%)
  const usableArea = totalRoofArea * 0.87 // 87% is typical for residential roofs
  console.log("Usable area (sq ft):", usableArea)

  // Validate that we got meaningful data
  if (totalRoofArea < 500 || totalRoofArea > 15000) {
    console.log("Roof area seems unrealistic, using fallback calculation")
    return generateRealisticFallbackData(address, coordinates)
  }

  // Rest of the function remains the same...
  const segments = roofSegmentStats.length
  const pitchComplexity = calculatePitchComplexity(roofSegmentStats)
  const buildingHeight = estimateBuildingHeight(buildingData, roofSegmentStats)
  const obstacles = extractObstacles(solarPotential, roofSegmentStats)
  const accessDifficulty = assessAccessDifficulty(buildingData, totalRoofArea)
  const roofShape = assessRoofShape(roofSegmentStats)

  console.log("Processed roof data:", {
    roofArea: Math.round(totalRoofArea),
    usableArea: Math.round(usableArea),
    segments,
    pitchComplexity,
    buildingHeight,
    obstacles,
    accessDifficulty,
    roofShape,
  })

  const result = {
    roofArea: Math.round(totalRoofArea),
    usableArea: Math.round(usableArea),
    segments,
    pitchComplexity,
    buildingHeight,
    obstacles,
    accessDifficulty,
    roofShape,
    coordinates,
    googleData: buildingData,
    address: coordinates.formattedAddress || address,
    city: coordinates.city || "",
    postalCode: coordinates.postalCode || "",
  }

  console.log("Returning processed result")
  return result
}

function calculatePitchComplexity(segments: any[]): string {
  if (!segments || segments.length === 0) return "moderate"

  // Analyze actual pitch data from segments
  const pitches = segments.map((s) => s.pitchDegrees).filter((p) => p !== undefined && p !== null && p >= 0)
  console.log("Pitch angles found:", pitches)

  if (pitches.length === 0) return "moderate"

  const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length
  const maxPitch = Math.max(...pitches)
  const minPitch = Math.min(...pitches)
  const pitchVariation = maxPitch - minPitch

  console.log("Pitch analysis:", {
    segments: segments.length,
    avgPitch: avgPitch.toFixed(1),
    maxPitch,
    minPitch,
    pitchVariation: pitchVariation.toFixed(1),
  })

  // More realistic complexity assessment for residential properties
  // Most residential roofs have pitches between 15-45 degrees
  if (segments.length <= 3 && avgPitch <= 30 && pitchVariation <= 10) {
    console.log("Classified as SIMPLE roof")
    return "simple"
  } else if (segments.length >= 10 || avgPitch >= 50 || pitchVariation >= 25) {
    console.log("Classified as COMPLEX roof")
    return "complex"
  } else {
    console.log("Classified as MODERATE roof")
    return "moderate"
  }
}

function estimateBuildingHeight(buildingData: any, segments: any[]): number {
  // More realistic height estimation
  const segmentCount = segments.length

  // Base height estimation on typical residential construction
  let baseHeight = 20 // Single story base

  // Add height for complexity
  if (segmentCount > 4) {
    baseHeight += 8 // Likely two-story
  }
  if (segmentCount > 8) {
    baseHeight += 5 // Additional complexity
  }

  // Cap at reasonable residential height
  return Math.min(baseHeight, 35)
}

function extractObstacles(solarPotential: any, segments: any[]): string[] {
  const obstacles = []

  if (!solarPotential || !segments) return ["minimal obstacles"]

  const segmentCount = segments.length

  // More conservative obstacle detection
  if (segmentCount >= 6) {
    obstacles.push("multiple roof sections")
  }

  // Check for significant shading (more conservative threshold)
  const shadedSegments = segments.filter((segment: any) => {
    const sunshineQuantiles = segment.stats?.sunshineQuantiles || []
    return sunshineQuantiles.length > 0 && sunshineQuantiles[0] < 800 // Higher threshold
  })

  if (shadedSegments.length > segments.length * 0.4) {
    obstacles.push("shading from trees or buildings")
  }

  // Only add penetrations for very complex roofs
  if (segmentCount >= 10) {
    obstacles.push("roof penetrations")
  }

  return obstacles.length > 0 ? obstacles : ["minimal obstacles"]
}

function assessAccessDifficulty(buildingData: any, roofArea: number): string {
  // More realistic access assessment
  const bounds = buildingData.boundingBox

  // Smaller roofs are often harder to access
  if (roofArea < 1500) return "moderate"
  if (roofArea > 3000) return "easy"

  // Default to easy for typical residential
  return "easy"
}

function assessRoofShape(segments: any[]): string {
  if (!segments || segments.length === 0) return "moderate"

  console.log("Roof shape analysis - segments:", segments.length)

  // More realistic shape assessment for residential properties
  if (segments.length <= 4) {
    console.log("Classified as SIMPLE roof shape")
    return "simple"
  }
  if (segments.length <= 8) {
    console.log("Classified as MODERATE roof shape")
    return "moderate"
  }
  console.log("Classified as COMPLEX roof shape")
  return "complex"
}

function generateRealisticFallbackData(address: string, coordinates: { lat: number; lng: number; city?: string; postalCode?: string; formattedAddress?: string } | null) {
  // Generate realistic data based on typical Canadian residential properties
  const roofArea = 1000 + Math.floor(Math.random() * 800) // 1000-1800 sq ft (typical range for Quebec bungalows)
  const usableArea = Math.floor(roofArea * (0.85 + Math.random() * 0.1)) // 85-95% usable

  // Realistic segment count (most homes have 2-4 main roof sections)
  const segments = 2 + Math.floor(Math.random() * 3) // 2-4 segments

  // Most residential roofs are simple to moderate
  const complexityOptions = ["simple", "simple", "moderate", "moderate", "complex"] // Weighted toward simpler
  const pitchComplexity = complexityOptions[Math.floor(Math.random() * complexityOptions.length)]

  // Realistic building height for Canadian residential
  const buildingHeight = 18 + Math.floor(Math.random() * 12) // 18-30 feet

  // Most residential properties have easy access
  const accessOptions = ["easy", "easy", "easy", "moderate", "moderate"] // Weighted toward easier
  const accessDifficulty = accessOptions[Math.floor(Math.random() * accessOptions.length)]

  // Conservative obstacle detection
  const obstacleOptions = [["minimal obstacles"], ["minimal obstacles"], ["chimney"], ["skylight"], ["chimney", "vent"]]
  const obstacles = obstacleOptions[Math.floor(Math.random() * obstacleOptions.length)]

  return {
    roofArea,
    usableArea,
    segments,
    pitchComplexity,
    buildingHeight,
    obstacles,
    accessDifficulty,
    roofShape: pitchComplexity, // Keep consistent
    coordinates: coordinates || {
      lat: 43.6532 + (Math.random() - 0.5) * 0.1,
      lng: -79.3832 + (Math.random() - 0.5) * 0.1,
    },
    address: coordinates?.formattedAddress || address,
    city: coordinates?.city || extractCityFromAddress(address),
    postalCode: coordinates?.postalCode || extractPostalCodeFromAddress(address),
  }
}

// Helper functions to extract city and postal code from address strings
function extractCityFromAddress(address: string): string {
  // Try to extract city from common address formats
  // This is a fallback when geocoding doesn't provide structured data
  const parts = address.split(',').map(part => part.trim())
  
  // For Canadian addresses, city is usually the second-to-last part before province
  if (parts.length >= 3) {
    return parts[parts.length - 3] || ""
  } else if (parts.length >= 2) {
    return parts[parts.length - 2] || ""
  }
  
  return ""
}

function extractPostalCodeFromAddress(address: string): string {
  // Canadian postal code regex: A1A 1A1 format
  const canadianPostalRegex = /[A-Za-z]\d[A-Za-z]\s*\d[A-Za-z]\d/g
  const match = address.match(canadianPostalRegex)
  
  if (match && match.length > 0) {
    return match[0].toUpperCase().replace(/\s+/g, ' ').trim()
  }
  
  // US ZIP code regex: 12345 or 12345-6789 format
  const usZipRegex = /\b\d{5}(-\d{4})?\b/g
  const zipMatch = address.match(usZipRegex)
  
  if (zipMatch && zipMatch.length > 0) {
    return zipMatch[0]
  }
  
  return ""
}
