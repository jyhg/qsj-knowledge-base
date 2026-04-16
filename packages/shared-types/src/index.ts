export type UserRole = "dw_developer" | "pm";

export type RiskLevel = "high" | "medium" | "low";

export type AssetStatus = "draft" | "active" | "deprecated";

export type ExecutionChannel = "one_service" | "dqc" | "dual";

export type ManualRunScene =
  | "analysis_validation"
  | "development_self_test";

export type ManualRunStatus =
  | "draft"
  | "selecting"
  | "queued"
  | "running"
  | "pending_feedback"
  | "completed"
  | "failed";

export type ManualRunResultStatus = "passed" | "warning" | "failed";

export type DqcPublishTaskStatus =
  | "draft"
  | "diff_ready"
  | "pending_confirm"
  | "syncing"
  | "completed"
  | "failed";

export type DqcPublishStatus =
  | "draft"
  | "pending_confirm"
  | "published"
  | "offline";

export type DqcSuggestedAction =
  | "create"
  | "update"
  | "offline"
  | "unchanged";

export type NotificationType =
  | "scope_confirmation"
  | "feedback_confirmation"
  | "dqc_publish_confirmation"
  | "result_stale"
  | "rollback_notice"
  | "rerun_notice";

export type FeedbackItemType =
  | "observation"
  | "test_case"
  | "business_rule"
  | "anomaly_pattern"
  | "dqc_mapping"
  | "sql_template"
  | "scope_decision"
  | "handling_method";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface TableAssetSummary {
  id: string;
  tableName: string;
  displayName: string;
  domainCode?: string | null;
  description?: string | null;
  riskLevel: RiskLevel;
  ownerUserId?: string | null;
  status: AssetStatus;
  currentVersionId?: string | null;
  currentVersionNo?: number | null;
  observationPointCount: number;
  testCaseCount: number;
  businessRuleCount: number;
  dqcDeploymentCount: number;
  lastAbnormalAt?: string | null;
}

