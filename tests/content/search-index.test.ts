import { searchArticles } from "../../lib/content/search-index";

describe("searchArticles", () => {
  const items = [
    { title: "Agent Loop", summary: "A dependable loop", tags: ["agent"] },
    { title: "Java services", summary: "Backend notes", tags: ["JVM"] },
  ];

  it.each([
    ["  loop ", "Agent Loop"],
    ["JAVA", "Java services"],
  ])("normalizes %j before searching", (query, expectedTitle) => {
    expect(searchArticles(items, query)).toEqual([
      expect.objectContaining({ title: expectedTitle }),
    ]);
  });

  it("searches Chinese text across summaries and tags", () => {
    const chineseItems = [
      { title: "工具调用", summary: "受约束的智能体循环", tags: ["工程实践"] },
      { title: "上下文", summary: "窗口管理", tags: ["学习路径"] },
    ];

    expect(searchArticles(chineseItems, "智能体")).toEqual([chineseItems[0]]);
    expect(searchArticles(chineseItems, "学习路径")).toEqual([chineseItems[1]]);
  });

  it("matches canonically equivalent Unicode text", () => {
    const composed = { title: "Café evaluation", summary: "Notes", tags: ["LLM"] };

    expect(searchArticles([composed], "Cafe\u0301")).toEqual([composed]);
  });

  it("preserves repository order for blank queries without mutating the input", () => {
    const original = [...items];
    const result = searchArticles(items, "   ");

    expect(result).toEqual(original);
    expect(result).not.toBe(items);
    expect(items).toEqual(original);
  });

  it("keeps match order stable and does not mutate the input", () => {
    const ordered = [
      { title: "First", summary: "loop", tags: ["one"] },
      { title: "Second loop", summary: "notes", tags: ["two"] },
      { title: "Third", summary: "unrelated", tags: ["three"] },
    ];
    const snapshot = structuredClone(ordered);

    expect(searchArticles(ordered, "loop")).toEqual([ordered[0], ordered[1]]);
    expect(ordered).toEqual(snapshot);
  });
});
