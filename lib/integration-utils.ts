import crypto from "crypto"
import { integrations, type IntegrationConfig } from "./integrations-config"

export interface LeadData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  roofData?: {
    roofArea: number
    solarPotential: number
    buildingInsights: any
  }
  userAnswers?: Record<string, any>
  pricingData?: {
    totalCost: number
    materialCost: number
    laborCost: number
    selectedMaterial: string
  }
  timestamp: string
}

export interface IntegrationResult {
  integration: string
  success: boolean
  error?: string
  response?: any
}

export function transformLeadData(leadData: LeadData, config: IntegrationConfig): Record<string, any> {
  const transformed: Record<string, any> = {}

  // Basic contact information
  if (leadData.firstName && config.fieldMapping.firstName) {
    transformed[config.fieldMapping.firstName] = leadData.firstName
  }
  if (leadData.lastName && config.fieldMapping.lastName) {
    transformed[config.fieldMapping.lastName] = leadData.lastName
  }
  if (leadData.email && config.fieldMapping.email) {
    transformed[config.fieldMapping.email] = leadData.email
  }
  if (leadData.phone && config.fieldMapping.phone) {
    transformed[config.fieldMapping.phone] = leadData.phone
  }
  if (leadData.address && config.fieldMapping.address) {
    transformed[config.fieldMapping.address] = leadData.address
  }

  // Roof data
  if (leadData.roofData?.roofArea && config.fieldMapping.roofArea) {
    transformed[config.fieldMapping.roofArea] = leadData.roofData.roofArea
  }
  if (leadData.roofData?.solarPotential && config.fieldMapping.solarPotential) {
    transformed[config.fieldMapping.solarPotential] = leadData.roofData.solarPotential
  }
  if (leadData.roofData?.buildingInsights && config.fieldMapping.buildingInsights) {
    transformed[config.fieldMapping.buildingInsights] = leadData.roofData.buildingInsights
  }

  // Pricing data
  if (leadData.pricingData?.totalCost && config.fieldMapping.totalCost) {
    transformed[config.fieldMapping.totalCost] = leadData.pricingData.totalCost
  }
  if (leadData.pricingData?.materialCost && config.fieldMapping.materialCost) {
    transformed[config.fieldMapping.materialCost] = leadData.pricingData.materialCost
  }
  if (leadData.pricingData?.laborCost && config.fieldMapping.laborCost) {
    transformed[config.fieldMapping.laborCost] = leadData.pricingData.laborCost
  }
  if (leadData.pricingData?.selectedMaterial && config.fieldMapping.selectedMaterial) {
    transformed[config.fieldMapping.selectedMaterial] = leadData.pricingData.selectedMaterial
  }

  // Additional fields for specific integrations
  if (config.name === "HubSpot CRM") {
    transformed.lifecyclestage = "lead"
    transformed.lead_source = "Roofing Quote Calculator"
  }

  if (config.name === "Salesforce") {
    transformed.LeadSource = "Website - Roofing Calculator"
    transformed.Status = "New"
  }

  if (config.name === "Mailchimp") {
    transformed.status = "subscribed"
    transformed.tags = ["roofing-lead", "quote-request"]
  }

  return transformed
}

export async function sendToIntegration(integrationKey: string, leadData: LeadData): Promise<IntegrationResult> {
  const integration = integrations[integrationKey]

  if (!integration || !integration.enabled) {
    return {
      integration: integrationKey,
      success: false,
      error: "Integration not enabled or configured",
    }
  }

  try {
    const transformedData = integration.transformData ? integration.transformData(leadData) : leadData

    const headers = { ...integration.headers }

    // Add API key to headers if needed
    if (integration.apiKey) {
      if (integrationKey === "hubspot") {
        headers.Authorization = `Bearer ${integration.apiKey}`
      } else if (integrationKey === "mailchimp") {
        headers.Authorization = `apikey ${integration.apiKey}`
      }
    }

    const response = await fetch(integration.endpoint!, {
      method: "POST",
      headers,
      body: JSON.stringify(transformedData),
    })

    const responseData = await response.text()
    let parsedResponse

    try {
      parsedResponse = JSON.parse(responseData)
    } catch {
      parsedResponse = responseData
    }

    if (!response.ok) {
      return {
        integration: integrationKey,
        success: false,
        error: `HTTP ${response.status}: ${parsedResponse?.message || responseData}`,
        response: parsedResponse,
      }
    }

    return {
      integration: integrationKey,
      success: true,
      response: parsedResponse,
    }
  } catch (error) {
    return {
      integration: integrationKey,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function sendToMultipleIntegrations(
  leadData: LeadData,
  targetIntegrations?: string[],
): Promise<IntegrationResult[]> {
  const integrationsToUse = targetIntegrations || Object.keys(integrations)

  const results = await Promise.allSettled(integrationsToUse.map((key) => sendToIntegration(key, leadData)))

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value
    } else {
      return {
        integration: integrationsToUse[index],
        success: false,
        error: result.reason?.message || "Promise rejected",
      }
    }
  })
}

export function validateLeadData(data: any): LeadData | null {
  if (!data.firstName || !data.lastName || !data.email) {
    return null
  }

  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || "",
    address: data.address || "",
    roofData: data.roofData,
    userAnswers: data.userAnswers,
    pricingData: data.pricingData,
    timestamp: new Date().toISOString(),
  }
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${expectedSignature}`))
}
