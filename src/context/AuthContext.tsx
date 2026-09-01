import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import type { CurrentUser } from "../types/currentUser";
import apiFetch from "../api/apiFetch";

type AuthContextType = {
  isAuthenticated: boolean;
  role: string | null;
  user: CurrentUser | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

type JwtPayload = {
  userId: number;
  role: string;
  iat: number;
  exp: number;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {

    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('token'));
    const [role, setRole] = useState<string | null>(
      sessionStorage.getItem("role")
    );
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadCurrentUser() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setUser(null);
        return;
      }
    
      try {
        const response = await apiFetch("/api/me");
      
        if (!response.ok) {
          setUser(null);
          return;
        }
      
        const data: CurrentUser = await response.json();
      
        setUser(data);
        setRole(data.role);
      } catch (error) {
        console.error(error);
        setUser(null);
      }
    }

    useEffect(() => {
      const initializeAuth = async () => {
        await loadCurrentUser();
        setLoading(false);
      };
    
      initializeAuth();
    }, []);

    async function login(token: string) {
      const decoded = jwtDecode<JwtPayload>(token);

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", decoded.role);

      setRole(decoded.role);
      setIsAuthenticated(true);

      await loadCurrentUser();
    }

    function logout() {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");

      setRole(null);
      setUser(null);
      setIsAuthenticated(false);
    }

    return (
      <AuthContext.Provider
        value={{
          isAuthenticated,
          role,
          user,
          loading,
          login,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };