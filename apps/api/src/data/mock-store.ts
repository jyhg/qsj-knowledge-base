import type {
  AuditRecord,
  BusinessRuleDetail,
  DqcDeploymentSummary,
  DqcPublishDiffItem,
  DqcPublishTask,
  GitChangeItem,
  GitVersionSummary,
  KnowledgeCardDetail,
  ManualRunBatch,
  ManualRunCandidate,
  ManualRunFinding,
  ManualRunResult,
  NotificationItem,
  ObservationPoint,
  TableAssetDetail,
  TestCaseDetail,
  User,
  TaskCheckFinding,
  TaskDetail,
  TaskResultPayload,
  TaskRunSummary
} from "@qsj/shared-types";

export const users: User[] = [
  { id: "usr_dw_1", name: "数仓开发A", role: "dw_developer" },
  { id: "usr_pm_1", name: "PMA", role: "pm" }
];

export const tableAssets: TableAssetDetail[] = [
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
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z"
  },
  {
    id: "tbl_ads_app_qsj_zz_secondhand",
    tableName: "ads_app_qsj_zz_secondhand",
    displayName: "二手转化明细表",
    domainCode: "ads_media",
    description: "二手业务转化结果明细",
    riskLevel: "medium",
    ownerUserId: "usr_dw_1",
    status: "active",
    currentVersionId: "ver_tbl_2",
    currentVersionNo: 7,
    observationPointCount: 1,
    testCaseCount: 1,
    businessRuleCount: 1,
    dqcDeploymentCount: 1,
    lastAbnormalAt: null,
    oneServiceOnlyCaseCount: 0,
    dualChannelCaseCount: 1,
    latestVersionSha: "9b5a4a8",
    createdBy: "usr_dw_1",
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z"
  }
];

export const observationPoints: ObservationPoint[] = [
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
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z"
  },
  {
    id: "op_2",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    name: "订单量_平台渠道",
    metricCode: "order_cnt",
    metricName: "订单量",
    aggregationExpr: "sum(order_cnt)",
    timeGrain: "day",
    dimensions: ["biz_date", "platform", "channel"],
    filters: [],
    sceneTags: ["analysis_validation", "development_self_test"],
    status: "active",
    gitPath: "knowledge-assets/observation-points/op_2.yaml",
    versionNo: 2,
    createdBy: "usr_dw_1",
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z"
  },
  {
    id: "op_3",
    tableAssetId: "tbl_ads_app_qsj_zz_secondhand",
    name: "订单量_平台渠道_二手",
    metricCode: "order_cnt",
    metricName: "订单量",
    aggregationExpr: "sum(order_cnt)",
    timeGrain: "day",
    dimensions: ["biz_date", "platform", "channel"],
    filters: [{ businessLine: "secondhand" }],
    sceneTags: ["analysis_validation", "development_self_test"],
    status: "active",
    gitPath: "knowledge-assets/observation-points/op_3.yaml",
    versionNo: 1,
    createdBy: "usr_dw_1",
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z"
  }
];

export const testCases: TestCaseDetail[] = [
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
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z"
  },
  {
    id: "tc_2",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    name: "表 A / 表 B 转化一致性",
    testCaseType: "reconciliation",
    logicDesc: "同维度组合下，汇总表与结果表值应一致。",
    thresholdDesc: "差异 = 0",
    observationIds: ["op_2", "op_3"],
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
    sqlTemplate: "select a.biz_date, a.platform, a.channel, a.order_cnt, b.order_cnt from ...",
    businessRuleIds: ["br_2"],
    gitPath: "knowledge-assets/test-cases/tc_2.yaml",
    versionNo: 4,
    createdBy: "usr_dw_1",
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z"
  },
  {
    id: "tc_3",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    name: "日波动检查",
    testCaseType: "volatility",
    logicDesc: "按日检查核心指标波动是否超过阈值。",
    thresholdDesc: "偏差 > 30%",
    observationIds: ["op_1"],
    supportedScenes: ["analysis_validation", "development_self_test", "dqc_publish"],
    channel: "dual",
    supportsOneService: true,
    supportsDqc: true,
    oneServiceParser: "timeseries_volatility",
    dqcTemplateType: "volatility_check",
    riskLevel: "medium",
    status: "active",
    lastResultStatus: "warning",
    lastExecutedAt: "2026-04-14T15:20:00.000Z",
    sqlTemplate: "select biz_date, conversion_rate from ... order by biz_date",
    businessRuleIds: [],
    gitPath: "knowledge-assets/test-cases/tc_3.yaml",
    versionNo: 3,
    createdBy: "usr_dw_1",
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z"
  },
  {
    id: "tc_4",
    tableAssetId: "tbl_ads_app_qsj_zz_secondhand",
    name: "二手订单量一致性",
    testCaseType: "reconciliation",
    logicDesc: "二手明细订单量与聚合订单量应一致。",
    thresholdDesc: "差异 = 0",
    observationIds: ["op_3"],
    supportedScenes: ["analysis_validation", "development_self_test"],
    channel: "one_service",
    supportsOneService: true,
    supportsDqc: false,
    oneServiceParser: "numeric_compare",
    dqcTemplateType: null,
    riskLevel: "medium",
    status: "active",
    lastResultStatus: "passed",
    lastExecutedAt: "2026-04-13T11:00:00.000Z",
    sqlTemplate: "select biz_date, platform, channel, order_cnt from ...",
    businessRuleIds: ["br_2"],
    gitPath: "knowledge-assets/test-cases/tc_4.yaml",
    versionNo: 1,
    createdBy: "usr_dw_1",
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z"
  }
];

