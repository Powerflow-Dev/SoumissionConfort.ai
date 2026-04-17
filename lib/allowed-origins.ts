import type { NextRequest } from "next/server"

const ALLOWED_HOSTNAMES_PROD = new Set([
  "soumissionconfort.com",
  "soumissionconfort.ai",
  "soumission-confort-ai.vercel.app",
])

const ALLOWED_HOSTNAMES_DEV = new Set([
  "localhost",
  "127.0.0.1",
])

function normalizeHostname(raw: string): string {
  return raw.toLowerCase().replace(/\.$/, "")
}

function extractHostname(headerValue: string | null): string | null {
  if (!headerValue) return null
  try {
    return normalizeHostname(new URL(headerValue).hostname)
  } catch {
    return null
  }
}

export function isAllowedOrigin(request: NextRequest): boolean {
  const hostname =
    extractHostname(request.headers.get("origin")) ??
    extractHostname(request.headers.get("referer"))

  if (!hostname) return false

  if (ALLOWED_HOSTNAMES_PROD.has(hostname)) return true

  if (
    process.env.NODE_ENV !== "production" &&
    ALLOWED_HOSTNAMES_DEV.has(hostname)
  ) {
    return true
  }

  return false
}
