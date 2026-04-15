import { Injectable, NotFoundException } from "@nestjs/common";

import { dqcDeployments, dqcPublishDiffs, dqcPublishTasks, testCases } from "../../data/mock-store.js";

function nowIso() {
  return new Date().toISOString();
}

@Injectable()
export class DqcPublishService {
  create(input: { title: string; tableIds: string[]; createdBy?: string }) {
    const created = {
      id: `dqc_task_${dqcPublishTasks.length + 1}`,
      title: input.title,
      tableIds: input.tableIds,
      status: "draft" as const,
      createdBy: input.createdBy ?? "usr_dw_1",
      createdAt: nowIso()
    };
    dqcPublishTasks.unshift(created);
    return created;
  }

  private getTask(publishId: string) {
    const task = dqcPublishTasks.find((item) => item.id === publishId);
    if (!task) {
      throw new NotFoundException("DQC_PUBLISH_TASK_NOT_FOUND");
    }
    return task;
  }

  generateDiff(publishId: string) {
    const task = this.getTask(publishId);
    task.status = "diff_ready";
    const existingDiffs = dqcPublishDiffs.filter((item) => item.publishTaskId === publishId);
    if (existingDiffs.length > 0) {
      return existingDiffs;
    }

    const generated = testCases
      .filter((item) => task.tableIds.includes(item.tableAssetId) && item.supportsDqc)
      .map((item, index) => {
        const deployment = dqcDeployments.find((candidate) => candidate.testCaseId === item.id);
        return {
          id: `dqc_diff_${dqcPublishDiffs.length + index + 1}`,
          publishTaskId: publishId,
          tableAssetId: item.tableAssetId,
          testCaseId: item.id,
          currentDqcStatus: deployment?.publishStatus ?? "unpublished",
          suggestedAction: deployment ? "update" : "create",
          reason: deployment ? "已有 DQC 配置，需按最新知识更新" : "高风险且适合纳入长期监控",
          selected: true
        } as const;
      });

    dqcPublishDiffs.push(...generated);
    return generated;
  }

  getDiff(publishId: string) {
    this.getTask(publishId);
    return dqcPublishDiffs.filter((item) => item.publishTaskId === publishId);
  }

  confirm(publishId: string) {
    const task = this.getTask(publishId);
    task.status = "pending_confirm";
    return { publishId, status: task.status };
  }

  sync(publishId: string) {
    const task = this.getTask(publishId);
    task.status = "completed";
    return { publishId, status: task.status, mode: "mock_sync" };
  }
}
