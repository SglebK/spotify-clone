export function sanitize(str) {
  if (!str) return "";
  return String(str).replace(/[<>]/g, "");
}