export const businessRules: BusinessRuleDetail[] = [
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
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z"
  },
  {
    id: "br_2",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    name: "结果表与来源表应一致",
    semanticDesc: "ADS 汇总值应与来源表汇总一致。",
    applicableScope: "日级汇总",
    exceptionScope: null,
    observationIds: ["op_2", "op_3"],
    testCaseIds: ["tc_2", "tc_4"],
    status: "active",
    commonCauses: "ETL 漏数、维度映射错误、过滤条件不一致",
    analysisHint: "对比 group by 维度与 where 条件",
    gitPath: "knowledge-assets/business-rules/br_2.yaml",
    versionNo: 3,
    createdBy: "usr_dw_1",
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z"
  }
];

export const dqcDeployments: DqcDeploymentSummary[] = [
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

export const manualRuns: Array<{
  id: string;
  title: string;
  scene: string;
  tableIds: string[];
  metricCodes: string[];
  requirementDesc: string;
  changeDesc: string;
  businessDateStart: string;
  businessDateEnd: string;
  executorUserId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: "mr_1",
    title: "4月第一周投放归因分析验数",
    scene: "analysis_validation",
    tableIds: ["tbl_ads_app_qsj_agg_cate_conv", "tbl_ads_app_qsj_zz_secondhand"],
    metricCodes: ["conversion_rate", "order_cnt"],
    requirementDesc: "查看 4 月第一周不同平台玩法下的归因表现。",
    changeDesc: "新增玩法维度，调整转化率口径。",
    businessDateStart: "2026-04-01",
    businessDateEnd: "2026-04-07",
    executorUserId: "usr_dw_1",
    status: "pending_feedback",
    createdAt: "2026-04-14T10:00:00.000Z",
    updatedAt: "2026-04-14T10:03:00.000Z"
  }
];

