import { createContext, useState, type ReactNode } from "react";

type AuthContextType = {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {

    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('token'));

    function login(token: string) {
        sessionStorage.setItem("token", token);
        setIsAuthenticated(true);
    }

    function logout() {
        sessionStorage.removeItem("token");
        setIsAuthenticated(false);
    }

    return (
      <AuthContext.Provider
        value={{
          isAuthenticated,
          login,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };