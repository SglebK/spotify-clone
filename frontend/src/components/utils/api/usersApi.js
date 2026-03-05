// src/components/utils/api/userApi.js
import { API_URL } from "./config";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json"
});

export const getCurrentUser = async (token) => {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: authHeaders(token)
  });

  if (!res.ok) {
    throw new Error(`Ошибка загрузки профиля: ${res.status}`);
  }

  return res.json();
};
