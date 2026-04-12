import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { ReactNode } from 'react';
import { setTokenResolver } from '../services/apiClient';
import * as authService from '../services/authService';
import {
  AuthenticatedUser,
  LoginPayload,
  RegisterPayload
} from '../types/auth';
import { clearToken, persistToken, readToken } from '../lib/storage';
import { decodeJwt } from '../lib/jwt';

interface AuthContextValue {
  token: string | null;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearResolver = () => {
    setTokenResolver(() => null);
  };

  useEffect(() => {
    const storedToken = readToken();
    if (storedToken) {
      setSession(storedToken);
    } else {
      clearResolver();
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setTokenResolver(() => token);
  }, [token]);

  const setSession = (jwt: string, fallbackUsername?: string) => {
    persistToken(jwt);
    setToken(jwt);

    const payload = decodeJwt(jwt);
    const username = payload?.sub ?? fallbackUsername;

    if (username) {
      setUser({ username });
    } else {
      setUser(null);
    }
  };

  const loginHandler = async (payload: LoginPayload) => {
    const { token: jwt } = await authService.login(payload);
    setSession(jwt, payload.username);
  };

  const registerHandler = async (payload: RegisterPayload) => {
    const { token: jwt } = await authService.register(payload);
    setSession(jwt, payload.username);
  };

  const logoutHandler = () => {
    clearToken();
    setToken(null);
    setUser(null);
    clearResolver();
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isLoading,
      login: loginHandler,
      register: registerHandler,
      logout: logoutHandler
    }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

