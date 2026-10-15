import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TopicsPage from "../../app/topics/page";

describe("research directory", () => {
  it("keeps existing topics reachable through the grouped directory", () => {
    render(<TopicsPage />);
    expect(screen.getByRole("link", { name: "DeepSeek Harness" })).toHaveAttribute("href", "/topics/deepseek-harness");
    expect(screen.getByRole("link", { name: "算法原理与复现" })).toHaveAttribute("href", "/topics/algorithm-foundations");
    expect(screen.getByRole("link", { name: "Jev 决策模型" })).toHaveAttribute("href", "/topics/jev");
    expect(screen.getByRole("link", { name: "REA 工具与逆向工程" })).toHaveAttribute("href", "/topics/rea");
  });

  it("searches topic tags and recovers from an empty result", () => {
    render(<TopicsPage />);
    const search = screen.getByRole("searchbox", { name: "搜索专题" });
    fireEvent.change(search, { target: { value: "反编译" } });
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "REA 工具与逆向工程" })).toBeInTheDocument();
    fireEvent.change(search, { target: { value: "does-not-match-any-topic" } });
    expect(screen.getByRole("status")).toHaveTextContent("没有找到匹配的专题");
    fireEvent.change(search, { target: { value: "" } });
    expect(screen.getAllByRole("article")).toHaveLength(5);
  });
});
