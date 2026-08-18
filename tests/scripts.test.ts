import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkLinks } from "../scripts/check-internal-links.mjs";
import { scanFiles } from "../scripts/scan-public-content.mjs";

describe("repository checks", () => {
  it("scans extensionless and configuration files while skipping binary files", () => {
    const root = mkdtempSync(join(tmpdir(), "notes-secret-check-"));
    const token = ["not-a-real", "token-value"].join("-");
    writeFileSync(join(root, "Dockerfile"), `PASSWORD=${token}\n`);
    writeFileSync(join(root, ".npmrc"), `_authToken=${token}\n`);
    writeFileSync(join(root, "binary.dat"), Buffer.from([0, 1, 2]));

    const result = scanFiles(["Dockerfile", ".npmrc", "binary.dat"], root);

    expect(result.scanned).toBe(2);
    expect(result.findings).toHaveLength(2);
  });

  it("understands public files, App Router pages, spaces, queries and fragments", () => {
    const root = mkdtempSync(join(tmpdir(), "notes-link-check-"));
    mkdirSync(join(root, "public"));
    mkdirSync(join(root, "app", "notes", "foo"), { recursive: true });
    mkdirSync(join(root, "docs"));
    writeFileSync(join(root, "public", "favicon.svg"), "<svg></svg>");
    writeFileSync(join(root, "app", "notes", "foo", "page.tsx"), "export default function Page() {};");
    writeFileSync(join(root, "docs", "path with spaces.md"), "# Target");
    writeFileSync(
      join(root, "README.md"),
      "[icon](/favicon.svg?v=1) [route](/notes/foo#top) [space](<docs/path with spaces.md>) [bad](missing.md)",
    );

    expect(checkLinks(["README.md"], root)).toEqual(["README.md: missing.md"]);
  });
});
