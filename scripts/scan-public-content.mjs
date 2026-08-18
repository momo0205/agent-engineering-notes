import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_FILE_BYTES = 1024 * 1024;
const excludedPaths = /^(?:\.git|\.next|\.vinext|\.vite|\.wrangler|coverage|dist|node_modules)(?:\/|$)/;
const excludedFiles = new Set(["package-lock.json"]);
const secretPatterns = [
  ["private key", /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/],
  ["OpenAI-style API key", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["authorization bearer token", /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/i],
  ["npm authentication token", /(?:^|\s)_authToken\s*=\s*(?!\$\{|\$\()[^\s#]{12,}/im],
  ["assigned secret", /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|secret|token|key)\s*[=:]\s*["']?(?!example|placeholder|changeme|undefined|null)[A-Za-z0-9_./+=-]{12,}/i],
];

function isScannable(file, root) {
  if (excludedFiles.has(file) || excludedPaths.test(file)) return false;
  const absolutePath = resolve(root, file);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) return false;
  return statSync(absolutePath).size <= MAX_FILE_BYTES;
}

export function scanFiles(files, root = process.cwd()) {
  const findings = [];
  let scanned = 0;

  for (const file of files) {
    if (!isScannable(file, root)) continue;
    const buffer = readFileSync(resolve(root, file));
    if (buffer.includes(0)) continue;
    scanned += 1;
    const content = buffer.toString("utf8");
    for (const [label, pattern] of secretPatterns) {
      if (pattern.test(content)) findings.push(`${file}: possible ${label}`);
    }
  }

  return { findings, scanned };
}

export function gitCandidateFiles(root = process.cwd()) {
  return execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
    cwd: root,
    encoding: "utf8",
  }).split("\n").filter(Boolean);
}

function main() {
  const { findings, scanned } = scanFiles(gitCandidateFiles(), process.cwd());
  if (findings.length > 0) {
    console.error(["Sensitive content check failed:", ...findings].join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Sensitive content check passed (${scanned} files scanned).`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
