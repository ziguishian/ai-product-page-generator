export interface ApiErrorShape {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponseShape<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorShape | null;
}

export function apiSuccess<T>(data: T): ApiResponseShape<T> {
  return {
    success: true,
    data,
    error: null,
  };
}

export function apiError(code: string, message: string, details?: unknown): ApiResponseShape<null> {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      details,
    },
  };
}
