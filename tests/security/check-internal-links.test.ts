import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkLinks,
  extractMarkdownTargets,
  localTargetExists,
} from "../../scripts/check-internal-links.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "public-links-"));
  mkdirSync(join(root, "content", "assets"), { recursive: true });
  mkdirSync(join(root, "public"));
  mkdirSync(join(root, "app", "notes", "foo"), { recursive: true });
  writeFileSync(join(root, "content", "target.md"), "# Target");
  writeFileSync(join(root, "content", "path with spaces.md"), "# Spaces");
  writeFileSync(join(root, "content", "assets", "diagram.svg"), "<svg></svg>");
  writeFileSync(join(root, "public", "favicon.svg"), "<svg></svg>");
  writeFileSync(join(root, "app", "notes", "foo", "page.tsx"), "export default function Page() {};");
  return root;
}

describe("public internal link checker", () => {
  it("uses a Markdown parser for links, images and angle-bracket targets", () => {
    expect(extractMarkdownTargets([
      "[doc](target.md#top)",
      "![asset](assets/diagram.svg?raw=1)",
      "[space](<path with spaces.md>)",
      "`[not-a-link](missing.md)`",
    ].join("\n"))).toEqual([
      "target.md#top",
      "assets/diagram.svg?raw=1",
      "path with spaces.md",
    ]);
  });

  it("requires relative Markdown and asset targets to exist", () => {
    const root = fixture();
    expect(localTargetExists("content/source.md", "target.md", root)).toBe(true);
    expect(localTargetExists("content/source.md", "assets/diagram.svg", root)).toBe(true);
    expect(localTargetExists("content/source.md", "missing.md", root)).toBe(false);
  });

  it.each([
    "file:///Users/alice/private.md",
    "/Users/alice/private.md",
    "C:\\Users\\alice\\private.md",
    "../../private-workspace/notes.md",
  ])("rejects unsafe local target %s", (target) => {
    expect(localTargetExists("content/source.md", target, fixture())).toBe(false);
  });

  it("allows HTTPS without network access", () => {
    expect(localTargetExists("content/source.md", "https://example.invalid/docs", fixture())).toBe(true);
  });

  it("supports public assets, App Router routes, query strings and fragments", () => {
    const root = fixture();
    expect(localTargetExists("content/source.md", "/favicon.svg?v=1", root)).toBe(true);
    expect(localTargetExists("content/source.md", "/notes/foo#top", root)).toBe(true);
    expect(localTargetExists("content/source.md", "target.md?view=full#top", root)).toBe(true);
    expect(localTargetExists("content/source.md", "<path with spaces.md>", root)).toBe(true);
  });

  it("does not treat normal TSX imports as links", () => {
    const root = fixture();
    writeFileSync(join(root, "app", "page.tsx"), [
      'import missing from "./missing-module";',
      'export default function Page() { return <a href="/notes/foo">Notes</a>; }',
    ].join("\n"));

    expect(checkLinks(["app/page.tsx"], root)).toEqual([]);
  });

  it("reports failures without absolute filesystem paths", () => {
    const root = fixture();
    writeFileSync(join(root, "content", "source.md"), "[bad](missing.md)");

    const failures = checkLinks(["content/source.md"], root);
    expect(failures).toEqual([{
      path: "content/source.md",
      target: "missing.md",
    }]);
    expect(JSON.stringify(failures)).not.toContain(root);
  });

  it("redacts unsafe local targets from findings", () => {
    const root = fixture();
    writeFileSync(join(root, "content", "source.md"), "[private](file:///Users/alice/private.md)");

    const failures = checkLinks(["content/source.md"], root);
    expect(failures).toEqual([{
      path: "content/source.md",
      target: "[unsafe-local-target]",
    }]);
    expect(JSON.stringify(failures)).not.toContain("/Users/alice");
  });
});
