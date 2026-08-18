type ArticleBodyProps = {
  html: string;
};

export function ArticleBody({ html }: ArticleBodyProps) {
  return (
    <article
      className="article-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
