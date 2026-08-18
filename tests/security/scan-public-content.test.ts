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
    ["AWS access key", ["AKIA", "ABCDEFGHIJKLMNOP"].join("")],
    ["Bearer authorization", "Authorization: Bearer abcdefghijklmnopqrstuvwxyz"],
    ["Bearer credential", "Bearer abcdefghijklmnopqrstuvwxyz123456"],
    ["private key", "-----BEGIN PRIVATE KEY-----"],
    ["PostgreSQL URL", "postgresql://admin:password@db.example.test/app"],
    ["IPv4 address", "server: 203.0.113.24"],
    ["macOS user path", "/Users/alice/private-notes/plan.md"],
    ["dotenv assignment", "DATABASE_PASSWORD=super-secret-password"],
    ["OpenAI env assignment", "OPENAI_API_KEY=abcdefghijklmnopqrstuvwxyz123456"],
    ["Stripe env assignment", "STRIPE_SECRET_KEY=abcdefghijklmnopqrstuvwxyz123456"],
    ["service token assignment", "DEPLOY_TOKEN=abcdefghijklmnopqrstuvwxyz123456"],
    ["tunnel token", "TUNNEL_TOKEN=abcdefghijklmnopqrstuvwxyz123456"],
    ["tunnel CLI token", "cloudflared tunnel run --token abcdefghijklmnopqrstuvwxyz123456"],
  ])("rejects %s", (_name, text) => {
    expect(scanText(text, "content/example.md")).toHaveLength(1);
  });

  it("allows ordinary prose and explicit redactions", () => {
    const text = [
      "Agents can use bearer authentication in production.",
      "Use Bearer token authentication.",
      "The service connects to a PostgreSQL database.",
      "API_KEY=[REDACTED]",
      "OPENAI_API_KEY='[REDACTED]'",
      'STRIPE_SECRET_KEY="[REDACTED]"',
      "Authorization: Bearer [REDACTED]",
    ].join("\n");

    expect(scanText(text, "README.md")).toEqual([]);
  });

  it("does not let a redaction hide a second secret on the same line", () => {
    const value = "sk-abcdefghijklmnopqrstuvwxyz123456";
    expect(scanText(`API_KEY=[REDACTED] ${value}`, "README.md")).toHaveLength(1);
  });

  it.each([
    "API_KEY",
    "OPENAI_API_KEY",
    "SECRET_KEY",
    "STRIPE_SECRET_KEY",
    "SECRET",
    "CLIENT_SECRET",
    "TOKEN",
    "DEPLOY_TOKEN",
    "PASSWORD",
    "DATABASE_PASSWORD",
    "PASSWD",
    "ADMIN_PASSWD",
  ])("rejects sensitive env assignment name %s", (name) => {
    const value = "abcdefghijklmnopqrstuvwxyz123456";
    const findings = scanText(`${name}=${value}`, "content/example.md");
    expect(findings).toHaveLength(1);
    expect(JSON.stringify(findings)).not.toContain(value);
  });

  it.each([
    "SECRET",
    "CLIENT_SECRET",
    "PASSWD",
    "ADMIN_PASSWD",
  ])("allows redacted sensitive assignment %s", (name) => {
    expect(scanText(`${name}='[REDACTED]'`, "content/example.md")).toEqual([]);
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

  it("scans nested ai-instructure directories inside public roots", () => {
    const root = mkdtempSync(join(tmpdir(), "public-scan-"));
    mkdirSync(join(root, "content", "ai-instructure"), { recursive: true });
    mkdirSync(join(root, "public", "ai-instructure"), { recursive: true });
    writeFileSync(join(root, "content", "ai-instructure", "leak.md"), "safe");
    writeFileSync(join(root, "public", "ai-instructure", "config.txt"), "safe");

    expect(collectPublicFiles(root)).toEqual([
      "content/ai-instructure/leak.md",
      "public/ai-instructure/config.txt",
    ]);
  });
});
