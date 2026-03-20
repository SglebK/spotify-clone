import { API_URL } from "./config";

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        throw new Error("No refresh token");
    }

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Не удалось обновить сессию");
    }

    window.__accessToken = data.token;
    if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
    }

    window.dispatchEvent(new CustomEvent("auth:token-refreshed", {
        detail: data
    }));

    return data.token;
}

export async function authFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});

    if (window.__accessToken) {
        headers.set("Authorization", `Bearer ${window.__accessToken}`);
    }

    let response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status !== 401) {
        return response;
    }

    try {
        const newToken = await refreshAccessToken();
        headers.set("Authorization", `Bearer ${newToken}`);

        response = await fetch(url, {
            ...options,
            headers
        });

        return response;
    } catch (error) {
        localStorage.removeItem("refreshToken");
        window.__accessToken = null;
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        throw error;
    }
}
