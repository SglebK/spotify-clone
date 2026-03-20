// src/components/utils/api/axios.js
import axios from "axios";
import { API_URL } from "./config";

// Глобальная переменная для access‑token
// AuthContext будет её обновлять
window.__accessToken = null;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false
});

// ⬆️ REQUEST INTERCEPTOR — подставляем access‑token
api.interceptors.request.use((config) => {
  if (window.__accessToken) {
    config.headers.Authorization = `Bearer ${window.__accessToken}`;
  }
  return config;
});

// ⬇️ RESPONSE INTERCEPTOR — ловим 401 и обновляем токен
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (original?.url?.includes("/api/auth/refresh")) {
      return Promise.reject(error);
    }

    // Если 401 и запрос ещё не повторяли
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return Promise.reject(error);

      try {
        // Запрашиваем новый access‑token
        const res = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken
        });

        const newToken = res.data.token;
        const newRefreshToken = res.data.refreshToken;

        // Обновляем глобальный токен
        window.__accessToken = newToken;
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }
        window.dispatchEvent(new CustomEvent("auth:token-refreshed", {
          detail: {
            token: newToken,
            refreshToken: newRefreshToken,
            user: res.data.user || null
          }
        }));

        // Повторяем оригинальный запрос
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        localStorage.removeItem("refreshToken");
        window.__accessToken = null;
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
