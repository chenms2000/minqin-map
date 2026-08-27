const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const siteBasePath = configuredBasePath === "/" ? "" : configuredBasePath.replace(/\/$/, "");

export function publicAsset(path: string): string {
  if (/^(?:https?:)?\/\//.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteBasePath}${normalizedPath}`;
}
