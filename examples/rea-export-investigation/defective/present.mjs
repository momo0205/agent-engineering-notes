export function presentExportResult(result) {
  if (result.error) return { status: "failed", message: result.error };
  return { status: "success", message: "Exported" };
}
