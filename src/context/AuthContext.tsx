import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/api";
import { tokenStorage } from "../services/api";
import { authService } from "../services/authService";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (token: string,
        user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
    children: ReactNode
}
function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    function login(token: string, newUser: User) {
        tokenStorage.set(token);
        setUser(newUser);
    }
    function logout() {
        tokenStorage.clear();
        setUser(null)
    }
    useEffect(() => {
  async function checkToken() {
    const token = tokenStorage.get();

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await authService.me();
      setUser(data.user);
    } catch {
      tokenStorage.clear()
    } finally {
      setIsLoading(false);
    }
  }

  checkToken();
}, []);
    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}