function normalizeUrl(value) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  try {
    return new URL(trimmed).toString().replace(/\/+$/, "");
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

function getStoredUrl() {
  try {
    return normalizeUrl(window.localStorage.getItem("externalApiUrl"));
  } catch {
    return "";
  }
}

function setStoredUrl(value) {
  try {
    window.localStorage.setItem("externalApiUrl", value);
  } catch {
    // Ignore storage issues in private mode or restrictive browser settings.
  }
}

const queryUrl = normalizeUrl(new URLSearchParams(window.location.search).get("api"));
const envUrl = normalizeUrl(import.meta.env.VITE_API_URL);
const storedUrl = getStoredUrl();
const host = window.location.hostname;
const isLocalHost =
  host === "localhost" || host === "127.0.0.1" || host === "::1";

const autoUrl = normalizeUrl(
  isLocalHost ? "http://localhost:5000" : window.location.origin
);

if (queryUrl) {
  setStoredUrl(queryUrl);
}

export const API_URL = queryUrl || envUrl || storedUrl || autoUrl;
