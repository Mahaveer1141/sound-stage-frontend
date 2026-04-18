"use client";

import { getAccessToken } from "@/lib/api";
import { userApi } from "@/lib/api/endpoints/user";
import { UserType } from "@/lib/api/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";

interface AuthContextType {
  user: UserType | null;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      (async () => {
        const response = await userApi.currentUser();
        if (response.data) {
          setUser(response.data);
        }
      })();
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
