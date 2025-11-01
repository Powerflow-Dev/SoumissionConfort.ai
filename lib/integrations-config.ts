export interface IntegrationConfig {
  name: string
  enabled: boolean
  endpoint?: string
  apiKey?: string
  headers?: Record<string, string>
  fieldMapping?: Record<string, string>
  transformData?: (data: any) => any
}

export const integrations: Record<string, IntegrationConfig> = {
  hubspot: {
    name: "HubSpot CRM",
    enabled: !!process.env.HUBSPOT_API_KEY,
    endpoint: "https://api.hubapi.com/crm/v3/objects/contacts",
    apiKey: process.env.HUBSPOT_API_KEY,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
    },
    fieldMapping: {
      firstName: "firstname",
      lastName: "lastname",
      email: "email",
      phone: "phone",
      address: "address",
      roofArea: "roof_area",
      estimatedCost: "estimated_cost",
    },
    transformData: (data: any) => ({
      properties: {
        firstname: data.firstName,
        lastname: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        roof_area: data.roofData?.roofArea,
        estimated_cost: data.pricingData?.totalCost,
        lead_source: "Soumission Toiture AI",
      },
    }),
  },

  salesforce: {
    name: "Salesforce CRM",
    enabled: !!process.env.SALESFORCE_API_KEY && !!process.env.SALESFORCE_ACCESS_TOKEN,
    endpoint: "https://your-instance.salesforce.com/services/data/v52.0/sobjects/Lead/",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SALESFORCE_ACCESS_TOKEN}`,
    },
    transformData: (data: any) => ({
      FirstName: data.firstName,
      LastName: data.lastName,
      Email: data.email,
      Phone: data.phone,
      Street: data.address,
      Company: "Residential Lead",
      LeadSource: "Soumission Toiture AI",
      Description: `Roof Area: ${data.roofData?.roofArea} sq ft, Estimated Cost: $${data.pricingData?.totalCost}`,
    }),
  },

  mailchimp: {
    name: "Mailchimp",
    enabled: !!process.env.MAILCHIMP_API_KEY && !!process.env.MAILCHIMP_LIST_ID,
    endpoint: `https://us1.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
    },
    transformData: (data: any) => ({
      email_address: data.email,
      status: "subscribed",
      merge_fields: {
        FNAME: data.firstName,
        LNAME: data.lastName,
        PHONE: data.phone,
        ADDRESS: data.address,
        ROOFAREA: data.roofData?.roofArea,
        ESTIMATE: data.pricingData?.totalCost,
      },
      tags: ["roof-quote-lead"],
    }),
  },

  zapier: {
    name: "Zapier Webhook",
    enabled: !!process.env.ZAPIER_WEBHOOK_URL,
    endpoint: process.env.ZAPIER_WEBHOOK_URL,
    headers: {
      "Content-Type": "application/json",
    },
    transformData: (data: any) => data, // Pass through all data
  },

  custom: {
    name: "Custom Webhook",
    enabled: !!process.env.CUSTOM_WEBHOOK_URL,
    endpoint: process.env.CUSTOM_WEBHOOK_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CUSTOM_WEBHOOK_TOKEN}`,
    },
    transformData: (data: any) => ({
      timestamp: new Date().toISOString(),
      source: "soumission-toiture-ai",
      lead: data,
    }),
  },
}
