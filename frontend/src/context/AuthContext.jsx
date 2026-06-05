import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userSession, setUserSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async ({ email, password, tenantId }) => {
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
  };

  const loadSession = async () => {
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
    } catch (error) {
      localStorage.removeItem("nexocore_token");
      setUserSession(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("nexocore_token");
    setUserSession(null);
  };

  useEffect(() => {
    loadSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userSession,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(userSession),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};