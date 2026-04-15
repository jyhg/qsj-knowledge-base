import type {
  AuditRecord,
  BusinessRuleDetail,
  ConfirmScopeInput,
  CreateFeedbackBatchInput,
  CreateTaskInput,
  DqcDeploymentSummary,
  DqcPublishDiffItem,
  DqcPublishTask,
  GitVersionSummary,
  KnowledgeCardDetail,
  ManualRunCandidate,
  ManualRunInput,
  ManualRunResult,
  NotificationItem,
  ObservationPoint,
  TableAssetDetail,
  TaskComparePayload,
  TaskDetail,
  TaskResultPayload,
  TaskRunSummary,
  TestCaseDetail,
  User
} from "@qsj/shared-types";

import {
  demoAudits,
  demoBusinessRules,
  demoCompare,
  demoDqcDeployments,
  demoDqcPublishDiffs,
  demoDqcPublishTask,
  demoGitVersions,
  demoKnowledgeCards,
  demoManualRunCandidates,
  demoManualRunResult,
  demoNotifications,
  demoObservationPoints,
  demoResult,
  demoRuns,
  demoTableAssets,
  demoTasks,
  demoTestCases,
  demoUser
} from "./demo-data";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001/api/v1";

async function requestJson<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      cache: "no-store"
    });
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

async function submitJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`API_REQUEST_FAILED:${path}`);
  }

  return (await response.json()) as T;
}

export function getCurrentUser(): Promise<User> {
  return requestJson("/me", demoUser);
}

// New table-first APIs

export function listTableAssets(): Promise<TableAssetDetail[]> {
  return requestJson("/tables", demoTableAssets);
}

export async function getTableAsset(tableId: string): Promise<TableAssetDetail> {
  const fallback = demoTableAssets.find((item) => item.id === tableId) ?? demoTableAssets[0];
  return requestJson(`/tables/${tableId}`, fallback);
}

export async function listTableTestCases(tableId: string): Promise<TestCaseDetail[]> {
  const fallback = demoTestCases.filter((item) => item.tableAssetId === tableId);
  return requestJson(`/tables/${tableId}/test-cases`, fallback);
}

export async function listTableObservationPoints(tableId: string): Promise<ObservationPoint[]> {
  const fallback = demoObservationPoints.filter((item) => item.tableAssetId === tableId);
  return requestJson(`/tables/${tableId}/observations`, fallback);
}

export async function listTableBusinessRules(tableId: string): Promise<BusinessRuleDetail[]> {
  const fallback = demoBusinessRules.filter((item) => item.tableAssetId === tableId);
  return requestJson(`/tables/${tableId}/business-rules`, fallback);
}

export async function getExecutionPublishSummary(tableId: string): Promise<{
  table: TableAssetDetail;
  oneServiceExecutableCount: number;
  recentBatchCount: number;
  recentAbnormalCount: number;
  dqcPublishedCount: number;
  dqcPendingCount: number;
  dqcUnmappedCount: number;
  suggestedDqcTestCases: TestCaseDetail[];
  deployments: DqcDeploymentSummary[];
}> {
  return requestJson(`/tables/${tableId}/execution-publish`, {
    table: demoTableAssets[0],
    oneServiceExecutableCount: 2,
    recentBatchCount: 1,
    recentAbnormalCount: 1,
    dqcPublishedCount: 1,
    dqcPendingCount: 0,
    dqcUnmappedCount: 1,
    suggestedDqcTestCases: demoTestCases.filter((item) => item.supportsDqc),
    deployments: demoDqcDeployments
  });
}

