import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateFeedbackBatchInput,
  ManualRunInput,
  ManualRunResult
} from "@qsj/shared-types";

import {
  businessRules,
  feedbackBatches,
  manualRunBatches,
  manualRunFindings,
  manualRunResults,
  manualRuns,
  testCases
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
    const run = this.get(runId);
    return testCases
      .filter(
        (item) =>
          run.tableIds.includes(item.tableAssetId) &&
          item.supportsOneService &&
          item.supportedScenes.includes(run.scene as ManualRunInput["scene"])
      )
      .map((item) => ({
        tableId: item.tableAssetId,
        testCaseId: item.id,
        testCaseName: item.name,
        channel: item.channel,
        riskLevel: item.riskLevel,
        recommendationReason:
          item.businessRuleIds.length > 0
            ? `命中业务规则 ${item.businessRuleIds.join(" / ")}`
            : `命中 ${item.testCaseType} 类型检查`
      }));
  }

  execute(runId: string, selectedTestCaseIds: string[]) {
    const run = this.get(runId);
    const effectiveTestCaseIds =
      selectedTestCaseIds.length > 0
        ? selectedTestCaseIds
        : this.listCandidates(runId).map((item) => item.testCaseId);

    run.status = "pending_feedback";
    const batch = {
      id: `mrb_${manualRunBatches.length + 1}`,
      manualRunId: runId,
      oneServiceRequestId: `os_${Date.now()}`,
      status: "succeeded" as const,
      triggeredBy: run.executorUserId,
      startedAt: nowIso(),
      finishedAt: nowIso()
    };
    manualRunBatches.unshift(batch);

    const generatedFindings = effectiveTestCaseIds.map((testCaseId, index) => {
      const testCase = testCases.find((item) => item.id === testCaseId);
      const existingFinding = manualRunFindings.find((item) => item.testCaseId === testCaseId);

      if (existingFinding && testCase) {
        return {
          ...existingFinding,
          id: `mrf_${manualRunFindings.length + index + 1}`,
          batchId: batch.id
        };
      }

      const businessRuleId = testCase?.businessRuleIds[0] ?? null;
      const businessRule = businessRuleId
        ? businessRules.find((item) => item.id === businessRuleId)
        : null;

      return {
        id: `mrf_${manualRunFindings.length + index + 1}`,
        batchId: batch.id,
        tableAssetId: testCase?.tableAssetId ?? run.tableIds[0],
        testCaseId,
        businessRuleId,
        resultStatus: testCase?.lastResultStatus ?? "passed",
        findingSummary:
          testCase?.lastResultStatus === "failed"
            ? `${testCase.name} 命中异常，请优先排查 SQL 与维度映射。`
            : testCase?.lastResultStatus === "warning"
              ? `${testCase.name} 出现预警，需要进一步确认波动是否合理。`
              : `${testCase?.name ?? testCaseId} 检查通过。`,
        abnormalDimensions: [],
        evidence: {},
        oneServiceSummary: businessRule?.analysisHint ?? testCase?.logicDesc ?? null,
        sortScore: Math.max(10, 100 - index * 10)
      };
    });

    const referencedBusinessRuleIds = Array.from(
      new Set(
        generatedFindings
          .map((item) => item.businessRuleId)
          .filter((item): item is string => Boolean(item))
      )
    );

    const generatedResult: ManualRunResult = {
      runId,
      batch,
      findings: generatedFindings,
      oneServiceRequestId: batch.oneServiceRequestId,
      referencedBusinessRuleIds
    };

    const existingResultIndex = manualRunResults.findIndex((item) => item.runId === runId);
    if (existingResultIndex >= 0) {
      manualRunResults.splice(existingResultIndex, 1, generatedResult);
    } else {
      manualRunResults.unshift(generatedResult);
    }

    return {
      manualRunBatchId: batch.id,
      status: batch.status,
      selectedTestCaseIds: effectiveTestCaseIds
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
