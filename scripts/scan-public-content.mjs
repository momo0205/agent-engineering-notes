import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { extname } from "node:path";

const textExtensions = new Set([
  ".cjs", ".css", ".html", ".js", ".json", ".jsx", ".md", ".mdx",
  ".mjs", ".toml", ".ts", ".tsx", ".yaml", ".yml",
]);
const excludedFiles = new Set(["package-lock.json"]);
const secretPatterns = [
  ["private key", /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/],
  ["OpenAI-style API key", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["assigned secret", /\b(?:API_KEY|ACCESS_TOKEN|AUTH_TOKEN|CLIENT_SECRET|PASSWORD)\s*[=:]\s*["']?(?!example|placeholder|changeme)[A-Za-z0-9_./+=-]{12,}/i],
];

const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean)
  .filter(existsSync)
  .filter((file) => !excludedFiles.has(file))
  .filter((file) => textExtensions.has(extname(file)) || file.endsWith(".env.example"));

const findings = [];
for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(content)) findings.push(`${file}: possible ${label}`);
  }
}

if (findings.length > 0) {
  console.error(["Sensitive content check failed:", ...findings].join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Sensitive content check passed (${files.length} text files scanned).`);
}
