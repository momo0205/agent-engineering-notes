import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const contentExtensions = new Set([".html", ".md", ".mdx"]);
const pageExtensions = [".tsx", ".ts", ".jsx", ".js", ".mdx"];

function existsAsFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function targetCandidates(source, pathname, root) {
  if (pathname.startsWith("/")) {
    const relative = pathname.slice(1);
    const publicTarget = resolve(root, "public", relative);
    const appRoute = resolve(root, "app", relative);
    return [
      publicTarget,
      ...pageExtensions.map((extension) => resolve(appRoute, `page${extension}`)),
    ];
  }

  const target = resolve(root, dirname(source), pathname);
  return [
    target,
    resolve(target, "index.html"),
    `${target}.md`,
    `${target}.mdx`,
  ];
}

export function localTargetExists(source, rawTarget, root = process.cwd()) {
  const unwrapped = rawTarget.trim().replace(/^<|>$/g, "");
  if (!unwrapped || /^(?:[a-z]+:|#|\/\/)/i.test(unwrapped)) return true;
  const pathname = decodeURIComponent(unwrapped.split(/[?#]/, 1)[0]);
  if (!pathname) return true;
  return targetCandidates(source, pathname, root).some(existsAsFile);
}

function markdownTargets(content) {
  const targets = [];
  const tokens = marked.lexer(content);
  marked.walkTokens(tokens, (token) => {
    if ((token.type === "link" || token.type === "image") && token.href) {
      targets.push(token.href);
    }
  });
  return targets;
}

function htmlTargets(content) {
  return [...content.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map(
    (match) => match[1],
  );
}

export function checkLinks(files, root = process.cwd()) {
  const failures = [];
  for (const file of files) {
    const content = readFileSync(resolve(root, file), "utf8");
    const targets = extname(file) === ".html"
      ? htmlTargets(content)
      : [...markdownTargets(content), ...htmlTargets(content)];
    for (const target of new Set(targets)) {
      if (!localTargetExists(file, target, root)) failures.push(`${file}: ${target}`);
    }
  }
  return failures;
}

export function gitContentFiles(root = process.cwd()) {
  return execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
    cwd: root,
    encoding: "utf8",
  }).split("\n").filter(Boolean).filter((file) => contentExtensions.has(extname(file)));
}

function main() {
  const files = gitContentFiles();
  const failures = checkLinks(files);
  if (failures.length > 0) {
    console.error(["Internal link check failed:", ...failures].join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Internal link check passed (${files.length} content files scanned).`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
