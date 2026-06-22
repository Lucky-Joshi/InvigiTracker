'use client';

import { useState, useCallback } from 'react';

interface UseMutationOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useMutation<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options?: UseMutationOptions
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (...args: T) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fn(...args);
        options?.onSuccess?.();
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fn, options]
  );

  return { mutate, isLoading, error };
}
