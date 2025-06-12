import { get, put, del } from '../apiClient';

// Type definitions
export interface BusinessSettings {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  slot_duration: number;
  tax_rate: number;
  allow_discounts: boolean;
  allow_tips: boolean;
  default_commission: number;
  updated_at?: string;
}

export interface GSTComponent {
  id?: string;
  name: string;
  rate: number;
}

export interface GSTRate {
  id?: string;
  name: string;
  is_active: boolean;
  total_rate?: number;
  components: GSTComponent[];
  created_at?: string;
  updated_at?: string;
}

// Response interfaces
interface SettingsResponse {
  success: boolean;
  settings: BusinessSettings;
}

interface GSTRatesResponse {
  success: boolean;
  gstRates: GSTRate[];
}

/**
 * Get business settings
 */
export const getBusinessSettings = async (): Promise<SettingsResponse> => {
  return get<SettingsResponse>('/settings');
};

/**
 * Update business settings
 */
export const updateBusinessSettings = async (
  settingsData: Partial<BusinessSettings>
): Promise<SettingsResponse> => {
  return put<SettingsResponse>('/settings', settingsData);
};

/**
 * Get GST rates configuration
 */
export const getGSTRates = async (): Promise<GSTRatesResponse> => {
  return get<GSTRatesResponse>('/settings/gst-rates');
};

/**
 * Update GST rates configuration
 */
export const updateGSTRates = async (
  gstRates: GSTRate[]
): Promise<GSTRatesResponse> => {
  // Ensure we're not sending null or undefined values to the API
  const sanitizedRates = gstRates.map(rate => {
    // Filter out temporary/undefined IDs
    const { id, ...rateWithoutId } = rate;
    
    // Only include ID if it's a valid server ID (not temp or undefined)
    const rateData: GSTRate = id && !id.startsWith('temp-') 
      ? { id, ...rateWithoutId } 
      : { ...rateWithoutId, id: undefined };
    
    // Sanitize components
    const sanitizedComponents = (rate.components || []).map(comp => {
      const { id: compId, ...compWithoutId } = comp;
      
      // Only include component ID if it's valid
      return compId && !compId.startsWith('temp-')
        ? { id: compId, ...compWithoutId }
        : { ...compWithoutId, id: undefined };
    });
    
    return {
      ...rateData,
      components: sanitizedComponents
    };
  });
  
  // If sending an empty array, log it clearly
  if (sanitizedRates.length === 0) {
    console.log('IMPORTANT: Sending empty GST rates array - this will delete ALL rates');
  } else {
    console.log('Sanitized rates before API call:', JSON.stringify(sanitizedRates));
  }
  
  try {
    // When updating/deleting, we need to include the ID property 
    // even if undefined to ensure proper handling by the backend
    const response = await put<GSTRatesResponse>('/settings/gst-rates', { 
      gstRates: sanitizedRates 
    });
    
    // Verify the response contains the expected data structure
    if (!response.gstRates) {
      console.error('API response missing gstRates array:', response);
      throw new Error('Invalid API response format');
    }
    
    return response;
  } catch (error) {
    console.error('API error in updateGSTRates:', error);
    throw error;
  }
};

/**
 * Delete a specific GST rate
 */
export const deleteGSTRate = async (id: string): Promise<{ success: boolean; message: string }> => {
  if (!id) {
    throw new Error('GST rate ID is required');
  }
  
  console.log(`Deleting GST rate with ID: ${id}`);
  
  try {
    return await del<{ success: boolean; message: string }>(`/settings/gst-rates/${id}`);
  } catch (error) {
    console.error('API error in deleteGSTRate:', error);
    throw error;
  }
}; 