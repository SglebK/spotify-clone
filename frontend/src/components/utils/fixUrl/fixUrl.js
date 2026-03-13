import { API_URL } from "../api/config";

export function fixUrl(url) {
    if (!url) return null;

    // Если URL уже полный — возвращаем как есть
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    return `${API_URL}${url}`;
}
