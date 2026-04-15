import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateFeedbackBatchInput, ManualRunInput } from "@qsj/shared-types";

import {
  feedbackBatches,
  manualRunBatches,
  manualRunCandidates,
  manualRunResults,
  manualRuns
} from "../../data/mock-store.js";

function nowIso() {
  return new Date().toISOString();
}

@Injectable()
export class ManualRunsService {
  list() {
    return manualRuns;
  }

  create(input: ManualRunInput) {
    const created = {
      id: `mr_${manualRuns.length + 1}`,
      ...input,
      status: "selecting" as const,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    manualRuns.unshift(created);
    return created;
  }

  get(runId: string) {
    const run = manualRuns.find((item) => item.id === runId);
    if (!run) {
      throw new NotFoundException("MANUAL_RUN_NOT_FOUND");
    }
    return run;
  }

  listCandidates(runId: string) {
    this.get(runId);
    return manualRunCandidates;
  }

  execute(runId: string, selectedTestCaseIds: string[]) {
    const run = this.get(runId);
    run.status = "running";
    const batch = {
      id: `mrb_${manualRunBatches.length + 1}`,
      manualRunId: runId,
      oneServiceRequestId: `os_${Date.now()}`,
      status: "queued" as const,
      triggeredBy: run.executorUserId,
      startedAt: nowIso(),
      finishedAt: null
    };
    manualRunBatches.unshift(batch);
    return {
      manualRunBatchId: batch.id,
      status: batch.status,
      selectedTestCaseIds
    };
  }

  getStatus(runId: string) {
    this.get(runId);
    return manualRunBatches.find((item) => item.manualRunId === runId) ?? null;
  }

  getResults(runId: string) {
    this.get(runId);
    return manualRunResults.find((item) => item.runId === runId) ?? null;
  }

  createFeedbackBatch(runId: string, input: CreateFeedbackBatchInput) {
    this.get(runId);
    const batch = {
      id: `fb_${feedbackBatches.length + 1}`,
      manualRunId: runId,
      reason: input.reason,
      applicableScenesJson: JSON.stringify(input.applicableScenes),
      status: "pending",
      confirmedBy: null,
      createdAt: nowIso(),
      confirmedAt: null
    };
    feedbackBatches.unshift(batch);
    return batch;
  }
}
