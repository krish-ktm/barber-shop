import { get, put } from '../apiClient';

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
  return put<GSTRatesResponse>('/settings/gst-rates', { gstRates });
}; 