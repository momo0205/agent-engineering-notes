export type SearchableArticle = {
  title: string;
  summary: string;
  tags: readonly string[];
};

function normalizeSearchText(value: string): string {
  return value.normalize("NFC").trim().toLocaleLowerCase();
}

export function searchArticles<T extends SearchableArticle>(
  articles: readonly T[],
  query: string,
): T[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return articles.slice();
  }

  return articles.filter((article) =>
    normalizeSearchText(
      [article.title, article.summary, ...article.tags].join(" "),
    ).includes(normalizedQuery),
  );
}
