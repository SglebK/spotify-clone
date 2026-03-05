// src/components/utils/api/config.js

let autoUrl = "";

if (window.location.hostname === "localhost") {
  autoUrl = "http://localhost:5000";
} else {
  autoUrl = "https://your-production-domain.com";
}

export const API_URL = import.meta.env.VITE_API_URL || autoUrl;
