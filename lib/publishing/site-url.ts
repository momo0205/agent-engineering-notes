import { isIP } from "node:net";

const LOCAL_FALLBACK = "http://localhost:3000";

function isUnsafeHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (normalized === "localhost") return false;

  return (
    !normalized.includes(".") ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    isIP(normalized) !== 0
  );
}

export function canonicalBaseUrl(siteUrl = process.env.SITE_URL): string {
  if (!siteUrl) return LOCAL_FALLBACK;

  try {
    const parsed = new URL(siteUrl);
    if (
      (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash ||
      isUnsafeHostname(parsed.hostname)
    ) {
      return LOCAL_FALLBACK;
    }

    return parsed.href.replace(/\/$/, "");
  } catch {
    return LOCAL_FALLBACK;
  }
}
