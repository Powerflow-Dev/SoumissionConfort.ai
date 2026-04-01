/**
 * Feature flags — toggle via environment variables.
 * Set NEXT_PUBLIC_OTP_ENABLED=true to enable phone OTP verification.
 */
export const OTP_ENABLED = process.env.NEXT_PUBLIC_OTP_ENABLED === 'true'
