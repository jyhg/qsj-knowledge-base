import type {
  CheckLevel,
  RiskLevel,
  RunStatus,
  TaskDetail,
  TaskScene,
  TaskStatus
} from "@qsj/shared-types";

const sceneLabels: Record<TaskScene, string> = {
  analysis_validation: "分析验数",
  development_self_test: "开发自测",
  delivery_dqc: "需求交付"
};

const statusLabels: Record<TaskStatus, string> = {
  draft: "待填写",
  pending_scope_confirmation: "待确认口径",
  running: "执行中",
  pending_feedback: "待确认回写",
  completed: "已完成"
};

const riskLabels: Record<RiskLevel, string> = {
  high: "高风险",
  medium: "中风险",
  low: "低风险"
};

const runStatusLabels: Record<RunStatus, string> = {
  queued: "排队中",
  running: "执行中",
  succeeded: "执行成功",
  failed: "执行失败",
  stale: "结果失效"
};

const levelLabels: Record<CheckLevel, string> = {
  table: "表级",
  metric: "指标级",
  deep_validation: "深度校验"
};

const checkTypeLabels: Record<string, string> = {
  row_count_volatility: "行数波动",
  metric_volatility: "核心指标波动",
  dimension_coverage: "核心维度覆盖率",
  partition_completeness: "分区完整性",
  upstream_reconciliation: "上下游对账"
};

export function getSceneLabel(scene: TaskScene) {
  return sceneLabels[scene];
}

export function getStatusLabel(status: TaskStatus) {
  return statusLabels[status];
}

export function getRiskLabel(risk: RiskLevel) {
  return riskLabels[risk];
}

export function getRunStatusLabel(status: RunStatus) {
  return runStatusLabels[status];
}

export function getLevelLabel(level: CheckLevel) {
  return levelLabels[level];
}

export function getCheckTypeLabel(checkType: string) {
  return checkTypeLabels[checkType] ?? checkType;
}

export function getExecutionActionLabel(scene: TaskScene) {
  return scene === "analysis_validation" ? "生成并执行验数 SQL" : "生成并执行 DQC 检查";
}

export function getExecutionPlan(task: TaskDetail) {
  const baseChecks = [
    "固定基础检查：行数波动、空值率、主键唯一性、核心指标波动、维度分布变化、上下游对账、核心维度覆盖率、分区完整性"
  ];

  const sceneSpecific =
    task.scene === "analysis_validation"
      ? [
          `深度校验指标：${task.targetMetrics.map((item) => item.metricName).join("、")}`,
          task.extraSql ? `附加探查 SQL：${task.extraSql}` : "未提供附加探查 SQL"
        ]
      : [
          `生成 DQC 规则包：覆盖 ${task.targetMetrics.map((item) => item.metricName).join("、")}`,
          "当前 DQC 为 mock 执行，用于先验证流程与信息架构"
        ];

  return [...baseChecks, ...sceneSpecific];
}
