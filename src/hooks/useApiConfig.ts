import { useState, useEffect } from 'react';

// Default API base URL (can be overridden with environment variables)
const DEFAULT_API_URL = 'https://barber-shop-api-eight.vercel.app/api';

/**
 * Hook to manage API configuration
 * This can be extended with more configuration options as needed
 */
export function useApiConfig() {
  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    // Try to get the API URL from environment variables or use default
    return import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL;
  });

  // Monitor for any environment changes (unlikely in production, but useful in development)
  useEffect(() => {
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;
    if (envApiUrl && envApiUrl !== apiBaseUrl) {
      setApiBaseUrl(envApiUrl);
    }
  }, [apiBaseUrl]);

  return { 
    apiBaseUrl,
    setApiBaseUrl
  };
}

/**
 * Helper function to get the current API base URL
 * Useful for places where you don't want to use the hook
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL;
} 