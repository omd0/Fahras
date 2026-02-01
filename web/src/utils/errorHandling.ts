/**
 * Utility functions for error handling and user-friendly error messages
 */

/**
 * Extracts a user-friendly error message from an Error object or Axios error
 * @param error - The error object (can be Error, AxiosError, or any)
 * @param fallbackMessage - Default message if no specific error message is found
 * @returns A user-friendly error message string
 */
export function getErrorMessage(error: unknown, fallbackMessage: string = 'An unexpected error occurred'): string {
  // Type guard for objects with response property (Axios-like errors)
  const err = error as Record<string, unknown> | null | undefined;
  const response = err && typeof err === 'object' ? (err as { response?: { data?: { message?: string; errors?: Record<string, string[]>; error?: string } } }).response : undefined;
  
  // Check for Axios error response (most common in this app)
  if (response?.data?.message) {
    return response.data.message;
  }
  
  // Check for validation errors array (Laravel-style errors)
  if (response?.data?.errors) {
    const errors = response.data.errors;
    if (typeof errors === 'object') {
      // Flatten all error messages into a single string
      const messages = Object.values(errors).flat().join(', ');
      if (messages) return messages;
    }
  }
  
  // Check for generic error field
  if (response?.data?.error) {
    return response.data.error;
  }
  
  // Check for standard Error object message
  if (error instanceof Error) {
    return error.message;
  }
  
  // If error is a string, return it
  if (typeof error === 'string') {
    return error;
  }
  
  // Return fallback message
  return fallbackMessage;
}

/**
 * Logs error to console in development mode only
 * @param context - Context/location where error occurred
 * @param error - The error object
 */
export function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
    const axiosErr = error as { response?: { data?: unknown; status?: number } } | undefined;
    if (axiosErr?.response) {
      console.error('Error response:', axiosErr.response.data);
      console.error('Error status:', axiosErr.response.status);
    }
  }
}
