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
    expect(screen.getByText(/M0–M2/)).toBeInTheDocument();
    expect(screen.getByText(/当前：M3/)).toBeInTheDocument();
    expect(screen.getByText(/固定测试集 5\/5/)).toBeInTheDocument();
    for (const item of ["Checkpoint", "Trace", "预算控制", "工具恢复"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
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