export function createManualRun(input: ManualRunInput) {
  return submitJson("/manual-runs", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function listManualRunCandidates(runId: string): Promise<ManualRunCandidate[]> {
  return requestJson(`/manual-runs/${runId}/candidates`, demoManualRunCandidates);
}

export function executeManualRun(runId: string, selectedTestCaseIds: string[]) {
  return submitJson<{ manualRunBatchId: string; status: string }>(`/manual-runs/${runId}/execute`, {
    method: "POST",
    body: JSON.stringify({ selectedTestCaseIds })
  });
}

export function getManualRunStatus(runId: string) {
  return requestJson(`/manual-runs/${runId}/status`, demoManualRunResult.batch);
}

export function getManualRunResults(runId: string): Promise<ManualRunResult | null> {
  const fallback = runId === demoManualRunResult.runId ? demoManualRunResult : null;
  return requestJson(`/manual-runs/${runId}/results`, fallback);
}

export function createManualRunFeedbackBatch(runId: string, input: CreateFeedbackBatchInput) {
  return submitJson(`/manual-runs/${runId}/feedback-batches`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function createDqcPublishTask(input: {
  title: string;
  tableIds: string[];
  createdBy?: string;
}) {
  return submitJson<DqcPublishTask>("/dqc-publish", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function generateDqcPublishDiff(publishId: string) {
  return submitJson<DqcPublishDiffItem[]>(`/dqc-publish/${publishId}/diff`, {
    method: "POST",
    body: JSON.stringify({})
  });
}

export function getDqcPublishDiff(publishId: string): Promise<DqcPublishDiffItem[]> {
  return requestJson(`/dqc-publish/${publishId}/diff`, demoDqcPublishDiffs);
}

export function confirmDqcPublishDiff(publishId: string) {
  return submitJson<{ publishId: string; status: string }>(`/dqc-publish/${publishId}/confirm`, {
    method: "POST",
    body: JSON.stringify({})
  });
}

export function syncDqcPublish(publishId: string) {
  return submitJson<{ publishId: string; status: string; mode: string }>(
    `/dqc-publish/${publishId}/sync`,
    {
      method: "POST",
      body: JSON.stringify({})
    }
  );
}

export function listGitVersions(): Promise<GitVersionSummary[]> {
  return requestJson("/versions", demoGitVersions);
}

export async function getGitVersion(versionId: string): Promise<GitVersionSummary> {
  const fallback = demoGitVersions.find((item) => item.id === versionId) ?? demoGitVersions[0];
  return requestJson(`/versions/${versionId}`, fallback);
}

// Legacy APIs retained for older pages

export function listTasks(): Promise<TaskDetail[]> {
  return requestJson("/tasks", demoTasks);
}

export async function getTask(taskId: string): Promise<TaskDetail> {
  const fallback = demoTasks.find((item) => item.id === taskId) ?? demoTasks[0];
  return requestJson(`/tasks/${taskId}`, fallback);
}

export async function listRuns(taskId: string): Promise<TaskRunSummary[]> {
  const fallback = demoRuns.filter((item) => item.taskId === taskId);
  return requestJson(`/tasks/${taskId}/runs`, fallback);
}

export async function getTaskResults(
  taskId: string,
  runId?: string
): Promise<TaskResultPayload | null> {
  if (!runId) {
    return null;
  }

  const fallback = runId === demoResult.run.id ? demoResult : null;
  return requestJson(`/tasks/${taskId}/runs/${runId}/results`, fallback);
}

export async function listAudits(taskId: string): Promise<AuditRecord[]> {
  return requestJson(`/tasks/${taskId}/audits`, demoAudits);
}

export function listKnowledgeCards(): Promise<KnowledgeCardDetail[]> {
  return requestJson("/knowledge/cards", demoKnowledgeCards);
}

export async function getKnowledgeCard(cardId: string): Promise<KnowledgeCardDetail> {
  const fallback = demoKnowledgeCards.find((item) => item.id === cardId) ?? demoKnowledgeCards[0];
  return requestJson(`/knowledge/cards/${cardId}`, fallback);
}

export function listNotifications(): Promise<NotificationItem[]> {
  return requestJson("/notifications", demoNotifications);
}

export function compareTaskRuns(taskId: string): Promise<TaskComparePayload> {
  return requestJson(`/compare/tasks/${taskId}?baseRunId=run_1&targetRunId=run_2`, demoCompare);
}

export function createTask(input: CreateTaskInput): Promise<TaskDetail> {
  return submitJson("/tasks", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function confirmTaskScope(taskId: string, input: ConfirmScopeInput) {
  return submitJson<{ taskId: string; status: string }>(`/tasks/${taskId}/confirm-scope`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function executeTask(taskId: string) {
  return submitJson<{ runId: string; status: string }>(`/tasks/${taskId}/execute`, {
    method: "POST",
    body: JSON.stringify({})
  });
}

export function createFeedbackBatch(taskId: string, input: CreateFeedbackBatchInput) {
  return submitJson<{ id: string; taskId: string; status: string }>(
    `/tasks/${taskId}/feedback-batches`,
    {
      method: "POST",
      body: JSON.stringify(input)
    }
  );
}