export interface TableAssetDetail extends TableAssetSummary {
  oneServiceOnlyCaseCount: number;
  dualChannelCaseCount: number;
  latestVersionSha?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ObservationPoint {
  id: string;
  tableAssetId: string;
  name: string;
  metricCode: string;
  metricName: string;
  aggregationExpr: string;
  timeGrain: string;
  dimensions: string[];
  filters: Array<Record<string, unknown>>;
  sceneTags: ManualRunScene[];
  status: AssetStatus;
  gitPath: string;
  versionNo: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseSummary {
  id: string;
  tableAssetId: string;
  name: string;
  testCaseType: string;
  logicDesc: string;
  thresholdDesc?: string | null;
  observationIds: string[];
  supportedScenes: Array<ManualRunScene | "dqc_publish">;
  channel: ExecutionChannel;
  supportsOneService: boolean;
  supportsDqc: boolean;
  oneServiceParser?: string | null;
  dqcTemplateType?: string | null;
  riskLevel: RiskLevel;
  status: AssetStatus;
  lastResultStatus?: ManualRunResultStatus | null;
  lastExecutedAt?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseDetail extends TestCaseSummary {
  sqlTemplate: string;
  businessRuleIds: string[];
  gitPath: string;
  versionNo: number;
}

export interface BusinessRuleSummary {
  id: string;
  tableAssetId: string;
  name: string;
  semanticDesc: string;
  applicableScope?: string | null;
  exceptionScope?: string | null;
  observationIds: string[];
  testCaseIds: string[];
  status: AssetStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRuleDetail extends BusinessRuleSummary {
  commonCauses?: string | null;
  analysisHint?: string | null;
  gitPath: string;
  versionNo: number;
}

export interface DqcDeploymentSummary {
  id: string;
  tableAssetId: string;
  testCaseId: string;
  dqcRuleType: string;
  monitorName: string;
  monitorObject: string;
  monitorField?: string | null;
  conditionExpr: string;
  publishStatus: DqcPublishStatus;
  dqcRuleId?: string | null;
  lastSyncedAt?: string | null;
}

export interface CreateObservationPointInput {
  tableId: string;
  name: string;
  metricCode: string;
  metricName?: string;
  aggregation: string;
  timeGrain: string;
  dimensions: string[];
  filters: Array<Record<string, unknown>>;
  sceneTags: ManualRunScene[];
}

export interface CreateTestCaseInput {
  tableAssetId: string;
  name: string;
  testCaseType: string;
  logicDesc: string;
  thresholdDesc?: string;
  observationIds: string[];
  supportedScenes: Array<ManualRunScene | "dqc_publish">;
  sqlTemplate: string;
  supportsOneService: boolean;
  supportsDqc: boolean;
  oneServiceParser?: string;
  dqcTemplateType?: string;
  riskLevel: RiskLevel;
}

export interface CreateBusinessRuleInput {
  tableAssetId: string;
  name: string;
  semanticDesc: string;
  applicableScope?: string;
  exceptionScope?: string;
  observationIds: string[];
  testCaseIds: string[];
  commonCauses?: string;
  analysisHint?: string;
}

export interface ManualRunInput {
  title: string;
  scene: ManualRunScene;
  tableIds: string[];
  metricCodes: string[];
  requirementDesc: string;
  changeDesc: string;
  businessDateStart: string;
  businessDateEnd: string;
  executorUserId: string;
}

export interface ManualRunCandidate {
  tableId: string;
  testCaseId: string;
  testCaseName: string;
  channel: ExecutionChannel;
  riskLevel: RiskLevel;
  recommendationReason: string;
}

export interface ManualRunBatch {
  id: string;
  manualRunId: string;
  oneServiceRequestId?: string | null;
  status: "queued" | "running" | "succeeded" | "failed";
  triggeredBy: string;
  startedAt?: string | null;
  finishedAt?: string | null;
}

export interface ManualRunFinding {
  id: string;
  batchId: string;
  tableAssetId: string;
  testCaseId: string;
  businessRuleId?: string | null;
  resultStatus: ManualRunResultStatus;
  findingSummary: string;
  abnormalDimensions: Array<Record<string, unknown>>;
  evidence: Record<string, unknown>;
  oneServiceSummary?: string | null;
  sortScore: number;
}

export interface ManualRunResult {
  runId: string;
  batch: ManualRunBatch;
  findings: ManualRunFinding[];
  oneServiceRequestId?: string | null;
  referencedBusinessRuleIds: string[];
}

export interface FeedbackBatchItemInput {
  itemType: FeedbackItemType;
  sourceId: string;
  selected: boolean;
}

export interface CreateFeedbackBatchInput {
  runId?: string;
  reason: string;
  applicableScene?: string;
  applicableScenes?: string[];
  items: FeedbackBatchItemInput[];
}

export interface DqcPublishTask {
  id: string;
  title: string;
  tableIds: string[];
  status: DqcPublishTaskStatus;
  createdBy: string;
  createdAt: string;
}

export interface DqcPublishDiffItem {
  id: string;
  publishTaskId: string;
  tableAssetId: string;
  testCaseId: string;
  currentDqcStatus: string;
  suggestedAction: DqcSuggestedAction;
  reason: string;
  selected: boolean;
}

export interface GitVersionSummary {
  id: string;
  commitSha: string;
  commitMessage: string;
  authorUserId: string;
  relatedObjectType: string;
  relatedObjectId: string;
  versionNo: number;
  createdAt: string;
}

export interface GitChangeItem {
  id: string;
  gitVersionId: string;
  filePath: string;
  changeType: "add" | "modify" | "delete";
  diffSummary?: string | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  status?: "unread" | "read";
  taskId?: string | null;
  relatedObjectType?: string | null;
  relatedObjectId?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  actorUserId?: string;
  actionType?: string;
  targetType?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
  entityType?: string;
  entityId?: string;
  action?: string;
  operatorUserId?: string;
  operatorRole?: UserRole;
  detail?: Record<string, unknown>;
  createdAt: string;
}

export interface KnowledgeVersionDiff {
  section: "rules" | "sql" | "results" | "scope";
  summary: string;
  left: string;
  right: string;
}

export interface TaskComparePayload {
  baseRunId: string;
  targetRunId: string;
  diffs: KnowledgeVersionDiff[];
}

// Legacy exports kept temporarily to avoid breaking older modules
// that still compile against the pre-refactor API surface.

export type TaskScene = ManualRunScene | "delivery_dqc";

export type TaskStatus =
  | "draft"
  | "pending_scope_confirmation"
  | "running"
  | "pending_feedback"
  | "completed";

export type RunStatus = "queued" | "running" | "succeeded" | "failed" | "stale";

export type CheckLevel = "table" | "metric" | "deep_validation";

export type CheckStatus = "passed" | "warning" | "failed" | "skipped";

export interface TaskMetric {
  metricCode: string;
  metricName: string;
}

export interface TaskSummary {
  id: string;
  title: string;
  scene: TaskScene;
  targetTable: string;
  targetMetrics: TaskMetric[];
  status: TaskStatus;
  executorUserId: string;
  pmUserId: string;
  businessDateStart: string;
  businessDateEnd: string;
  lastRunAt: string | null;
  hasPendingFeedback: boolean;
}

export interface TaskDetail extends TaskSummary {
  requirementDesc: string;
  changeDesc: string;
  extraSql?: string | null;
}

export interface CreateTaskInput {
  title: string;
  scene: TaskScene;
  targetTable: string;
  targetMetricIds: string[];
  requirementDesc: string;
  changeDesc: string;
  businessDateStart: string;
  businessDateEnd: string;
  executorUserId: string;
  pmUserId: string;
  extraSql?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {}

export interface ConfirmScopeInput {
  selectedImplementationIds: string[];
  comment: string;
}

export interface TaskRunSummary {
  id: string;
  taskId: string;
  runNo: number;
  scene: TaskScene;
  status: RunStatus;
  startedAt: string | null;
  finishedAt: string | null;
  triggeredBy: string;
}

export interface TaskCheckFinding {
  id: string;
  runId: string;
  level: CheckLevel;
  metricCode?: string | null;
  checkType: string;
  riskLevel: RiskLevel;
  status: CheckStatus;
  findingSummary: string;
  impactScope: string;
  evidence: Record<string, unknown>;
  ruleId?: string | null;
  sortScore: number;
}

export interface TaskResultPayload {
  run: TaskRunSummary;
  findings: TaskCheckFinding[];
  referencedKnowledgeIds: string[];
}

export interface KnowledgeCardSummary {
  id: string;
  metricCode: string;
  metricName: string;
  tableName: string;
  businessGrain: string;
  isStandard: boolean;
  ownerUserId?: string | null;
  status: "active" | "deprecated";
  currentVersionNo: number;
}

export interface KnowledgeRule {
  id: string;
  name: string;
  ruleType: string;
  checkObject: string;
  logicDesc: string;
  thresholdDesc?: string | null;
  riskLevel: RiskLevel;
  ruleLevel: "base_check" | "deep_validation";
  triggerCondition: string;
  sqlTemplate?: string | null;
}

export interface KnowledgeCardDetail extends KnowledgeCardSummary {
  businessDefinition: string;
  dimensions: string[];
  rules: KnowledgeRule[];
  createMode: "blank" | "copy_rule" | "copy_task";
  reason?: string | null;
  applicableScene?: string | null;
}

export interface CreateKnowledgeCardInput {
  metricCode: string;
  metricName: string;
  tableName: string;
  businessGrain: string;
  businessDefinition: string;
  dimensions: string[];
  createMode: "blank" | "copy_rule" | "copy_task";
  reason?: string;
  applicableScene?: string;
}
