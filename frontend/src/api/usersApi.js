import api from "@api/axios";
export const getCurrentUser = async () => {
  const res = await api.get("/api/auth/me");
  return res.data;
};
