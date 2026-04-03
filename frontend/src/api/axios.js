import axios from "axios";
import { API_URL } from "@api/config";
window.__accessToken = localStorage.getItem("accessToken") || null;
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false
});
api.interceptors.request.use((config) => {
  const token = window.__accessToken;
  if (token && token !== "null" && token.trim() !== "") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (original?.url?.includes("/api/auth/refresh")) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return Promise.reject(error);
      try {
        const res = await api.post("/api/auth/refresh", { refreshToken });
        const newToken = res.data.token;
        const newRefreshToken = res.data.refreshToken;
        window.__accessToken = newToken;
        localStorage.setItem("accessToken", newToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }
        window.dispatchEvent(
          new CustomEvent("auth:token-refreshed", {
            detail: {
              token: newToken,
              refreshToken: newRefreshToken,
              user: res.data.user || null
            }
          })
        );
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("accessToken");
        window.__accessToken = null;
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
export default api;
