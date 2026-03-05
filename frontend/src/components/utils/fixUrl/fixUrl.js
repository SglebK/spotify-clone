//src/components/utils/fixUrl/fixUrl.js
export function fixUrl(url) {
    if (!url) return null;

    // Если URL уже полный — возвращаем как есть
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    // Иначе добавляем домен backend (возможно из env)
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${base}${url}`;
}
