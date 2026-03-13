const envUrl = import.meta.env.VITE_API_URL?.trim();
const host = window.location.hostname;
const isLocalHost =
  host === "localhost" || host === "127.0.0.1" || host === "::1";

const autoUrl = isLocalHost ? "http://localhost:5000" : window.location.origin;

export const API_URL = (envUrl || autoUrl).replace(/\/+$/, "");
