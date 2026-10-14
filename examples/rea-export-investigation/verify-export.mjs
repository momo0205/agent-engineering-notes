import test from "node:test";
import assert from "node:assert/strict";

const targets = new Map([
  ["baseline", new URL("./baseline/app.mjs", import.meta.url)],
  ["defective", new URL("./defective/app.mjs", import.meta.url)],
  ["candidate", new URL("./candidate/app.mjs", import.meta.url)],
]);
const selected = process.env.REA_LAB_TARGET ?? "candidate";
assert.ok(targets.has(selected), "REA_LAB_TARGET must be baseline, defective or candidate");
const { exportReport } = await import(targets.get(selected).href);

test("a completed backend result maps to success", async () => {
  const result = await exportReport({ invoke: async () => ({ path: "report.csv" }) }, "sample");
  assert.deepEqual(result, { status: "success", message: "Exported" });
});

test("cancellation returns idle rather than success", async () => {
  const result = await exportReport({ invoke: async () => ({ canceled: true }) }, "sample");
  assert.deepEqual(result, { status: "idle", message: "" });
});

test("an explicit backend error maps to failed", async () => {
  const result = await exportReport({ invoke: async () => ({ error: "Access denied" }) }, "sample");
  assert.deepEqual(result, { status: "failed", message: "Access denied" });
});

test("the declared bridge channel receives the document payload", async () => {
  const calls = [];
  await exportReport({ invoke: async (...args) => {
    calls.push(args);
    return { path: "report.csv" };
  } }, "sample");
  assert.deepEqual(calls, [["report:export", { document: "sample" }]]);
});

test("a rejected backend promise remains a rejection", async () => {
  await assert.rejects(
    exportReport({ invoke: async () => { throw new Error("Bridge unavailable"); } }, "sample"),
    /Bridge unavailable/,
  );
});
