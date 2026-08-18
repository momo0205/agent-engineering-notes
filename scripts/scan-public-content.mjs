import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const PUBLIC_ROOTS = [
  "content",
  "app",
  "components",
  "public",
  "README.md",
  "HANDOFF.md",
];

const excludedNames = new Set([".git", "node_modules", "ai-instructure"]);
const rules = [
  ["private-key", /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/],
  ["openai-api-key", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["bearer-authorization", /\b(?:Authorization\s*:\s*)?Bearer\s+(?!\[REDACTED\])[A-Za-z0-9._~+/=-]{20,}/i],
  ["postgresql-url", /\bpostgres(?:ql)?:\/\/(?!\[REDACTED\])[^\s"'<>]+/i],
  ["ipv4-address", /\b(?:\d{1,3}\.){3}\d{1,3}\b/],
  ["local-user-path", /(?:^|[\s"'(])\/Users\/[^\s"')]+/],
  ["tunnel-token", /\b(?:TUNNEL_TOKEN|TUNNEL_AUTH_TOKEN)\s*=\s*(?!\[REDACTED\])[^\s#]+/i],
  ["tunnel-token", /\b(?:cloudflared|tunnel)\b[^\n]*\s--token(?:=|\s+)(?!\[REDACTED\])[^\s#]+/i],
  ["dotenv-secret-assignment", /\b(?:API_KEY|DATABASE_PASSWORD|PASSWORD|SECRET|TOKEN|ACCESS_TOKEN|AUTH_TOKEN|CLIENT_SECRET)\s*=\s*(?!\[REDACTED\]|example\b|placeholder\b|changeme\b)[^\s#]+/i],
];

function toPosix(path) {
  return path.split(sep).join("/");
}

function isExcludedName(name) {
  return excludedNames.has(name) || name === ".env" || name.startsWith(".env.");
}

export function scanText(text, path) {
  const findings = [];
  for (const [index, lineText] of text.split(/\r?\n/).entries()) {
    for (const [rule, pattern] of rules) {
      if (pattern.test(lineText)) {
        findings.push({ rule, path: toPosix(path), line: index + 1 });
        break;
      }
    }
  }
  return findings;
}

function collectEntry(absolutePath, repositoryPath, files) {
  const stat = lstatSync(absolutePath);
  if (stat.isSymbolicLink()) {
    throw new Error(`symlink rejected in public content: ${toPosix(repositoryPath)}`);
  }
  if (isExcludedName(repositoryPath.split(sep).at(-1))) return;
  if (stat.isDirectory()) {
    for (const entry of readdirSync(absolutePath).sort()) {
      collectEntry(resolve(absolutePath, entry), join(repositoryPath, entry), files);
    }
    return;
  }
  if (stat.isFile()) files.push(toPosix(repositoryPath));
}

export function collectPublicFiles(root = process.cwd()) {
  const files = [];
  for (const publicRoot of PUBLIC_ROOTS) {
    const absolutePath = resolve(root, publicRoot);
    if (!existsSync(absolutePath)) continue;
    collectEntry(absolutePath, publicRoot, files);
  }
  return files;
}

export function scanFiles(files, root = process.cwd()) {
  const findings = [];
  let scanned = 0;
  for (const file of files) {
    const absolutePath = resolve(root, file);
    const buffer = readFileSync(absolutePath);
    if (buffer.includes(0)) continue;
    scanned += 1;
    findings.push(...scanText(buffer.toString("utf8"), file));
  }
  return { findings, scanned };
}

function main() {
  try {
    const { findings, scanned } = scanFiles(collectPublicFiles(), process.cwd());
    if (findings.length > 0) {
      console.error("Sensitive content check failed:");
      for (const finding of findings) {
        console.error(`${finding.rule} ${finding.path}:${finding.line}`);
      }
      process.exitCode = 1;
      return;
    }
    console.log(`Sensitive content check passed (${scanned} files scanned).`);
  } catch (error) {
    const message = error instanceof Error && /symlink/i.test(error.message)
      ? error.message
      : "unable to inspect public content";
    console.error(`Sensitive content check failed: ${message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
