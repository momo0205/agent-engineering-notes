import { ReaDiagram, type ReaDiagramKind } from "./rea-diagram";
import { EvidenceLabDiagram, type EvidenceLabDiagramKind } from "./evidence-lab-diagram";

type ArticleBodyProps = {
  html: string;
  profile?: "default" | "rea" | "evidence-lab";
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
  if (profile === "evidence-lab") {
    const sections = html.split(/(<p>\[evidence-lab-diagram:(?:purpose|pipeline|loop|context|validation|deep-research)\]<\/p>)/g);
    return <article className="article-body rea-reading-body">
      {sections.map((section, index) => {
        const diagram = section.match(/^<p>\[evidence-lab-diagram:(purpose|pipeline|loop|context|validation|deep-research)\]<\/p>$/);
        return diagram ? <EvidenceLabDiagram key={index} kind={diagram[1] as EvidenceLabDiagramKind} />
          : section.trim() ? <div key={index} className="rea-prose-fragment" dangerouslySetInnerHTML={{ __html: decorateReaTables(section) }} /> : null;
      })}
    </article>;
  }
  if (profile === "rea") {
    const sections = html.split(/(<p>\[rea-diagram:(?:roles|pipeline|verification|pairing|data-flow)\]<\/p>)/g);
    return (
      <article className="article-body rea-reading-body">
        {sections.map((section, index) => {
          const diagram = section.match(/^<p>\[rea-diagram:(roles|pipeline|verification|pairing|data-flow)\]<\/p>$/);
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
