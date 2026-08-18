import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PUBLIC_ROOTS,
  collectPublicFiles,
  scanText,
} from "../../scripts/scan-public-content.mjs";

describe("public content secret scanner", () => {
  it("exports the exact allowlist of public roots", () => {
    expect(PUBLIC_ROOTS).toEqual([
      "content",
      "app",
      "components",
      "public",
      "README.md",
      "HANDOFF.md",
    ]);
  });

  it.each([
    ["OpenAI API key", "sk-abcdefghijklmnopqrstuvwxyz123456"],
    ["Bearer authorization", "Authorization: Bearer abcdefghijklmnopqrstuvwxyz"],
    ["private key", "-----BEGIN PRIVATE KEY-----"],
    ["PostgreSQL URL", "postgresql://admin:password@db.example.test/app"],
    ["IPv4 address", "server: 203.0.113.24"],
    ["macOS user path", "/Users/alice/private-notes/plan.md"],
    ["dotenv assignment", "DATABASE_PASSWORD=super-secret-password"],
    ["tunnel token", "TUNNEL_TOKEN=abcdefghijklmnopqrstuvwxyz123456"],
    ["tunnel CLI token", "cloudflared tunnel run --token abcdefghijklmnopqrstuvwxyz123456"],
  ])("rejects %s", (_name, text) => {
    expect(scanText(text, "content/example.md")).toHaveLength(1);
  });

  it("allows ordinary prose and explicit redactions", () => {
    const text = [
      "Agents can use bearer authentication in production.",
      "The service connects to a PostgreSQL database.",
      "API_KEY=[REDACTED]",
      "Authorization: Bearer [REDACTED]",
    ].join("\n");

    expect(scanText(text, "README.md")).toEqual([]);
  });

  it("does not let a redaction hide a second secret on the same line", () => {
    const value = "sk-abcdefghijklmnopqrstuvwxyz123456";
    expect(scanText(`API_KEY=[REDACTED] ${value}`, "README.md")).toHaveLength(1);
  });

  it("returns only rule, repository-relative path and line", () => {
    const value = "sk-abcdefghijklmnopqrstuvwxyz123456";
    const [finding] = scanText(`safe\n${value}\n`, "content/guide.md");

    expect(finding).toEqual({
      rule: "openai-api-key",
      path: "content/guide.md",
      line: 2,
    });
    expect(JSON.stringify(finding)).not.toContain(value);
  });

  it("only collects files below existing public roots and rejects symlinks", () => {
    const root = mkdtempSync(join(tmpdir(), "public-scan-"));
    const outside = mkdtempSync(join(tmpdir(), "private-workspace-"));
    mkdirSync(join(root, "content"));
    mkdirSync(join(root, ".git"));
    mkdirSync(join(root, "node_modules"));
    mkdirSync(join(root, "ai-instructure"));
    writeFileSync(join(root, "README.md"), "safe");
    writeFileSync(join(root, "content", "guide.md"), "safe");
    writeFileSync(join(root, ".env.production"), "safe");
    writeFileSync(join(outside, "private.md"), "private");
    symlinkSync(join(outside, "private.md"), join(root, "content", "linked.md"));

    expect(() => collectPublicFiles(root)).toThrow(/symlink/i);
  });

  it("ignores missing optional roots, env files and non-public directories", () => {
    const root = mkdtempSync(join(tmpdir(), "public-scan-"));
    mkdirSync(join(root, "content"));
    mkdirSync(join(root, "ai-instructure"));
    writeFileSync(join(root, "content", "guide.md"), "safe");
    writeFileSync(join(root, "content", ".env.local"), "PASSWORD=not-public");
    writeFileSync(join(root, "ai-instructure", "private.md"), "private");

    expect(collectPublicFiles(root)).toEqual(["content/guide.md"]);
  });
});
