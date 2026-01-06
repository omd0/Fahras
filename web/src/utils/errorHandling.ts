/**
 * Utility functions for error handling and user-friendly error messages
 */

/**
 * Extracts a user-friendly error message from an Error object or Axios error
 * @param error - The error object (can be Error, AxiosError, or any)
 * @param fallbackMessage - Default message if no specific error message is found
 * @returns A user-friendly error message string
 */
export function getErrorMessage(error: any, fallbackMessage: string = 'An unexpected error occurred'): string {
  // Check for Axios error response (most common in this app)
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Check for validation errors array (Laravel-style errors)
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (typeof errors === 'object') {
      // Flatten all error messages into a single string
      const messages = Object.values(errors).flat().join(', ');
      if (messages) return messages;
    }
  }
  
  // Check for generic error field
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Check for standard Error object message
  if (error?.message) {
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
export function logError(context: string, error: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
    if (error?.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
  }
}
