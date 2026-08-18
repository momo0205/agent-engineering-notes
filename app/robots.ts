import type { MetadataRoute } from "next";
import { canonicalBaseUrl } from "../lib/publishing/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = canonicalBaseUrl();

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
