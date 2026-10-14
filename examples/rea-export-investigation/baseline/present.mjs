export function presentExportResult(result) {
  if (result.canceled) return { status: "idle", message: "" };
  if (result.error) return { status: "failed", message: result.error };
  return { status: "success", message: "Exported" };
}
