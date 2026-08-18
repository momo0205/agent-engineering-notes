import type { MetadataRoute } from "next";
import { visibleArticles } from "../lib/content/article-repository";
import { canonicalBaseUrl } from "../lib/publishing/site-url";

const STATIC_ROUTES = [
  "/",
  "/journey",
  "/articles",
  "/projects/agent-evidence-lab",
  "/about",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = canonicalBaseUrl();
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: route === "/" ? `${base}/` : `${base}${route}`,
  }));
  const articleEntries = visibleArticles().map((article) => ({
    url: `${base}/articles/${encodeURIComponent(article.slug)}`,
    lastModified: new Date(`${article.updatedAt}T00:00:00.000Z`),
  }));

  return [...staticEntries, ...articleEntries];
}
