export function accuracyClass(accuracy: string) {
  if (accuracy === "公开知识点") return "knowledge";
  if (accuracy === "县域叙事点") return "county";
  if (accuracy === "GPS实拍点") return "confirmed";
  return "approximate";
}

export function formatDuration(seconds: number) {
  const wholeSeconds = Math.floor(seconds);
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}
