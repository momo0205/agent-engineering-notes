export async function exportReport(bridge, document) {
  const reply = await bridge.invoke("report:export", { document });
  if (reply.canceled) return { status: "idle", message: "" };
  if (reply.error) return { status: "failed", message: reply.error };
  return { status: "success", message: "Exported" };
}
