import { fireEvent, render, screen } from "@testing-library/react";
import { SiteHeader } from "../../components/site-header";
import JourneyPage from "../../app/journey/page";
import ProjectPage from "../../app/projects/agent-evidence-lab/page";
import AboutPage from "../../app/about/page";
import { SearchFilter } from "../../components/search-filter";

describe("static public routes", () => {
  it("presents the journey as learning dependencies and progress", () => {
    render(<JourneyPage />);

    expect(screen.getByRole("heading", { name: "学习路径" })).toBeInTheDocument();
    expect(screen.getByText("LLM API")).toBeInTheDocument();
    expect(screen.getByText("Production")).toBeInTheDocument();
    expect(screen.getByText(/不代表所有阶段都已完成/)).toBeInTheDocument();
  });

  it("states project evidence and remaining work without overclaiming", () => {
    render(<ProjectPage />);

    expect(screen.getByRole("heading", { name: "Agent Evidence Lab" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "M0–M3 已完成限定范围验收" })).toBeInTheDocument();
    for (const name of ["代码与模型分别负责什么", "已经验证的能力", "当前真实能力边界", "仍待完成", "下一条主线：问题驱动、主动补证据"]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    expect(screen.getByText(/完整 M4\/M5 仍未关闭/)).toBeInTheDocument();
    expect(screen.getByText(/引用可追溯，不代表结论已独立验证/)).toBeInTheDocument();
    expect(screen.getByText(/具体规则细节标为 PARTIAL/)).toBeInTheDocument();
    expect(screen.getByText(/实际实验运行数仍为 0/)).toBeInTheDocument();
    expect(screen.getByText(/这个方向尚未实施/)).toBeInTheDocument();
    expect(screen.getByText(/不能外推为生产可靠性/)).toBeInTheDocument();
  });

  it("explains the author background and public-content policy", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { name: "关于本站" })).toBeInTheDocument();
    expect(screen.getByText(/Java 后端/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "公开内容政策" })).toBeInTheDocument();
    expect(screen.getByText(/脱敏/)).toBeInTheDocument();
    expect(screen.getByText(/明确进入 public repo/)).toBeInTheDocument();
    expect(screen.getByText(/证据与边界/)).toBeInTheDocument();
  });
});

describe("site header", () => {
  it.each([
    ["首页", "/"],
    ["学习路径", "/journey"],
    ["文章", "/articles"],
    ["专题研究", "/topics"],
    ["项目", "/projects/agent-evidence-lab"],
    ["关于", "/about"],
  ])("links %s to %s", (name, href) => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
  });
});

describe("SearchFilter", () => {
  const articles = [
    { slug: "loop", title: "Agent Loop", summary: "循环实践", tags: ["agent"], category: "工程实践", readingMinutes: 6 },
    { slug: "java", title: "Java Context", summary: "上下文学习", tags: ["JVM"], category: "学习路径", readingMinutes: 4 },
  ] as const;

  it("filters published metadata locally and announces no results", () => {
    render(<SearchFilter articles={articles} />);
    const input = screen.getByRole("searchbox", { name: "搜索文章" });

    expect(screen.getAllByRole("article").map((article) => article.textContent)).toEqual([
      expect.stringContaining("Agent Loop"),
      expect.stringContaining("Java Context"),
    ]);

    fireEvent.change(input, { target: { value: "JAVA" } });
    expect(screen.getByRole("link", { name: "Java Context" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Agent Loop" })).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "missing" } });
    expect(screen.getByText("没有找到匹配的文章。")).toBeInTheDocument();
  });
});
