import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "@api/axios";
import { useError } from "@context/ErrorContext.jsx";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const { showError } = useError();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLoggingOut = useRef(false);
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
  const logout = async (navigate) => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await api.post("/api/auth/logout", { refreshToken });
      }
    } catch {}
    localStorage.removeItem("refreshToken");
    window.__accessToken = null;
    setUser(null);
    setAccessToken(null);
    if (navigate) navigate("/");
    setTimeout(() => {
      isLoggingOut.current = false;
    }, 0);
  };
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setLoading(false);
      return;
    }
    api
      .post("/api/auth/refresh", { refreshToken })
      .then((res) => {
        applyAuthData(res.data);
      })
      .catch(() => {
        setTimeout(() => logout(), 0);
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
