interface MetaConversionEvent {
  event_name: string;
  event_time: number;
  action_source: string;
  user_data?: {
    em?: string; // email (hashed)
    ph?: string; // phone (hashed)
    fn?: string; // first name (hashed)
    ln?: string; // last name (hashed)
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
  };
  custom_data?: {
    content_type?: string;
    content_name?: string;
    value?: number;
    currency?: string;
    search_string?: string;
    [key: string]: any;
  };
  event_source_url?: string;
}

interface MetaConversionPayload {
  data: MetaConversionEvent[];
  test_event_code?: string;
}

// Hash function for PII data (required by Meta)
async function hashData(data: string): Promise<string> {
  const normalizedData = data.toLowerCase().trim();
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Client-side hashing
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(normalizedData);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Server-side hashing - use Node.js crypto
  try {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(normalizedData).digest('hex');
  } catch (error) {
    console.error('Failed to hash data:', error);
    throw new Error('Hashing failed');
  }
}

// Get client information for tracking
function getClientInfo() {
  if (typeof window === 'undefined') {
    return {};
  }
  
  return {
    client_ip_address: '', // Will be filled by server
    client_user_agent: navigator.userAgent,
    event_source_url: window.location.href,
    fbc: getCookie('_fbc'),
    fbp: getCookie('_fbp')
  };
}

// Helper to get cookie value
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
}

// Meta Conversion API service
export class MetaConversionAPI {
  private pixelId: string;
  private accessToken: string;
  private testEventCode?: string;

  constructor(pixelId: string, accessToken: string, testEventCode?: string) {
    this.pixelId = pixelId;
    this.accessToken = accessToken;
    this.testEventCode = testEventCode;
  }

  // Track ViewContent event (when user enters website)
  async trackViewContent(contentName?: string, contentType?: string) {
    const event: MetaConversionEvent = {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: {
        ...getClientInfo()
      },
      custom_data: {
        content_type: contentType || 'website',
        content_name: contentName || 'Homepage',
        currency: 'CAD'
      },
      event_source_url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    return this.sendEvent(event);
  }

  // Track FindLocation event (when user searches with address)
  async trackFindLocation(searchString: string, userEmail?: string) {
    const userData: any = {
      ...getClientInfo()
    };

    if (userEmail) {
      userData.em = await hashData(userEmail);
    }

    const event: MetaConversionEvent = {
      event_name: 'Search',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: userData,
      custom_data: {
        content_type: 'location_search',
        search_string: searchString,
        currency: 'CAD'
      },
      event_source_url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    return this.sendEvent(event);
  }

  // Track Lead event (when user submits contact form)
  async trackLead(leadData: {
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    value?: number;
    clientIp?: string;
    userAgent?: string;
    sourceUrl?: string;
  }) {
    try {
      const userData: any = {
        em: await hashData(leadData.email)
      };

      if (leadData.phone) {
        userData.ph = await hashData(leadData.phone);
      }
      if (leadData.firstName) {
        userData.fn = await hashData(leadData.firstName);
      }
      if (leadData.lastName) {
        userData.ln = await hashData(leadData.lastName);
      }
      
      // Add server-side client information
      if (leadData.clientIp) {
        userData.client_ip_address = leadData.clientIp;
      }
      if (leadData.userAgent) {
        userData.client_user_agent = leadData.userAgent;
      }

      const event: MetaConversionEvent = {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: userData,
        custom_data: {
          content_type: 'lead_form',
          content_name: 'Roof Quote Request',
          value: leadData.value || 0,
          currency: 'CAD'
        },
        event_source_url: leadData.sourceUrl || (typeof window !== 'undefined' ? window.location.href : undefined)
      };

      return this.sendEvent(event);
    } catch (error) {
      console.error('Error in trackLead:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send event to Meta Conversion API
  private async sendEvent(event: MetaConversionEvent) {
    try {
      const payload: MetaConversionPayload = {
        data: [event]
      };

      if (this.testEventCode) {
        payload.test_event_code = this.testEventCode;
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/${this.pixelId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Meta Conversion API error:', result);
        return { success: false, error: result };
      }

      console.log('Meta Conversion API event sent successfully:', event.event_name);
      return { success: true, data: result };
    } catch (error) {
      console.error('Meta Conversion API request failed:', error);
      return { success: false, error };
    }
  }
}

// Singleton instance
let metaAPI: MetaConversionAPI | null = null;

// Initialize Meta Conversion API
export function initializeMetaConversionAPI(
  pixelId: string, 
  accessToken: string, 
  testEventCode?: string
): MetaConversionAPI {
  metaAPI = new MetaConversionAPI(pixelId, accessToken, testEventCode);
  return metaAPI;
}

// Get Meta Conversion API instance
export function getMetaConversionAPI(): MetaConversionAPI | null {
  return metaAPI;
}

// Convenience functions for tracking events
export async function trackViewContent(contentName?: string, contentType?: string) {
  if (metaAPI) {
    return await metaAPI.trackViewContent(contentName, contentType);
  }
  console.warn('Meta Conversion API not initialized');
  return { success: false, error: 'API not initialized' };
}

export async function trackFindLocation(searchString: string, userEmail?: string) {
  if (metaAPI) {
    return await metaAPI.trackFindLocation(searchString, userEmail);
  }
  console.warn('Meta Conversion API not initialized');
  return { success: false, error: 'API not initialized' };
}

export async function trackLead(leadData: {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  value?: number;
  clientIp?: string;
  userAgent?: string;
  sourceUrl?: string;
}) {
  if (metaAPI) {
    return await metaAPI.trackLead(leadData);
  }
  console.warn('Meta Conversion API not initialized');
  return { success: false, error: 'API not initialized' };
}
