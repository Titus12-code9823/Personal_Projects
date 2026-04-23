const TOKEN_KEY = 'musicapp_token';

const isBrowser = typeof window !== 'undefined';

export const readToken = (): string | null => {
  if (!isBrowser) {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
};

export const persistToken = (token: string): void => {
  if (!isBrowser) {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  if (!isBrowser) {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
};

