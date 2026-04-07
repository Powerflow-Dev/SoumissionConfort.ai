// GHL API client used by the Vercel routes when GHL_ENABLED=true.
//
// Architecture: Vercel form handler → postLeadToGHL() → GoHighLevel.
// Replaces the legacy Vercel → Make → Close path. Make is bypassed entirely
// for the lead entry; the qualification webhook (GHL stage "Qualifié" → Make
// → LeadProsper) is configured in the GHL workflow, not here.
//
// Flag: process.env.GHL_ENABLED === 'true'
// Required env: GHL_API_KEY, GHL_LOCATION_ID
// Rate limit: GHL allows ~100 req / 10s per location. Each lead = 2 calls
// (create contact + create opportunity), well under the limit.
import { GHL_FIELDS } from './ghl-fields'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_VERSION = '2021-07-28'

export type LeadVertical = 'isolation' | 'hvac' | 'subvention' | 'isolation_soumission_rapide' | 'roofing'

export interface NormalizedLead {
  vertical: LeadVertical
  // Contact
  firstName: string
  lastName: string
  email: string
  phone: string
  // Address
  address1?: string
  city?: string
  postalCode?: string
  // UTM / attribution
  utmSource?: string
  utmCampaign?: string
  utmContent?: string
  utmMedium?: string
  utmTerm?: string
  fbclid?: string
  landingPage?: string
  leadSource?: string
  // Vertical-specific custom fields (best-effort; absent fields silently dropped)
  custom?: Partial<Record<keyof typeof GHL_FIELDS, unknown>>
  // Optional: stamp for traceability inside GHL
  internalLeadId?: string
  // Optional notes appended on creation
  noteBody?: string
}

interface GHLContactPayload {
  locationId: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address1?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  source?: string
  tags?: string[]
  customFields?: { id: string; field_value: unknown }[]
}

const VERTICAL_TAG: Record<LeadVertical, string> = {
  roofing: 'Lead',
  isolation: 'Lead Iso',
  isolation_soumission_rapide: 'Lead Iso',
  subvention: 'Lead Iso',
  hvac: 'Lead HVAC',
}

export function isGHLEnabled(): boolean {
  return process.env.GHL_ENABLED === 'true'
}

function buildContactPayload(lead: NormalizedLead, locationId: string): GHLContactPayload {
  const customFields: { id: string; field_value: unknown }[] = []

  // Map UTM/attribution to known GHL fields
  if (lead.utmSource) customFields.push({ id: GHL_FIELDS.utm_source.id, field_value: lead.utmSource })
  if (lead.utmCampaign) customFields.push({ id: GHL_FIELDS.campaign_name.id, field_value: lead.utmCampaign })
  if (lead.utmContent) customFields.push({ id: GHL_FIELDS.ad_name.id, field_value: lead.utmContent })
  if (lead.fbclid) customFields.push({ id: GHL_FIELDS.fbclid.id, field_value: lead.fbclid })
  if (lead.landingPage) customFields.push({ id: GHL_FIELDS.landing_page.id, field_value: lead.landingPage })
  if (lead.leadSource) customFields.push({ id: GHL_FIELDS.lead_source.id, field_value: lead.leadSource })
  if (lead.city) customFields.push({ id: GHL_FIELDS.ville.id, field_value: lead.city })
  if (lead.postalCode) customFields.push({ id: GHL_FIELDS.code_postal.id, field_value: lead.postalCode })

  // Vertical-specific fields — silently skip ones not in GHL_FIELDS to avoid breaking deploys
  for (const [key, value] of Object.entries(lead.custom ?? {})) {
    if (value === undefined || value === null || value === '') continue
    const def = (GHL_FIELDS as Record<string, { id: string }>)[key]
    if (def) customFields.push({ id: def.id, field_value: value })
  }

  return {
    locationId,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    address1: lead.address1,
    city: lead.city,
    state: 'QC',
    postalCode: lead.postalCode,
    country: 'CA',
    source: lead.leadSource ?? lead.utmSource ?? 'vercel-direct',
    tags: [VERTICAL_TAG[lead.vertical]],
    customFields,
  }
}

