import { createContext, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
    isAuthenticated: boolean;
    role: string | null;
    login: (token: string) => void;
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

    function login(token: string) {
        const decoded = jwtDecode<JwtPayload>(token);

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("role", decoded.role);

        setRole(decoded.role);
        setIsAuthenticated(true);
    }

    function logout() {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");

        setRole(null);
        setIsAuthenticated(false);
    }

    return (
      <AuthContext.Provider
        value={{
          isAuthenticated,
          role,
          login,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };