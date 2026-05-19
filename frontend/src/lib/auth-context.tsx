"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";

export type Role = "admin" | "client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  company?: string;
  phone?: string;
  services?: string[];
  active?: boolean;
  avatar_url?: string;
  created_at?: string;
}

interface AuthContextValue {
  user: User | null | undefined; // undefined = loading
  error: string;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string): Promise<User> => {
    setError("");
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
      if (data.token && typeof window !== "undefined") {
        localStorage.setItem("rebild_token", data.token);
      }
      setUser(data.user);
      return data.user;
    } catch (e) {
      const msg = formatApiError(e);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") localStorage.removeItem("rebild_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, error, login, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
