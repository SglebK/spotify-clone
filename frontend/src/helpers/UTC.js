export function toUTC(date = new Date()) {
  return new Date(date).toISOString();
}
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
