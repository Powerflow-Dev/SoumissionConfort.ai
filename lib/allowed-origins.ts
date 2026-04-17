import type { NextRequest } from "next/server"

const ALLOWED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "soumissionconfort.com",
  "soumissionconfort.ai",
])

function extractHostname(headerValue: string | null): string | null {
  if (!headerValue) return null
  try {
    return new URL(headerValue).hostname
  } catch {
    return null
  }
}

export function isAllowedOrigin(request: NextRequest): boolean {
  const hostname =
    extractHostname(request.headers.get("origin")) ??
    extractHostname(request.headers.get("referer"))

  if (!hostname) return false

  if (ALLOWED_HOSTNAMES.has(hostname)) return true

  if (hostname.endsWith(".vercel.app")) return true

  return false
}
