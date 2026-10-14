import { presentExportResult } from "./present.mjs";

export async function exportReport(bridge, document) {
  const result = await bridge.invoke("report:export", { document });
  return presentExportResult(result);
}
