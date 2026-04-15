import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  ConfirmScopeInput,
  CreateFeedbackBatchInput,
  CreateTaskInput,
  TaskCheckFinding,
  TaskDetail,
  TaskResultPayload,
  TaskRunSummary,
  UpdateTaskInput
} from "@qsj/shared-types";

import { audits, findings, notifications, taskRuns, tasks } from "../../data/mock-store.js";
import { OneServiceSqlExecutorService } from "./one-service-sql-executor.service.js";

function nowIso() {
  return new Date().toISOString();
}

function resolveMetricName(metricCode: string) {
  const metricNameMap: Record<string, string> = {
    metric_roi: "ROI",
    metric_order_cnt: "订单数",
    metric_spend: "消耗",
    metric_conversion_rate: "转化率"
  };

  return metricNameMap[metricCode] ?? metricCode;
}

function generateAnalysisValidationSqls(task: TaskDetail) {
  const sqls = [
    {
      sqlType: "table_base_check",
      sql: `select dt, count(*) as row_count from ${task.targetTable} where dt between '${task.businessDateStart}' and '${task.businessDateEnd}' group by dt order by dt`
    },
    ...task.targetMetrics.map((metric) => ({
      sqlType: `metric_check:${metric.metricCode}`,
      sql: `select dt, ${metric.metricCode} from ${task.targetTable} where dt between '${task.businessDateStart}' and '${task.businessDateEnd}' order by dt limit 200`
    }))
  ];

  if (task.extraSql?.trim()) {
    sqls.push({
      sqlType: "adhoc_probe",
      sql: task.extraSql.trim()
    });
  }

  return sqls;
}

function buildTaskFindings(task: TaskDetail, runId: string): TaskCheckFinding[] {
  const tableFinding: TaskCheckFinding =
    task.scene === "analysis_validation"
      ? {
          id: `finding_${findings.length + 1}`,
          runId,
          level: "table",
          checkType: "row_count_volatility",
          riskLevel: "high",
          status: "failed",
          findingSummary: `${task.targetTable} 行数较近 7 日基线下降 18%。`,
          impactScope: `${task.targetTable} 全表`,
          evidence: { current: 182341, baselineAvg: 223004 },
          ruleId: "rule_1",
          sortScore: 92
        }
      : {
          id: `finding_${findings.length + 1}`,
          runId,
          level: "table",
          checkType: "partition_completeness",
          riskLevel: "high",
          status: "failed",
          findingSummary: `${task.targetTable} 最新业务日分区存在缺失。`,
          impactScope: `${task.targetTable} / dt=${task.businessDateEnd}`,
          evidence: { missingPartitions: [task.businessDateEnd] },
          ruleId: "rule_4",
          sortScore: 90
        };

  const metricFindings = task.targetMetrics.map((metric, index) => {
    const isEven = index % 2 === 0;
    if (task.scene === "analysis_validation") {
      const riskLevel: TaskCheckFinding["riskLevel"] = isEven ? "high" : "medium";
      const status: TaskCheckFinding["status"] = isEven ? "failed" : "warning";

      return {
        id: `finding_${findings.length + 2 + index}`,
        runId,
        level: "metric" as const,
        metricCode: metric.metricCode,
        checkType: isEven ? "metric_volatility" : "dimension_coverage",
        riskLevel,
        status,
        findingSummary: isEven
          ? `${metric.metricName} 在平台/玩法组合下出现异常波动。`
          : `${metric.metricName} 在核心维度覆盖率检查中低于阈值。`,
        impactScope: `${metric.metricCode} / simulated`,
        evidence: { simulated: true, scene: task.scene },
        sortScore: 82 - index * 8
      };
    }

    const riskLevel: TaskCheckFinding["riskLevel"] = isEven ? "high" : "medium";
    const status: TaskCheckFinding["status"] = isEven ? "failed" : "warning";

    return {
      id: `finding_${findings.length + 2 + index}`,
      runId,
      level: "metric" as const,
      metricCode: metric.metricCode,
      checkType: isEven ? "metric_volatility" : "upstream_reconciliation",
      riskLevel,
      status,
      findingSummary: isEven
        ? `${metric.metricName} DQC 波动检查命中异常。`
        : `${metric.metricName} 与上游对账结果存在偏差。`,
      impactScope: `${metric.metricCode} / simulated`,
      evidence: { simulated: true, scene: task.scene },
      sortScore: 80 - index * 8
    };
  });

  return [tableFinding, ...metricFindings] satisfies TaskCheckFinding[];
}

