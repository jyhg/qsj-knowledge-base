"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  confirmTaskScope,
  createFeedbackBatch,
  createTask,
  executeTask
} from "../../lib/api";

function parseMetricIds(raw: FormDataEntryValue | null) {
  return String(raw ?? "")
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createTaskAction(formData: FormData) {
  const task = await createTask({
    title: String(formData.get("title") ?? ""),
    scene: String(formData.get("scene") ?? "analysis_validation") as
      | "analysis_validation"
      | "delivery_dqc",
    targetTable: String(formData.get("targetTable") ?? ""),
    targetMetricIds: parseMetricIds(formData.get("targetMetricIds")),
    requirementDesc: String(formData.get("requirementDesc") ?? ""),
    changeDesc: String(formData.get("changeDesc") ?? ""),
    businessDateStart: String(formData.get("businessDateStart") ?? ""),
    businessDateEnd: String(formData.get("businessDateEnd") ?? ""),
    executorUserId: "usr_dw_1",
    pmUserId: "usr_pm_1",
    extraSql: String(formData.get("extraSql") ?? "")
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  redirect(`/tasks/${task.id}`);
}

export async function confirmScopeAction(taskId: string, selectedImplementationIds: string[]) {
  await confirmTaskScope(taskId, {
    selectedImplementationIds,
    comment: "MVP 模拟记录：当前任务口径冲突已由 PM 确认。"
  });

  revalidatePath(`/tasks/${taskId}`);
  redirect(`/tasks/${taskId}`);
}

export async function executeTaskAction(taskId: string) {
  await executeTask(taskId);
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/tasks/${taskId}/history`);
  revalidatePath(`/tasks/${taskId}/audit`);
  redirect(`/tasks/${taskId}`);
}

export async function submitFeedbackAction(taskId: string, runId: string) {
  await createFeedbackBatch(taskId, {
    runId,
    reason: "从真实异常任务中沉淀可复用规则",
    applicableScene: "分析验数 + 需求交付",
    items: [
      {
        itemType: "anomaly_pattern",
        sourceId: `${taskId}_pattern`,
        selected: true
      },
      {
        itemType: "sql_template",
        sourceId: `${taskId}_sql`,
        selected: true
      },
      {
        itemType: "scope_decision",
        sourceId: `${taskId}_scope`,
        selected: true
      }
    ]
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/tasks/${taskId}/feedback`);
  redirect(`/tasks/${taskId}`);
}
