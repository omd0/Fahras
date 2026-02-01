interface AxiosLikeError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
      error?: string;
    };
  };
  message?: string;
}

/** Type guard — narrows `unknown` to an Axios-shaped error with `.response`. */
export function isAxiosError(error: unknown): error is AxiosLikeError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}

export function getErrorStatus(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

export function getValidationErrors(error: unknown): Record<string, string[]> | undefined {
  if (isAxiosError(error) && error.response?.status === 422) {
    return error.response.data?.errors;
  }
  return undefined;
}

export function getErrorMessage(error: unknown, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors).flat().join(', ');
      if (messages) return messages;
    }
    if (data?.error) return data.error;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return fallbackMessage;
}

/** Extract the response data from an Axios-like error, if present. */
export function getErrorResponseData(error: unknown): Record<string, unknown> | undefined {
  if (isAxiosError(error)) {
    return error.response?.data as Record<string, unknown> | undefined;
  }
  return undefined;
}

export function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
    if (isAxiosError(error) && error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
  }
}
