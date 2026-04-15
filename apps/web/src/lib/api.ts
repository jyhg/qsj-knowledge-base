import type {
  AuditRecord,
  ConfirmScopeInput,
  CreateFeedbackBatchInput,
  CreateTaskInput,
  KnowledgeCardDetail,
  NotificationItem,
  TaskComparePayload,
  TaskDetail,
  TaskResultPayload,
  TaskRunSummary,
  User
} from "@qsj/shared-types";

import {
  demoAudits,
  demoCompare,
  demoKnowledgeCards,
  demoNotifications,
  demoResult,
  demoRuns,
  demoTasks,
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
