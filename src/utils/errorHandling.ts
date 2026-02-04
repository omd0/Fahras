interface FetchLikeError {
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

export function isApiError(error: unknown): error is FetchLikeError {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export function getErrorStatus(error: unknown): number | undefined {
  if (isApiError(error)) {
    return error.response?.status;
  }
  return undefined;
}

export function getValidationErrors(error: unknown): Record<string, string[]> | undefined {
  if (isApiError(error) && error.response?.status === 422) {
    return error.response.data?.errors;
  }
  return undefined;
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage: string = 'An unexpected error occurred',
): string {
  if (isApiError(error)) {
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

export function getErrorResponseData(error: unknown): Record<string, unknown> | undefined {
  if (isApiError(error)) {
    return error.response?.data as Record<string, unknown> | undefined;
  }
  return undefined;
}
