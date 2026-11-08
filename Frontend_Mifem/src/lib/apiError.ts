import axios from 'axios';

interface ApiErrorBody {
  message?: unknown;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (typeof message === 'string' && message.trim()) return message;
    if (status === 401) return 'Your session expired. Sign in again and retry.';
    if (status === 403) return 'Your account is not authorized to make this change.';
    if (status === 413) return 'The image is too large for the server to accept.';
    if (status === 502 || status === 503 || status === 504) {
      const isLocalDevelopment =
        typeof window !== 'undefined' &&
        ['localhost', '127.0.0.1'].includes(window.location.hostname);

      if (isLocalDevelopment) {
        return `The local frontend received HTTP ${status} because its backend is not responding at localhost:5000. Run "npm run dev" from the project root and use the Vite URL it prints; keep that terminal running.`;
      }

      return `The API gateway returned HTTP ${status}: the backend is unavailable. Configure VITE_API_BASE_URL with the public backend URL ending in /api, then check the backend host logs and DATABASE_URL.`;
    }
    if (status) return `The server rejected the request (HTTP ${status}).`;

    return `Cannot reach the API at ${error.config?.baseURL || '/api'}. Make sure the backend is running and the API URL is configured correctly.`;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
