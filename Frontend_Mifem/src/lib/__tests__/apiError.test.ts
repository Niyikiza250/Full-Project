import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from '../apiError';

describe('getApiErrorMessage', () => {
  it('uses the API response message when available', () => {
    const error = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { status: 403, data: { message: 'Role not authorized' } },
    });

    expect(getApiErrorMessage(error, 'Fallback')).toBe('Role not authorized');
  });

  it('explains when the API cannot be reached', () => {
    const error = Object.assign(new Error('Network Error'), {
      isAxiosError: true,
      config: { baseURL: 'https://api.example.test/api' },
    });

    expect(getApiErrorMessage(error, 'Fallback')).toContain(
      'https://api.example.test/api',
    );
    expect(getApiErrorMessage(error, 'Fallback')).toContain('backend is running');
  });

  it('reports the request size limit clearly', () => {
    const error = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { status: 413, data: {} },
    });

    expect(getApiErrorMessage(error, 'Fallback')).toBe(
      'The image is too large for the server to accept.',
    );
  });

  it('explains that a local gateway error means the backend is not running', () => {
    const error = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { status: 502, data: {} },
    });

    expect(getApiErrorMessage(error, 'Fallback')).toContain(
      'backend is not responding at localhost:5000',
    );
    expect(getApiErrorMessage(error, 'Fallback')).toContain('npm run dev');
  });
});
