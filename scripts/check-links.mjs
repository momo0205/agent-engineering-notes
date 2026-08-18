import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";

const root = process.cwd();
const contentExtensions = new Set([".html", ".md", ".mdx"]);
const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean)
  .filter((file) => contentExtensions.has(extname(file)));

function localTargetExists(source, rawTarget) {
  const target = rawTarget.trim().replace(/^<|>$/g, "").split(/[?#]/, 1)[0];
  if (!target || /^(?:[a-z]+:|#|\/\/)/i.test(target)) return true;

  const candidate = target.startsWith("/")
    ? resolve(root, `.${decodeURIComponent(target)}`)
    : resolve(root, dirname(source), decodeURIComponent(target));
  if (!candidate.startsWith(`${normalize(root)}/`) && candidate !== normalize(root)) return false;
  if (existsSync(candidate)) return true;
  return [join(candidate, "index.html"), `${candidate}.md`, `${candidate}.mdx`].some(existsSync);
}

const failures = [];
for (const file of files) {
  const content = readFileSync(file, "utf8");
  const targets = [
    ...content.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g),
    ...content.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi),
  ].map((match) => match[1]);

  for (const target of targets) {
    if (!localTargetExists(file, target)) failures.push(`${file}: ${target}`);
  }
}

if (failures.length > 0) {
  console.error(["Internal link check failed:", ...failures].join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Internal link check passed (${files.length} content files scanned).`);
}
