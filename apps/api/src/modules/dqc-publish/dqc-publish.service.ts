import { Injectable, NotFoundException } from "@nestjs/common";

import { dqcPublishDiffs, dqcPublishTasks } from "../../data/mock-store.js";

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
    return dqcPublishDiffs.filter((item) => item.publishTaskId === publishId);
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
