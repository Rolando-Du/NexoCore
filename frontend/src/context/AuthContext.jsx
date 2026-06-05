import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [userSession, setUserSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async ({ email, password, tenantId }) => {
    const response = await api.post("/auth/login", {
      email,
      password,
      tenantId,
    });

    const { token, user, tenant, role, permissions } = response.data.data;

    localStorage.setItem("nexocore_token", token);

    const session = {
      user,
      tenant,
      role,
      permissions,
      token,
    };

    setUserSession(session);

    return session;
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const token = localStorage.getItem("nexocore_token");

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get("/auth/me");

      setUserSession({
        ...response.data.data,
        token,
      });
    } catch {
      localStorage.removeItem("nexocore_token");
      setUserSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("nexocore_token");
    setUserSession(null);
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadSession();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadSession]);

  const value = useMemo(() => {
    return {
      userSession,
      loading,
      login,
      logout,
      isAuthenticated: Boolean(userSession),
    };
  }, [userSession, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};