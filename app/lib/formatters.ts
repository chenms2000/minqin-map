export function accuracyClass(accuracy: string) {
  if (accuracy === "公开知识点") return "knowledge";
  if (accuracy === "县域叙事点") return "county";
  return "approximate";
}

export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
