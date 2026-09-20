import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import JevTopicPage, { metadata } from "../../app/topics/jev/page";

describe("Jev research topic", () => {
  it("presents a six-chapter in-progress research path", () => {
    render(<JevTopicPage />);
    expect(screen.getByRole("heading", { name: "Jev：无文本决策模型研究" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.getByText(/研究进行中/)).toBeInTheDocument();
    expect(screen.getByText(/实验尚未开始/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "开放问题" })).toBeInTheDocument();
  });

  it("publishes a route-specific canonical", () => {
    expect(metadata).toMatchObject({
      title: "Jev：无文本决策模型研究",
      alternates: { canonical: "/topics/jev" },
    });
  });
});
