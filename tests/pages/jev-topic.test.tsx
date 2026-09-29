import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import JevTopicPage, { metadata } from "../../app/topics/jev/page";

describe("Jev research topic", () => {
  it("presents an in-progress research path and accurately scoped experiment status", () => {
    render(<JevTopicPage />);
    expect(screen.getByRole("heading", { name: "Jev：无文本决策模型研究" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(7);
    expect(screen.getByText(/研究进行中/)).toBeInTheDocument();
    expect(screen.getByText("专题进度更新")).toBeInTheDocument();
    expect(screen.getByText(/Laya.*校准集.*探索性.*正式对照评估和 Jev 在线实测尚未开始/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Laya：一个可检查的决策模型实现" })).toHaveAttribute(
      "href", "/topics/jev/laya-reference-implementation",
    );
    expect(screen.getByRole("heading", { name: "开放问题" })).toBeInTheDocument();
  });

  it("publishes a route-specific canonical", () => {
    expect(metadata).toMatchObject({
      title: "Jev：无文本决策模型研究",
      alternates: { canonical: "/topics/jev" },
    });
  });
});
