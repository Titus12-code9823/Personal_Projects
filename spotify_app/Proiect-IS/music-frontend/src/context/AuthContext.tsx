import {
  createContext,
  useContext,
  useState,
} from "react";
import type { ReactNode } from "react";
import { login as loginApi, register as registerApi } from "../services/authService";
import type { LoginRequest, RegisterRequest } from "../services/authService";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  // Check if token exists to determine auth status
  const isAuthenticated = !!token;

  const login = async (data: LoginRequest) => {
    try {
      const response = await loginApi(data);
      // Save to storage AND state
      localStorage.setItem("token", response.token);
      setToken(response.token);
    } catch (error) {
      console.error("Login failed", error);
      throw error; // Let the Login component handle the error UI
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await registerApi(data);
      // Save to storage AND state
      localStorage.setItem("token", response.token);
      setToken(response.token);
    } catch (error) {
      console.error("Register failed", error);
      throw error; // Let the Register component handle the error UI
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
