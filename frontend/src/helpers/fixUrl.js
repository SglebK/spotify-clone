import { API_URL } from "@api/config";
export function fixUrl(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    return `${API_URL}${url}`;
}