@Injectable()
export class TasksService {
  constructor(private readonly oneServiceSqlExecutor: OneServiceSqlExecutorService) {}

  list() {
    return tasks;
  }

  get(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      throw new NotFoundException("TASK_NOT_FOUND");
    }
    return task;
  }

  create(input: CreateTaskInput): TaskDetail {
    const task: TaskDetail = {
      id: `task_${tasks.length + 1}`,
      title: input.title,
      scene: input.scene,
      targetTable: input.targetTable,
      targetMetrics: input.targetMetricIds.map((metricCode) => ({
        metricCode,
        metricName: resolveMetricName(metricCode)
      })),
      requirementDesc: input.requirementDesc,
      changeDesc: input.changeDesc,
      businessDateStart: input.businessDateStart,
      businessDateEnd: input.businessDateEnd,
      executorUserId: input.executorUserId,
      pmUserId: input.pmUserId,
      status: "draft",
      hasPendingFeedback: false,
      lastRunAt: null,
      extraSql: input.extraSql ?? null
    };
    tasks.unshift(task);
    return task;
  }

  update(taskId: string, input: UpdateTaskInput) {
    const task = this.get(taskId);
    const touchedKeyField = Boolean(
      input.targetTable ||
        input.targetMetricIds ||
        input.businessDateStart ||
        input.businessDateEnd
    );

    if (input.title) task.title = input.title;
    if (input.scene) task.scene = input.scene;
    if (input.targetTable) task.targetTable = input.targetTable;
    if (input.targetMetricIds) {
      task.targetMetrics = input.targetMetricIds.map((metricCode) => ({
        metricCode,
        metricName: resolveMetricName(metricCode)
      }));
    }
    if (input.requirementDesc) task.requirementDesc = input.requirementDesc;
    if (input.changeDesc) task.changeDesc = input.changeDesc;
    if (input.businessDateStart) task.businessDateStart = input.businessDateStart;
    if (input.businessDateEnd) task.businessDateEnd = input.businessDateEnd;
    if (input.executorUserId) task.executorUserId = input.executorUserId;
    if (input.pmUserId) task.pmUserId = input.pmUserId;
    if (input.extraSql !== undefined) task.extraSql = input.extraSql;

    if (touchedKeyField && task.lastRunAt) {
      task.status = "pending_scope_confirmation";
      for (const run of taskRuns.filter((item) => item.taskId === taskId)) {
        run.status = "stale";
      }
      notifications.unshift({
        id: `notice_${notifications.length + 1}`,
        userId: task.executorUserId,
        taskId,
        type: "rerun_notice",
        title: "任务结果已失效",
        content: `任务 ${task.title} 修改关键字段后需要重新执行。`,
        status: "unread",
        createdAt: nowIso()
      });
    }

    return task;
  }

  confirmScope(taskId: string, input: ConfirmScopeInput) {
    const task = this.get(taskId);
    audits.unshift({
      id: `audit_${audits.length + 1}`,
      entityType: "task_scope_confirmation",
      entityId: taskId,
      action: "confirm_scope",
      operatorUserId: task.pmUserId,
      operatorRole: "pm",
      detail: {
        selectedImplementationIds: input.selectedImplementationIds,
        comment: input.comment
      },
      createdAt: nowIso()
    });
    return { taskId, status: task.status };
  }

  async execute(taskId: string) {
    const task = this.get(taskId);
    task.status = "running";
    const run: TaskRunSummary = {
      id: `run_${taskRuns.length + 1}`,
      taskId,
      runNo: taskRuns.filter((item) => item.taskId === taskId).length + 1,
      scene: task.scene,
      status: "succeeded",
      startedAt: nowIso(),
      finishedAt: nowIso(),
      triggeredBy: task.executorUserId
    };
    taskRuns.unshift(run);

    try {
      const executionSummary =
        task.scene === "analysis_validation"
          ? await this.oneServiceSqlExecutor.executeReadOnlySqls({
              sqls: generateAnalysisValidationSqls(task),
              taskRunId: run.id,
              submittedBy: task.executorUserId
            })
          : null;

      buildTaskFindings(task, run.id)
        .reverse()
        .forEach((finding) => {
          findings.unshift(finding);
        });

      run.status = "succeeded";
      run.finishedAt = nowIso();
      task.status = "pending_feedback";
      task.hasPendingFeedback = true;
      task.lastRunAt = run.finishedAt;

      audits.unshift({
        id: `audit_${audits.length + 1}`,
        entityType:
          task.scene === "analysis_validation"
            ? "task_run_sql_execution"
            : "task_run_dqc_execution",
        entityId: run.id,
        action: task.scene === "analysis_validation" ? "execute_sql" : "execute_dqc",
        operatorUserId: task.executorUserId,
        operatorRole: "dw_developer",
        detail: {
          taskId,
          runNo: run.runNo,
          sqlSummary:
            task.scene === "analysis_validation"
              ? `生成 ${executionSummary?.sqlCount ?? 0} 条只读验数 SQL，并通过 ${
                  executionSummary?.mode === "one_service" ? "one service" : "mock executor"
                } 执行`
              : undefined,
          dqcRuleSummary:
            task.scene === "delivery_dqc"
              ? `生成 ${task.targetMetrics.length + 2} 条 DQC 规则，并完成 mock 执行`
              : undefined,
          executionMode: executionSummary?.mode ?? "mock",
          oneServiceJobIds: executionSummary?.executions.map((item) => item.jobId).filter(Boolean),
          sqlExecutions: executionSummary?.executions.map((item) => ({
            sqlType: item.sqlType,
            status: item.status,
            rowCount: item.rowCount,
            jobId: item.jobId
          })),
          resultRowCount: findings.filter((item) => item.runId === run.id).length + task.targetMetrics.length + 1,
          executionStatus: "succeeded"
        },
        createdAt: nowIso()
      });
    } catch (error) {
      run.status = "failed";
      run.finishedAt = nowIso();
      task.status = "pending_scope_confirmation";
      task.hasPendingFeedback = false;
      task.lastRunAt = run.finishedAt;

      audits.unshift({
        id: `audit_${audits.length + 1}`,
        entityType: "task_run_sql_execution",
        entityId: run.id,
        action: "execute_sql",
        operatorUserId: task.executorUserId,
        operatorRole: "dw_developer",
        detail: {
          taskId,
          runNo: run.runNo,
          executionStatus: "failed",
          errorMessage: error instanceof Error ? error.message : "ONE_SERVICE_EXECUTION_FAILED"
        },
        createdAt: nowIso()
      });

      throw error;
    }

    return { runId: run.id, status: "succeeded" };
  }

  listRuns(taskId: string) {
    this.get(taskId);
    return taskRuns.filter((item) => item.taskId === taskId);
  }

  getRun(taskId: string, runId: string) {
    this.get(taskId);
    const run = taskRuns.find((item) => item.taskId === taskId && item.id === runId);
    if (!run) {
      throw new NotFoundException("RUN_NOT_FOUND");
    }
    return run;
  }

  getRunResults(taskId: string, runId: string): TaskResultPayload {
    const run = this.getRun(taskId, runId);
    return {
      run,
      findings: findings.filter((item) => item.runId === runId),
      referencedKnowledgeIds: ["card_1"]
    };
  }

  listAudits(taskId: string) {
    this.get(taskId);
    return audits.filter(
      (item) => item.entityId === taskId || taskRuns.some((run) => run.taskId === taskId && run.id === item.entityId)
    );
  }

  createFeedbackBatch(taskId: string, input: CreateFeedbackBatchInput) {
    const task = this.get(taskId);
    task.status = "completed";
    task.hasPendingFeedback = false;
    audits.unshift({
      id: `audit_${audits.length + 1}`,
      entityType: "feedback_batch",
      entityId: taskId,
      action: "confirm_feedback_batch",
      operatorUserId: task.executorUserId,
      operatorRole: "dw_developer",
      detail: input as unknown as Record<string, unknown>,
      createdAt: nowIso()
    });
    return {
      id: `feedback_${taskId}_${Date.now()}`,
      taskId,
      status: "confirmed"
    };
  }
}
