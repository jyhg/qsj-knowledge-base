import type {
  AuditRecord,
  BusinessRuleDetail,
  DqcDeploymentSummary,
  DqcPublishDiffItem,
  DqcPublishTask,
  GitChangeItem,
  GitVersionSummary,
  KnowledgeCardDetail,
  ManualRunCandidate,
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

export const demoUser: User = {
  id: "usr_dw_1",
  name: "数仓开发A",
  role: "dw_developer"
};

export const demoTableAssets: TableAssetDetail[] = [
  {
    id: "tbl_ads_app_qsj_agg_cate_conv",
    tableName: "ads_app_qsj_agg_cate_conv",
    displayName: "转化率汇总表",
    domainCode: "ads_media",
    description: "自媒体投放效果汇总结果表",
    riskLevel: "high",
    ownerUserId: "usr_dw_1",
    status: "active",
    currentVersionId: "ver_tbl_1",
    currentVersionNo: 12,
    observationPointCount: 2,
    testCaseCount: 3,
    businessRuleCount: 2,
    dqcDeploymentCount: 1,
    lastAbnormalAt: "2026-04-14T16:10:00.000Z",
    oneServiceOnlyCaseCount: 2,
    dualChannelCaseCount: 1,
    latestVersionSha: "9b5a4a8",
    createdBy: "usr_dw_1",
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-14T16:10:00.000Z"
  }
];

export const demoObservationPoints: ObservationPoint[] = [
  {
    id: "op_1",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    name: "转化率_平台玩法经营类型",
    metricCode: "conversion_rate",
    metricName: "转化率",
    aggregationExpr: "sum(conversion_cnt) / sum(click_cnt)",
    timeGrain: "day",
    dimensions: ["biz_date", "platform", "play_type", "operate_mode"],
    filters: [],
    sceneTags: ["analysis_validation", "development_self_test"],
    status: "active",
    gitPath: "knowledge-assets/observation-points/op_1.yaml",
    versionNo: 3,
    createdBy: "usr_dw_1",
    createdAt: "2026-04-10T10:00:00.000Z",
    updatedAt: "2026-04-14T16:10:00.000Z"
  }
];

export const demoTestCases: TestCaseDetail[] = [
  {
    id: "tc_1",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    name: "自营 vs 投流转化对比",
    testCaseType: "business_constraint",
    logicDesc: "某平台某玩法下，自营转化应低于投流转化。",
    thresholdDesc: "自营转化不得高于投流转化",
    observationIds: ["op_1"],
    supportedScenes: ["analysis_validation", "development_self_test"],
    channel: "one_service",
    supportsOneService: true,
    supportsDqc: false,
    oneServiceParser: "percentage_compare",
    dqcTemplateType: null,
    riskLevel: "high",
    status: "active",
    lastResultStatus: "failed",
    lastExecutedAt: "2026-04-14T16:10:00.000Z",
    sqlTemplate: "select platform, play_type, operate_mode, conversion_rate from ...",
    businessRuleIds: ["br_1"],
    gitPath: "knowledge-assets/test-cases/tc_1.yaml",
    versionNo: 2,
    createdBy: "usr_dw_1",
    createdAt: "2026-04-11T09:30:00.000Z",
    updatedAt: "2026-04-14T16:10:00.000Z"
  },
  {
    id: "tc_2",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    name: "表 A / 表 B 转化一致性",
    testCaseType: "reconciliation",
    logicDesc: "同维度组合下，汇总表与结果表值应一致。",
    thresholdDesc: "差异 = 0",
    observationIds: ["op_1"],
    supportedScenes: ["development_self_test", "dqc_publish"],
    channel: "dual",
    supportsOneService: true,
    supportsDqc: true,
    oneServiceParser: "numeric_compare",
    dqcTemplateType: "consistency_check",
    riskLevel: "high",
    status: "active",
    lastResultStatus: "passed",
    lastExecutedAt: "2026-04-14T15:40:00.000Z",
    sqlTemplate: "select ...",
    businessRuleIds: ["br_2"],
    gitPath: "knowledge-assets/test-cases/tc_2.yaml",
    versionNo: 4,
    createdBy: "usr_dw_1",
    createdAt: "2026-04-09T15:20:00.000Z",
    updatedAt: "2026-04-14T15:40:00.000Z"
  }
];

export const demoBusinessRules: BusinessRuleDetail[] = [
  {
    id: "br_1",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    name: "自营转化应低于投流转化",
    semanticDesc: "某平台某玩法下，自营转化通常低于投流转化。",
    applicableScope: "平台=抖音，玩法=直播",
    exceptionScope: null,
    observationIds: ["op_1"],
    testCaseIds: ["tc_1"],
    status: "active",
    commonCauses: "流量分类错误、归因口径错误、样本范围异常",
    analysisHint: "优先排查 operate_mode 映射与转化归因 SQL",
    gitPath: "knowledge-assets/business-rules/br_1.yaml",
    versionNo: 2,
    createdBy: "usr_dw_1",
    createdAt: "2026-04-08T11:00:00.000Z",
    updatedAt: "2026-04-14T16:10:00.000Z"
  }
];

export const demoDqcDeployments: DqcDeploymentSummary[] = [
  {
    id: "dqc_1",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    testCaseId: "tc_2",
    dqcRuleType: "consistency_check",
    monitorName: "表A表B转化一致性",
    monitorObject: "ads_app_qsj_agg_cate_conv",
    monitorField: "order_cnt",
    conditionExpr: "diff = 0",
    publishStatus: "published",
    dqcRuleId: "dqc_rule_1001",
    lastSyncedAt: "2026-04-14T18:00:00.000Z"
  }
];

export const demoManualRunCandidates: ManualRunCandidate[] = [
  {
    tableId: "tbl_ads_app_qsj_agg_cate_conv",
    testCaseId: "tc_1",
    testCaseName: "自营 vs 投流转化对比",
    channel: "one_service",
    riskLevel: "high",
    recommendationReason: "命中转化率相关业务规则"
  },
  {
    tableId: "tbl_ads_app_qsj_agg_cate_conv",
    testCaseId: "tc_2",
    testCaseName: "表 A / 表 B 转化一致性",
    channel: "dual",
    riskLevel: "high",
    recommendationReason: "涉及多表对账"
  }
];

export const demoManualRunResult: ManualRunResult = {
  runId: "mr_1",
  batch: {
    id: "mrb_1",
    manualRunId: "mr_1",
    oneServiceRequestId: "os_123456",
    status: "succeeded",
    triggeredBy: "usr_dw_1",
    startedAt: "2026-04-14T10:00:00.000Z",
    finishedAt: "2026-04-14T10:03:00.000Z"
  },
  findings: [
    {
      id: "mrf_1",
      batchId: "mrb_1",
      tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
      testCaseId: "tc_1",
      businessRuleId: "br_1",
      resultStatus: "failed",
      findingSummary: "平台=抖音、玩法=直播下，自营转化高于投流转化。",
      abnormalDimensions: [{ platform: "douyin", playType: "live", operateMode: "self" }],
      evidence: { selfConversion: 4.2, paidConversion: 3.1 },
      oneServiceSummary: "自营转化 4.2%，投流转化 3.1%",
      sortScore: 95
    }
  ],
  oneServiceRequestId: "os_123456",
  referencedBusinessRuleIds: ["br_1"]
};

export const demoDqcPublishTask: DqcPublishTask = {
  id: "dqc_task_1",
  title: "ads_app_qsj_agg_cate_conv DQC 回填",
  tableIds: ["tbl_ads_app_qsj_agg_cate_conv"],
  status: "diff_ready",
  createdBy: "usr_dw_1",
  createdAt: "2026-04-15T09:00:00.000Z"
};

export const demoDqcPublishDiffs: DqcPublishDiffItem[] = [
  {
    id: "dqc_diff_1",
    publishTaskId: "dqc_task_1",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    testCaseId: "tc_2",
    currentDqcStatus: "unpublished",
    suggestedAction: "create",
    reason: "高风险且长期有效",
    selected: true
  }
];

export const demoGitVersions: GitVersionSummary[] = [
  {
    id: "ver_tbl_1",
    commitSha: "9b5a4a8",
    commitMessage: "feat: align schema and shared types with latest design",
    authorUserId: "usr_dw_1",
    relatedObjectType: "table_asset",
    relatedObjectId: "tbl_ads_app_qsj_agg_cate_conv",
    versionNo: 12,
    createdAt: "2026-04-15T11:20:00.000Z"
  }
];

export const demoGitChangeItems: GitChangeItem[] = [
  {
    id: "gci_1",
    gitVersionId: "ver_tbl_1",
    filePath: "knowledge-assets/test-cases/tc_2.yaml",
    changeType: "modify",
    diffSummary: "更新对账阈值与 DQC 映射"
  }
];

export const demoAudits: AuditRecord[] = [
  {
    id: "audit_1",
    entityType: "manual_run_batch",
    entityId: "mrb_1",
    action: "execute_one_service",
    operatorUserId: "usr_dw_1",
    operatorRole: "dw_developer",
    detail: {
      oneServiceRequestId: "os_123456",
      resultRowCount: 2,
      executionStatus: "succeeded"
    },
    createdAt: "2026-04-14T10:01:00.000Z"
  }
];

export const demoNotifications: NotificationItem[] = [
  {
    id: "notice_1",
    userId: "usr_dw_1",
    type: "feedback_confirmation",
    taskId: "mr_1",
    title: "手动验数任务待确认回写",
    content: "批次 mr_1 已产生待沉淀知识。",
    status: "unread",
    relatedObjectType: "manual_run",
    relatedObjectId: "mr_1",
    createdAt: "2026-04-14T10:05:00.000Z"
  }
];

// Legacy demo exports retained for older pages.

export const demoTasks: TaskDetail[] = [
  {
    id: "task_1",
    title: "4月第一周投放归因验数",
    scene: "analysis_validation",
    targetTable: "ads_app_qsj_agg_cate_conv",
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

export const demoCompare: TaskComparePayload = {
  baseRunId: "run_1",
  targetRunId: "run_2",
  diffs: [
    {
      section: "rules",
      summary: "规则内容存在 2 处差异",
      left: "阈值 20%",
      right: "阈值 30%"
    }
  ]
};
