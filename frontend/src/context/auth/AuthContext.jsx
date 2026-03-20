// src/context/auth/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import api from "../../components/utils/api/axios";
import { useError } from "../error/ErrorContext.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { showError } = useError();
  const [user, setUser] = useState(null);          // { id, email, timeZone }
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyAuthData = ({ token, refreshToken, user: nextUser }) => {
    if (token) {
      setAccessToken(token);
      window.__accessToken = token;
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    if (nextUser) {
      setUser({
        id: nextUser.id,
        email: nextUser.email,
        timeZone: nextUser.timeZone,
        isAdmin: !!nextUser.isAdmin
      });
    }
  };

  // ⭐ ЛОГАУТ
  const logout = async (navigate) => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        await api.post("/api/auth/logout", { refreshToken });
      } catch {
        // ignore logout errors
      }
    }

    localStorage.removeItem("refreshToken");
    window.__accessToken = null;
    setAccessToken(null);
    setUser(null);

    if (navigate) navigate("/");
  };

  // ⭐ ПРИ ЗАГРУЗКЕ ПРИЛОЖЕНИЯ
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setLoading(false);
      return;
    }

    // Пытаемся обновить access‑token
    api
      .post("/api/auth/refresh", { refreshToken })
      .then((res) => {
        applyAuthData(res.data);
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleTokenRefresh = (event) => {
      applyAuthData(event.detail || {});
    };

    const handleSessionExpired = () => {
      localStorage.removeItem("refreshToken");
      window.__accessToken = null;
      setAccessToken(null);
      setUser(null);
      showError("Сессия истекла. Войдите снова.");
    };

    window.addEventListener("auth:token-refreshed", handleTokenRefresh);
    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:token-refreshed", handleTokenRefresh);
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [showError]);

  // ⭐ ЛОГИН
  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    applyAuthData(res.data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        accessToken,
        setAccessToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