export const manualRunCandidates: ManualRunCandidate[] = [
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

export const manualRunBatches: ManualRunBatch[] = [
  {
    id: "mrb_1",
    manualRunId: "mr_1",
    oneServiceRequestId: "os_123456",
    status: "succeeded",
    triggeredBy: "usr_dw_1",
    startedAt: "2026-04-14T10:00:00.000Z",
    finishedAt: "2026-04-14T10:03:00.000Z"
  }
];

export const manualRunFindings: ManualRunFinding[] = [
  {
    id: "mrf_1",
    batchId: "mrb_1",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    testCaseId: "tc_1",
    businessRuleId: "br_1",
    resultStatus: "failed",
    findingSummary: "平台=抖音、玩法=直播下，自营转化高于投流转化。",
    abnormalDimensions: [
      { platform: "douyin", playType: "live", operateMode: "self" }
    ],
    evidence: { selfConversion: 4.2, paidConversion: 3.1 },
    oneServiceSummary: "自营转化 4.2%，投流转化 3.1%",
    sortScore: 95
  },
  {
    id: "mrf_2",
    batchId: "mrb_1",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    testCaseId: "tc_2",
    businessRuleId: "br_2",
    resultStatus: "passed",
    findingSummary: "表 A / 表 B 转化一致性检查通过。",
    abnormalDimensions: [],
    evidence: { diffCount: 0 },
    oneServiceSummary: "差异记录 0 条",
    sortScore: 20
  }
];

export const manualRunResults: ManualRunResult[] = [
  {
    runId: "mr_1",
    batch: manualRunBatches[0],
    findings: manualRunFindings,
    oneServiceRequestId: "os_123456",
    referencedBusinessRuleIds: ["br_1", "br_2"]
  }
];

export const feedbackBatches: Array<{
  id: string;
  manualRunId: string;
  reason: string;
  applicableScenesJson: string;
  status: string;
  confirmedBy: string | null;
  createdAt: string;
  confirmedAt: string | null;
}> = [];

export const dqcPublishTasks: DqcPublishTask[] = [
  {
    id: "dqc_task_1",
    title: "ads_app_qsj_agg_cate_conv DQC 回填",
    tableIds: ["tbl_ads_app_qsj_agg_cate_conv"],
    status: "diff_ready",
    createdBy: "usr_dw_1",
    createdAt: "2026-04-15T09:00:00.000Z"
  }
];

export const dqcPublishDiffs: DqcPublishDiffItem[] = [
  {
    id: "dqc_diff_1",
    publishTaskId: "dqc_task_1",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    testCaseId: "tc_2",
    currentDqcStatus: "unpublished",
    suggestedAction: "create",
    reason: "高风险且长期有效",
    selected: true
  },
  {
    id: "dqc_diff_2",
    publishTaskId: "dqc_task_1",
    tableAssetId: "tbl_ads_app_qsj_agg_cate_conv",
    testCaseId: "tc_3",
    currentDqcStatus: "published",
    suggestedAction: "update",
    reason: "阈值策略调整",
    selected: true
  }
];

export const gitVersions: GitVersionSummary[] = [
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

export const gitChangeItems: GitChangeItem[] = [
  {
    id: "gci_1",
    gitVersionId: "ver_tbl_1",
    filePath: "knowledge-assets/test-cases/tc_2.yaml",
    changeType: "modify",
    diffSummary: "更新对账阈值与 DQC 映射"
  }
];

export const audits: AuditRecord[] = [
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

export const notifications: NotificationItem[] = [
  {
    id: "notice_1",
    userId: "usr_dw_1",
    taskId: "mr_1",
    type: "feedback_confirmation",
    title: "手动验数任务待确认回写",
    content: "批次 mr_1 已产生待沉淀知识。",
    status: "unread",
    relatedObjectType: "manual_run",
    relatedObjectId: "mr_1",
    createdAt: "2026-04-14T10:05:00.000Z"
  },
  {
    id: "notice_2",
    userId: "usr_dw_1",
    type: "dqc_publish_confirmation",
    title: "DQC 更新待确认",
    content: "ads_app_qsj_agg_cate_conv 的 DQC 差异已生成。",
    status: "unread",
    relatedObjectType: "dqc_publish_task",
    relatedObjectId: "dqc_task_1",
    createdAt: "2026-04-15T09:10:00.000Z"
  }
];

// Legacy mock data retained for older task / knowledge pages and modules.

export const tasks: TaskDetail[] = [
  {
    id: "task_1",
    title: "4月第一周投放归因验数",
    scene: "analysis_validation",
    targetTable: tableAssets[0].tableName,
    targetMetrics: [
      { metricCode: "metric_order_cnt", metricName: "订单数" },
      { metricCode: "metric_roi", metricName: "ROI" }
    ],
    requirementDesc: manualRuns[0].requirementDesc,
    changeDesc: manualRuns[0].changeDesc,
    businessDateStart: manualRuns[0].businessDateStart,
    businessDateEnd: manualRuns[0].businessDateEnd,
    executorUserId: "usr_dw_1",
    pmUserId: "usr_pm_1",
    status: "pending_feedback",
    lastRunAt: "2026-04-14T10:00:00.000Z",
    hasPendingFeedback: true,
    extraSql: "select * from ads_app_qsj_agg_cate_conv where dt between '2026-04-01' and '2026-04-07'"
  },
  {
    id: "task_2",
    title: "达人投放周报需求交付验收",
    scene: "delivery_dqc",
    targetTable: tableAssets[1].tableName,
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

export const taskRuns: TaskRunSummary[] = [
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

export const findings: TaskCheckFinding[] = [
  {
    id: "finding_1",
    runId: "run_1",
    level: "table",
    checkType: "row_count_volatility",
    riskLevel: "high",
    status: "failed",
    findingSummary: "表级行数较过去7日均值下降 32%。",
    impactScope: "ads_app_qsj_agg_cate_conv 全表",
    evidence: { current: 120034, baselineAvg: 176982 },
    ruleId: "tc_3",
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
    ruleId: "tc_1",
    sortScore: 90
  }
];

export const knowledgeCards: KnowledgeCardDetail[] = [
  {
    id: "card_1",
    metricCode: "metric_roi",
    metricName: "ROI",
    tableName: tableAssets[0].tableName,
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
        triggerCondition: "命中 ROI 相关改动点后执行",
        sqlTemplate: "select platform, play_type, ..."
      }
    ]
  }
];

export const demoTaskResultPayload: TaskResultPayload = {
  run: taskRuns[0],
  findings,
  referencedKnowledgeIds: ["card_1"]
};
