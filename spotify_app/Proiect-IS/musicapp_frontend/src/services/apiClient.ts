import { appConfig } from '../lib/config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

type TokenResolver = () => string | null;

let tokenResolver: TokenResolver = () => null;

export const setTokenResolver = (resolver: TokenResolver): void => {
  tokenResolver = resolver;
};

const request = async <T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> => {
  const url = `${appConfig.apiBaseUrl}${path}`;
  const headers = new Headers({
    'Content-Type': 'application/json'
  });

  if (options.headers) {
    const customHeaders = new Headers(options.headers);
    customHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (options.auth) {
    const token = tokenResolver();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
};

const extractErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json();
    return payload.message || payload.error || 'Unexpected error';
  } catch {
    return response.statusText || 'Unexpected error';
  }
};

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options)
};

