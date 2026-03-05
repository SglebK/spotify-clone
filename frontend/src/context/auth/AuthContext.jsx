// src/context/auth/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import api from "../../components/utils/api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // { id, email, timeZone }
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const newToken = res.data.token;

        setAccessToken(newToken);
        window.__accessToken = newToken;

        return api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${newToken}` }
        });
      })
      .then((res) => {
        // ⭐ ВАЖНО: сохраняем user.id
        setUser({
          id: res.data.id,
          email: res.data.email,
          timeZone: res.data.timeZone
        });
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  // ⭐ ЛОГИН
  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });

    const { token, refreshToken } = res.data;

    // сохраняем токены
    setAccessToken(token);
    window.__accessToken = token;
    localStorage.setItem("refreshToken", refreshToken);

    // получаем профиль
    const profile = await api.get("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    // ⭐ сохраняем user.id
    setUser({
      id: profile.data.id,
      email: profile.data.email,
      timeZone: profile.data.timeZone
    });
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
