import type {
  AuditRecord,
  KnowledgeCardDetail,
  NotificationItem,
  TaskComparePayload,
  TaskDetail,
  TaskResultPayload,
  TaskRunSummary,
  User
} from "@qsj/shared-types";

export const demoUser: User = {
  id: "usr_dw_1",
  name: "数仓开发A",
  role: "dw_developer"
};

export const demoTasks: TaskDetail[] = [
  {
    id: "task_1",
    title: "4月第一周投放归因验数",
    scene: "analysis_validation",
    targetTable: "ads_attribution_daily",
    targetMetrics: [
      { metricCode: "metric_order_cnt", metricName: "订单数" },
      { metricCode: "metric_roi", metricName: "ROI" }
    ],
    requirementDesc: "查看4月第一周不同平台和玩法下的归因表现。",
    changeDesc: "新增投放玩法维度，调整ROI计算口径。",
    businessDateStart: "2026-04-01",
    businessDateEnd: "2026-04-07",
    executorUserId: "usr_dw_1",
    pmUserId: "usr_pm_1",
    status: "pending_feedback",
    lastRunAt: "2026-04-14T10:00:00.000Z",
    hasPendingFeedback: true,
    extraSql: null
  },
  {
    id: "task_2",
    title: "达人投放周报需求交付验收",
    scene: "delivery_dqc",
    targetTable: "ads_delivery_daily",
    targetMetrics: [
      { metricCode: "metric_spend", metricName: "消耗" },
      { metricCode: "metric_conversion_rate", metricName: "转化率" }
    ],
    requirementDesc: "交付达人投放周报，要求覆盖平台、达人、素材、地域维度的稳定输出。",
    changeDesc: "新增达人层级汇总逻辑，并调整转化率口径。",
    businessDateStart: "2026-04-08",
    businessDateEnd: "2026-04-14",
    executorUserId: "usr_dw_1",
    pmUserId: "usr_pm_1",
    status: "draft",
    lastRunAt: null,
    hasPendingFeedback: false,
    extraSql: null
  }
];

export const demoRuns: TaskRunSummary[] = [
  {
    id: "run_1",
    taskId: "task_1",
    runNo: 1,
    scene: "analysis_validation",
    status: "succeeded",
    startedAt: "2026-04-14T10:00:00.000Z",
    finishedAt: "2026-04-14T10:03:00.000Z",
    triggeredBy: "usr_dw_1"
  }
];

export const demoResult: TaskResultPayload = {
  run: demoRuns[0],
  referencedKnowledgeIds: ["card_1"],
  findings: [
    {
      id: "finding_1",
      runId: "run_1",
      level: "table",
      checkType: "row_count_volatility",
      riskLevel: "high",
      status: "failed",
      findingSummary: "表级行数较过去7日均值下降 32%。",
      impactScope: "ads_attribution_daily 全表",
      evidence: { current: 120034, baselineAvg: 176982 },
      ruleId: "rule_1",
      sortScore: 95
    },
    {
      id: "finding_2",
      runId: "run_1",
      level: "metric",
      metricCode: "metric_roi",
      checkType: "metric_volatility",
      riskLevel: "high",
      status: "failed",
      findingSummary: "ROI 在平台=抖音、玩法=直播间维度异常波动。",
      impactScope: "metric_roi / platform=douyin / play=live",
      evidence: { current: 1.12, baselineAvg: 2.31 },
      ruleId: "rule_2",
      sortScore: 90
    },
    {
      id: "finding_3",
      runId: "run_1",
      level: "metric",
      metricCode: "metric_order_cnt",
      checkType: "dimension_coverage",
      riskLevel: "medium",
      status: "warning",
      findingSummary: "账号维度覆盖率低于知识库阈值。",
      impactScope: "metric_order_cnt / account",
      evidence: { coverageRate: 0.71, threshold: 0.85 },
      ruleId: "rule_3",
      sortScore: 65
    }
  ]
};

export const demoKnowledgeCards: KnowledgeCardDetail[] = [
  {
    id: "card_1",
    metricCode: "metric_roi",
    metricName: "ROI",
    tableName: "ads_attribution_daily",
    businessGrain: "日 + 平台 + 玩法",
    isStandard: true,
    ownerUserId: "usr_pm_1",
    status: "active",
    currentVersionNo: 3,
    businessDefinition: "投放回报率，按归因订单收入 / 消耗计算。",
    dimensions: ["platform", "channel", "account", "play_type", "dt"],
    createMode: "copy_task",
    reason: "从历史异常任务沉淀",
    applicableScene: "分析验数",
    rules: [
      {
        id: "rule_2",
        name: "ROI 波动检查",
        ruleType: "volatility",
        checkObject: "metric_roi",
        logicDesc: "按平台、玩法和日期检查 ROI 与近 7 日均值偏差。",
        thresholdDesc: "绝对偏差 > 30%",
        riskLevel: "high",
        ruleLevel: "deep_validation",
        triggerCondition: "命中 ROI 改动点后执行",
        sqlTemplate: "select platform, play_type, dt, roi from ..."
      }
    ]
  }
];

export const demoAudits: AuditRecord[] = [
  {
    id: "audit_1",
    entityType: "task_run_sql_execution",
    entityId: "run_1",
    action: "execute_sql",
    operatorUserId: "usr_dw_1",
    operatorRole: "dw_developer",
    detail: {
      sqlSummary: "table level checks for ads_attribution_daily",
      resultRowCount: 3,
      executionStatus: "succeeded"
    },
    createdAt: "2026-04-14T10:01:00.000Z"
  }
];

export const demoNotifications: NotificationItem[] = [
  {
    id: "notice_1",
    userId: "usr_dw_1",
    taskId: "task_1",
    type: "feedback_confirmation",
    title: "任务待确认回写",
    content: "任务 4月第一周投放归因验数 已产生待沉淀知识。",
    status: "unread",
    createdAt: "2026-04-14T10:05:00.000Z"
  }
];

export const demoCompare: TaskComparePayload = {
  baseRunId: "run_1",
  targetRunId: "run_2",
  diffs: [
    {
      section: "rules",
      summary: "规则内容存在 2 处差异",
      left: "阈值 20%",
      right: "阈值 30%"
    },
    {
      section: "sql",
      summary: "SQL 增加投放玩法维度",
      left: "group by platform, dt",
      right: "group by platform, play_type, dt"
    },
    {
      section: "results",
      summary: "高风险异常数从 2 提升到 4",
      left: "high=2",
      right: "high=4"
    }
  ]
};
