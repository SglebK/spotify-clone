const queryUrl = new URLSearchParams(window.location.search).get("api")?.trim();
const envUrl = import.meta.env.VITE_API_URL?.trim();
const storedUrl = localStorage.getItem("externalApiUrl")?.trim();
const host = window.location.hostname;
const isLocalHost =
  host === "localhost" || host === "127.0.0.1" || host === "::1";

const autoUrl = isLocalHost ? "http://localhost:5000" : window.location.origin;

if (queryUrl) {
  localStorage.setItem("externalApiUrl", queryUrl);
}

export const API_URL = (queryUrl || envUrl || storedUrl || autoUrl).replace(/\/+$/, "");
