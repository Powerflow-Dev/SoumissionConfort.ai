// Meta Pixel helper for client-side tracking
// Pixel ID: 1508005413751111

/**
 * Track a standard Meta Pixel event
 */
export function trackMetaPixelEvent(
  eventName: 'PageView' | 'ViewContent' | 'Search' | 'AddToCart' | 'InitiateCheckout' | 'Lead' | 'Purchase',
  params?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
    console.log(`📊 Meta Pixel: ${eventName} tracked`, params);
  } else {
    console.warn('Meta Pixel not loaded');
  }
}

/**
 * Track a custom Meta Pixel event
 */
export function trackMetaPixelCustomEvent(
  eventName: string,
  params?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
    console.log(`📊 Meta Pixel Custom: ${eventName} tracked`, params);
  } else {
    console.warn('Meta Pixel not loaded');
  }
}

/**
 * Track Purchase event with proper format
 */
export function trackPurchase(params: {
  value: number | string;
  currency?: string;
  content_name?: string;
  content_type?: string;
  content_ids?: string[];
  num_items?: number;
}) {
  trackMetaPixelEvent('Purchase', {
    value: typeof params.value === 'string' ? params.value : params.value.toString(),
    currency: params.currency || 'CAD',
    content_name: params.content_name,
    content_type: params.content_type,
    content_ids: params.content_ids,
    num_items: params.num_items
  });
}

/**
 * Track Lead event
 */
export function trackLead(params?: {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
}) {
  trackMetaPixelEvent('Lead', {
    value: params?.value,
    currency: params?.currency || 'CAD',
    content_name: params?.content_name,
    content_category: params?.content_category
  });
}

/**
 * Track ViewContent event
 */
export function trackViewContent(params?: {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
}) {
  trackMetaPixelEvent('ViewContent', params);
}

/**
 * Track Search event
 */
export function trackSearch(params: {
  search_string: string;
  content_category?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
}) {
  trackMetaPixelEvent('Search', params);
}

/**
 * Track InitiateCheckout event
 */
export function trackInitiateCheckout(params?: {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  num_items?: number;
}) {
  trackMetaPixelEvent('InitiateCheckout', {
    value: params?.value,
    currency: params?.currency || 'CAD',
    content_name: params?.content_name,
    content_category: params?.content_category,
    content_ids: params?.content_ids,
    num_items: params?.num_items
  });
}

/**
 * Check if Meta Pixel is loaded
 */
export function isMetaPixelLoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}
