import { render, screen } from "@testing-library/react";
import AlgorithmFoundationsTopicPage from "../../app/topics/algorithm-foundations/page";
import { algorithmFoundationsRevision } from "../../lib/content/algorithm-foundations-topic";

describe("Algorithm foundations topic homepage", () => {
  it("leads with the course path and the next ResNet step", () => {
    render(<AlgorithmFoundationsTopicPage />);

    expect(screen.getByRole("heading", { name: "算法原理与复现" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /继续学习.*ResNet/ })).toHaveAttribute(
      "href",
      "/topics/algorithm-foundations/resnet",
    );
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "三篇论文不是孤岛" })).toBeInTheDocument();
    expect(screen.getByText(/信息如何在越来越深、越来越复杂的模型中稳定流动/)).toBeInTheDocument();
  });

  it("offers reading method, fixed source, honest chapter states, and local progress", () => {
    render(<AlgorithmFoundationsTopicPage />);

    expect(screen.getByRole("link", { name: /学习方法/ })).toHaveAttribute(
      "href",
      "/topics/algorithm-foundations/reading-method",
    );
    expect(screen.getByRole("link", { name: /查看固定版本源码/ })).toHaveAttribute(
      "href",
      `https://github.com/momo0205/paper-deep-dive/tree/${algorithmFoundationsRevision}`,
    );
    expect(screen.getByRole("heading", { name: "学习循环" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "本地进度" })).toBeInTheDocument();
    expect(screen.getByText(/仅保存在当前浏览器/)).toBeInTheDocument();
    expect(screen.getByText(/ResNet.*学习中/)).toBeInTheDocument();
    expect(screen.getByText(/Transformer.*框架已发布/)).toBeInTheDocument();
    expect(screen.getByText(/DDPM.*框架已发布/)).toBeInTheDocument();
  });
});
