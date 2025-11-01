/**
 * Utility functions for handling UTM parameters
 */

export interface UTMParameters {
  utm_source?: string
  utm_campaign?: string
  utm_content?: string
  utm_medium?: string
  utm_term?: string
}

/**
 * Extract UTM parameters from URL search params or current window location
 */
export function extractUTMParameters(searchParams?: URLSearchParams): UTMParameters {
  let params: URLSearchParams
  
  if (searchParams) {
    params = searchParams
  } else if (typeof window !== 'undefined') {
    params = new URLSearchParams(window.location.search)
  } else {
    return {}
  }

  const utmParams: UTMParameters = {}
  
  // Extract all UTM parameters
  const utmKeys = ['utm_source', 'utm_campaign', 'utm_content', 'utm_medium', 'utm_term']
  
  utmKeys.forEach(key => {
    const value = params.get(key)
    if (value) {
      utmParams[key as keyof UTMParameters] = value
    }
  })

  return utmParams
}

/**
 * Store UTM parameters in sessionStorage for persistence across page navigation
 */
export function storeUTMParameters(utmParams: UTMParameters): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('utm_parameters', JSON.stringify(utmParams))
    } catch (error) {
      console.warn('Failed to store UTM parameters:', error)
    }
  }
}

/**
 * Retrieve UTM parameters from sessionStorage
 */
export function getStoredUTMParameters(): UTMParameters {
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('utm_parameters')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn('Failed to retrieve UTM parameters:', error)
      return {}
    }
  }
  return {}
}

/**
 * Get UTM parameters from current URL or sessionStorage
 */
export function getCurrentUTMParameters(): UTMParameters {
  // First try to get from current URL
  const currentParams = extractUTMParameters()
  
  // If we found UTM params in URL, store them and return
  if (Object.keys(currentParams).length > 0) {
    storeUTMParameters(currentParams)
    return currentParams
  }
  
  // Otherwise, try to get from stored parameters
  return getStoredUTMParameters()
}
