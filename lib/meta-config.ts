import { initializeMetaConversionAPI } from './meta-conversion-api';

// Meta Conversion API configuration
export const META_CONFIG = {
  PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  ACCESS_TOKEN: process.env.META_CONVERSION_ACCESS_TOKEN || '',
  TEST_EVENT_CODE: process.env.META_TEST_EVENT_CODE || undefined,
};

// Initialize Meta Conversion API on app startup
export function initializeMeta() {
  if (META_CONFIG.PIXEL_ID && META_CONFIG.ACCESS_TOKEN) {
    return initializeMetaConversionAPI(
      META_CONFIG.PIXEL_ID,
      META_CONFIG.ACCESS_TOKEN,
      META_CONFIG.TEST_EVENT_CODE
    );
  } else {
    console.warn('Meta Conversion API not configured. Please set NEXT_PUBLIC_META_PIXEL_ID and META_CONVERSION_ACCESS_TOKEN environment variables.');
    return null;
  }
}

// Check if Meta Conversion API is properly configured
export function isMetaConfigured(): boolean {
  return !!(META_CONFIG.PIXEL_ID && META_CONFIG.ACCESS_TOKEN);
}
