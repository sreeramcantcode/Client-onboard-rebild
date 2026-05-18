import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { formatApiError } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(undefined); // undefined = loading
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
            return data;
        } catch (e) {
            setUser(null);
            return null;
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = async (email, password) => {
        setError("");
        try {
            const { data } = await api.post("/auth/login", { email, password });
            if (data?.token) {
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
        } catch (e) {
            // ignore
        }
        localStorage.removeItem("rebild_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, error, login, logout, refresh, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
