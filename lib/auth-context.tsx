"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User, UserRole } from "./types";
import { getRecaptchaToken } from "@/lib/recaptcha-client";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function readError(res: Response) {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? "Algo deu errado.";
  } catch {
    return "Algo deu errado.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as { user: User | null };
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const captchaToken = await getRecaptchaToken("login");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, captchaToken }),
    });

    if (!res.ok) {
      throw new Error(await readError(res));
    }

    const data = (await res.json()) as { user: User };
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      phone?: string;
    }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        throw new Error(await readError(res));
      }

      const data = (await res.json()) as { user: User };
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, refresh, setUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}

export function postLoginPath(user: User) {
  if (user.role === "acompanhante") {
    return "/conta";
  }
  return "/";
}
