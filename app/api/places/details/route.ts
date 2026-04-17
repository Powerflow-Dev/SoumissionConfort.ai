import { type NextRequest, NextResponse } from "next/server"
import { isAllowedOrigin } from "@/lib/allowed-origins"

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_SOLAR_API_KEY

export async function GET(request: NextRequest) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const placeId = searchParams.get("place_id")

    if (!placeId) {
      return NextResponse.json({ error: "place_id is required" }, { status: 400 })
    }

    if (!GOOGLE_API_KEY) {
      console.error("Google Places API key not configured")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=address_components,formatted_address,geometry&key=${GOOGLE_API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      console.error("Places Details API request failed:", response.status)
      return NextResponse.json({ error: "Failed to fetch place details" }, { status: response.status })
    }

    const data = await response.json()

    if (data.status !== "OK" || !data.result) {
      console.error("Places Details API error:", data.status, data.error_message)
      return NextResponse.json({
        error: data.error_message || "Failed to get place details",
        status: data.status
      }, { status: 400 })
    }

    const result = data.result

    let streetNumber = ""
    let route = ""
    let city = ""
    let province = ""
    let postalCode = ""
    let country = ""

    if (result.address_components) {
      for (const component of result.address_components) {
        const types = component.types

        if (types.includes("street_number")) {
          streetNumber = component.long_name
        } else if (types.includes("route")) {
          route = component.long_name
        } else if (types.includes("locality")) {
          city = component.long_name
        } else if (types.includes("sublocality") && !city) {
          city = component.long_name
        } else if (types.includes("administrative_area_level_2") && !city) {
          city = component.long_name
        } else if (types.includes("administrative_area_level_1")) {
          province = component.short_name
        } else if (types.includes("postal_code")) {
          postalCode = component.long_name
        } else if (types.includes("country")) {
          country = component.short_name
        }
      }
    }

    if (!city && province) {
      city = province
    }

    const structuredAddress = {
      streetNumber,
      route,
      streetAddress: streetNumber && route ? `${streetNumber} ${route}` : route,
      city,
      province,
      postalCode,
      country,
      formattedAddress: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      }
    }

    return NextResponse.json({
      success: true,
      placeId,
      address: structuredAddress
    })

  } catch (error) {
    console.error("Place details error:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
