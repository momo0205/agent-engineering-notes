import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type LockPackage = { resolved?: string };
type PackageLock = { packages?: Record<string, LockPackage> };

describe("public package lock", () => {
  it("resolves registry packages only from the public npm registry", () => {
    const lock = JSON.parse(
      readFileSync("package-lock.json", "utf8"),
    ) as PackageLock;
    const registryHosts = Object.values(lock.packages ?? {})
      .flatMap(({ resolved }) => resolved ? [new URL(resolved).hostname] : [])
      .filter((hostname) => hostname.includes("npm"));

    expect(new Set(registryHosts)).toEqual(new Set(["registry.npmjs.org"]));
  });
});
