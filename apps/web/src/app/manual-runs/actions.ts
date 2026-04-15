"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createManualRun, executeManualRun } from "../../lib/api";

function getStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

export async function createManualRunAction(formData: FormData) {
  const tableIds = getStringList(formData, "tableIds");
  const metricCodes = String(formData.get("metricCodes") ?? "")
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const created = await createManualRun({
    title: String(formData.get("title") ?? "").trim(),
    scene: String(formData.get("scene") ?? "analysis_validation") as
      | "analysis_validation"
      | "development_self_test",
    tableIds,
    metricCodes,
    requirementDesc: String(formData.get("requirementDesc") ?? "").trim(),
    changeDesc: String(formData.get("changeDesc") ?? "").trim(),
    businessDateStart: String(formData.get("businessDateStart") ?? "").trim(),
    businessDateEnd: String(formData.get("businessDateEnd") ?? "").trim(),
    executorUserId: "usr_dw_1"
  });

  revalidatePath("/");
  revalidatePath("/manual-runs/new");
  redirect(
    `/manual-runs/${created.id}/select${tableIds[0] ? `?tableId=${encodeURIComponent(tableIds[0])}` : ""}`
  );
}

export async function executeManualRunAction(runId: string, formData: FormData) {
  const selectedTestCaseIds = getStringList(formData, "selectedTestCaseIds");

  await executeManualRun(runId, selectedTestCaseIds);

  revalidatePath("/");
  revalidatePath(`/manual-runs/${runId}/select`);
  revalidatePath(`/manual-runs/${runId}/executing`);
  revalidatePath(`/manual-runs/${runId}/results`);
  revalidatePath(`/manual-runs/${runId}/feedback`);
  redirect(`/manual-runs/${runId}/executing`);
}
