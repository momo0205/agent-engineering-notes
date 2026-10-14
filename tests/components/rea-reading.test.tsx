import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ArticleBody } from "../../components/article-body";
import { renderMarkdown } from "../../lib/content/markdown-renderer";

afterEach(cleanup);

describe("REA reading profile", () => {
  it("keeps tables semantic inside keyboard-accessible local scroll regions", () => {
    render(<ArticleBody profile="rea" html={renderMarkdown(
      "| 工具 | 能力 | 边界 |\n| --- | --- | --- |\n| `inspect_target` | 读取产物 | 不证明执行 |",
    )} />);
    const table = screen.getByRole("table");
    const region = screen.getByRole("region", { name: "数据表，可横向滚动" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(within(region).getByRole("table")).toBe(table);
    for (const header of within(table).getAllByRole("columnheader")) {
      expect(header).toHaveAttribute("scope", "col");
    }
    expect(within(table).getByRole("cell", { name: "inspect_target" })).toBeInTheDocument();
  });

  it.each([
    ["roles", "分工图：宿主 Agent、REA 与分析工具"],
    ["pipeline", "流程图：分析请求怎样成为可读取的证据"],
    ["verification", "验证图：观察、假设与独立验收"],
  ])("renders the registered %s diagram between its surrounding paragraphs", (kind, name) => {
    render(<ArticleBody profile="rea" html={renderMarkdown(
      `前面的说明。\n\n[rea-diagram:${kind}]\n\n后面的说明。`,
    )} />);
    const figure = screen.getByRole("figure", { name });
    expect(figure.querySelector("figcaption")).not.toBeNull();
    expect(screen.getByText("前面的说明。")).toBeInTheDocument();
    expect(screen.getByText("后面的说明。")).toBeInTheDocument();
    expect(figure.textContent).not.toContain("[rea-diagram:");
  });

  it("does not interpret diagram-like text inside code or unregistered tokens", () => {
    render(<ArticleBody profile="rea" html={renderMarkdown(
      "```text\n[rea-diagram:roles]\n```\n\n[rea-diagram:unregistered]",
    )} />);
    expect(screen.queryByRole("figure")).toBeNull();
    expect(document.querySelector("pre code")).toHaveTextContent("[rea-diagram:roles]");
    expect(screen.getByText("[rea-diagram:unregistered]")).toBeInTheDocument();
  });

  it("preserves the Markdown security boundary around diagrams and tables", () => {
    const { container } = render(<ArticleBody profile="rea" html={renderMarkdown(
      '[rea-diagram:roles]\n\n<script>alert(1)</script>\n\n<img src="javascript:alert(2)" onerror="alert(3)">',
    )} />);
    expect(screen.getByRole("figure")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("[onerror], [onclick], [src^='javascript:']")).toBeNull();
  });

  it("leaves the existing default article profile unchanged", () => {
    render(<ArticleBody html={renderMarkdown(
      "[rea-diagram:roles]\n\n| a | b |\n| --- | --- |\n| 1 | 2 |",
    )} />);
    expect(screen.queryByRole("figure")).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
