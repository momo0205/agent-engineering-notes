import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { marked } from "marked";
import { PUBLIC_ROOTS, collectPublicFiles } from "./scan-public-content.mjs";

const contentExtensions = new Set([".html", ".md", ".mdx", ".tsx", ".jsx"]);
const appPageExtensions = [".tsx", ".ts", ".jsx", ".js", ".mdx"];

function toPosix(path) {
  return path.split(sep).join("/");
}

function existsAsFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function publicBoundary(source, root) {
  const first = toPosix(source).split("/")[0];
  const directoryRoots = PUBLIC_ROOTS.filter((entry) => !extname(entry));
  return directoryRoots.includes(first) ? resolve(root, first) : resolve(root);
}

function isWithin(path, boundary) {
  const rel = relative(boundary, path);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel));
}

function targetCandidates(source, pathname, root) {
  if (pathname.startsWith("/")) {
    const relativeTarget = pathname.slice(1);
    const publicTarget = resolve(root, "public", relativeTarget);
    const appRoute = resolve(root, "app", relativeTarget);
    return [
      publicTarget,
      ...appPageExtensions.map((extension) => resolve(appRoute, `page${extension}`)),
    ];
  }

  const target = resolve(root, dirname(source), pathname);
  return [target, resolve(target, "index.html"), `${target}.md`, `${target}.mdx`];
}

export function localTargetExists(source, rawTarget, root = process.cwd()) {
  const unwrapped = rawTarget.trim().replace(/^<|>$/g, "");
  if (!unwrapped || unwrapped.startsWith("#") || unwrapped.startsWith("//")) return true;
  if (/^https?:\/\//i.test(unwrapped) || /^mailto:/i.test(unwrapped)) return true;
  if (/^file:/i.test(unwrapped) || /^[A-Za-z]:[\\/]/.test(unwrapped)) return false;

  let pathname;
  try {
    pathname = decodeURIComponent(unwrapped.split(/[?#]/, 1)[0]);
  } catch {
    return false;
  }
  if (!pathname) return true;
  if (/^\/Users(?:\/|$)/.test(pathname)) return false;

  const candidates = targetCandidates(source, pathname, root);
  const boundary = pathname.startsWith("/") ? resolve(root) : publicBoundary(source, root);
  if (candidates.some((candidate) => !isWithin(candidate, boundary))) return false;
  return candidates.some(existsAsFile);
}

function safeTargetForOutput(rawTarget) {
  const target = rawTarget.trim();
  if (/^file:/i.test(target) || /^\/Users(?:\/|$)/.test(target) || /^[A-Za-z]:[\\/]/.test(target)) {
    return "[unsafe-local-target]";
  }
  return target;
}

export function extractMarkdownTargets(content) {
  const targets = [];
  const tokens = marked.lexer(content);
  marked.walkTokens(tokens, (token) => {
    if ((token.type === "link" || token.type === "image") && token.href) targets.push(token.href);
  });
  return targets;
}

function htmlTargets(content) {
  return [...content.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
}

function jsxTargets(content, file) {
  const targets = [];
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (ts.isJsxAttribute(node) && (node.name.text === "href" || node.name.text === "src") && node.initializer && ts.isStringLiteral(node.initializer)) {
      targets.push(node.initializer.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return targets;
}

function targetsFor(file, content) {
  const extension = extname(file);
  if (extension === ".tsx" || extension === ".jsx") return jsxTargets(content, file);
  if (extension === ".html") return htmlTargets(content);
  return [...extractMarkdownTargets(content), ...htmlTargets(content)];
}

export function checkLinks(files, root = process.cwd()) {
  const failures = [];
  for (const file of files) {
    const content = readFileSync(resolve(root, file), "utf8");
    for (const target of new Set(targetsFor(file, content))) {
      if (!localTargetExists(file, target, root)) {
        failures.push({ path: toPosix(file), target: safeTargetForOutput(target) });
      }
    }
  }
  return failures;
}

export function publicContentFiles(root = process.cwd()) {
  return collectPublicFiles(root).filter((file) => contentExtensions.has(extname(file)));
}

function main() {
  try {
    const files = publicContentFiles();
    const failures = checkLinks(files);
    if (failures.length > 0) {
      console.error("Internal link check failed:");
      for (const failure of failures) console.error(`${failure.path}: ${failure.target}`);
      process.exitCode = 1;
      return;
    }
    console.log(`Internal link check passed (${files.length} content files scanned).`);
  } catch (error) {
    const message = error instanceof Error && /symlink/i.test(error.message)
      ? error.message
      : "unable to inspect public content";
    console.error(`Internal link check failed: ${message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