interface GHLResponse<T> {
  ok: boolean
  status: number
  body: T | null
  error?: string
}

async function ghlRequest<T>(
  apiKey: string,
  path: string,
  init: RequestInit = {},
  retries = 3,
): Promise<GHLResponse<T>> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(`${GHL_BASE}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Version: GHL_VERSION,
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
        signal: AbortSignal.timeout(15000),
      })
      const text = await res.text()
      if (res.status === 429 || res.status >= 500) {
        if (attempt < retries - 1) {
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)))
          continue
        }
        return { ok: false, status: res.status, body: null, error: text }
      }
      if (!res.ok) return { ok: false, status: res.status, body: null, error: text }
      const body = text ? (JSON.parse(text) as T) : (null as T | null)
      return { ok: true, status: res.status, body }
    } catch (err) {
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)))
        continue
      }
      return {
        ok: false,
        status: 0,
        body: null,
        error: err instanceof Error ? err.message : 'unknown',
      }
    }
  }
  return { ok: false, status: 0, body: null, error: 'retries exhausted' }
}

export interface GHLPostResult {
  contactId: string | null
  duplicate: boolean
  contactStatus: number
  contactError?: string
}

/**
 * Push a lead to GHL "Powerflow Leads". Creates the contact (or surfaces the
 * duplicate id) and returns enough info for the caller to log/return.
 *
 * Tags drive the GHL workflows ("Lead Optin Toiture/Iso/HVAC") which create
 * the opportunity in the right pipeline + stage and notify Slack/setters.
 * The route does NOT need to call /opportunities directly.
 */
export async function postLeadToGHL(lead: NormalizedLead): Promise<GHLPostResult> {
  const apiKey = process.env.GHL_API_KEY
  const locationId = process.env.GHL_LOCATION_ID
  if (!apiKey || !locationId) {
    return {
      contactId: null,
      duplicate: false,
      contactStatus: 0,
      contactError: 'GHL_API_KEY or GHL_LOCATION_ID not configured',
    }
  }

  const payload = buildContactPayload(lead, locationId)

  // Create contact (GHL upserts on duplicate-not-allowed sub-accounts and returns 200 + existing contact)
  const created = await ghlRequest<{ contact: { id: string }; new?: boolean }>(
    apiKey,
    '/contacts/',
    { method: 'POST', body: JSON.stringify(payload) },
  )

  if (!created.ok) {
    return {
      contactId: null,
      duplicate: false,
      contactStatus: created.status,
      contactError: created.error,
    }
  }

  const contactId = created.body?.contact?.id ?? null
  const duplicate = created.body?.new === false

  // Optional: append note (e.g. quote_request signal)
  if (contactId && lead.noteBody) {
    await ghlRequest(apiKey, `/contacts/${contactId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ body: lead.noteBody }),
    })
  }

  return { contactId, duplicate, contactStatus: created.status }
}

/**
 * Look up a GHL contact by email. Returns the first match or null.
 * Used by /api/leads/update so we can attach a note (quote_request) to the
 * existing contact instead of creating a duplicate.
 */
export async function findGHLContactByEmail(email: string): Promise<{ id: string } | null> {
  const apiKey = process.env.GHL_API_KEY
  const locationId = process.env.GHL_LOCATION_ID
  if (!apiKey || !locationId || !email) return null
  const res = await ghlRequest<{ contact: { id: string } | null; contacts?: { id: string }[] }>(
    apiKey,
    `/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(email)}`,
  )
  if (!res.ok || !res.body) return null
  if (res.body.contact?.id) return { id: res.body.contact.id }
  if (res.body.contacts && res.body.contacts.length > 0) return { id: res.body.contacts[0].id }
  return null
}

/**
 * Append a free-form note to a GHL contact. Used by /api/leads/update when
 * the user clicks "demande soumission précise" from the pricing calculator.
 */
export async function appendGHLNote(contactId: string, body: string): Promise<boolean> {
  const apiKey = process.env.GHL_API_KEY
  if (!apiKey || !contactId) return false
  const res = await ghlRequest(apiKey, `/contacts/${contactId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
  return res.ok
}
