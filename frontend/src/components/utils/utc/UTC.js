//src/components/utils/utc/UTC.js
// Преобразовать локальное время → UTC (для сохранения в бэкенд)
export function toUTC(date = new Date()) {
  return new Date(date).toISOString();
}

// Преобразовать UTC → локальное время пользователя
export function fromUTC(utcDate, timeZone) {
  return new Date(utcDate).toLocaleString("ru-RU", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

// Красивый формат для UI (например: "понедельник, 12 января, 14:30")
export function formatForDisplay(utcDate, timeZone) {
  return new Date(utcDate).toLocaleString("ru-RU", {
    timeZone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
