import { ReaDiagram, type ReaDiagramKind } from "./rea-diagram";

type ArticleBodyProps = {
  html: string;
  profile?: "default" | "rea";
};

// This decorates already-sanitized HTML; it never accepts arbitrary diagram code.
function decorateReaTables(html: string): string {
  return html.replace(/<table>[\s\S]*?<\/table>/g, (table) => {
    const firstRow = table.match(/<tr>[\s\S]*?<\/tr>/)?.[0] ?? "";
    const columns = firstRow.match(/<th>/g)?.length ?? 0;
    const headers = table.replace(/<th>/g, '<th scope="col">');
    return `<div class="rea-table-wrap rea-table-columns-${columns}" role="region" aria-label="数据表，可横向滚动" tabindex="0">${headers}</div>`;
  });
}

export function ArticleBody({ html, profile = "default" }: ArticleBodyProps) {
  if (profile === "rea") {
    const sections = html.split(/(<p>\[rea-diagram:(?:roles|pipeline|verification)\]<\/p>)/g);
    return (
      <article className="article-body rea-reading-body">
        {sections.map((section, index) => {
          const diagram = section.match(/^<p>\[rea-diagram:(roles|pipeline|verification)\]<\/p>$/);
          return diagram
            ? <ReaDiagram key={index} kind={diagram[1] as ReaDiagramKind} />
            : section.trim() ? <div key={index} className="rea-prose-fragment" dangerouslySetInnerHTML={{ __html: decorateReaTables(section) }} /> : null;
        })}
      </article>
    );
  }
  return (
    <article
      className="article-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
