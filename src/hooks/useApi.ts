import { useState, useCallback } from 'react';

/**
 * Custom hook for handling API calls with loading and error states
 */
export function useApi<T, P extends any[]>(
  apiFunction: (...args: P) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(errorObject);
        throw errorObject;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return {
    data,
    loading,
    error,
    execute
  };
}

/**
 * Example usage:
 * 
 * const {
 *   data: staffData,
 *   loading: staffLoading,
 *   error: staffError,
 *   execute: fetchStaff
 * } = useApi(getAllStaff);
 * 
 * useEffect(() => {
 *   fetchStaff();
 * }, [fetchStaff]);
 */ 