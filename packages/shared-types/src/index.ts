export type UserRole = "dw_developer" | "pm";

export type TaskScene = "analysis_validation" | "delivery_dqc";

export type TaskStatus =
  | "draft"
  | "pending_scope_confirmation"
  | "running"
  | "pending_feedback"
  | "completed";

export type RunStatus = "queued" | "running" | "succeeded" | "failed" | "stale";

export type RiskLevel = "high" | "medium" | "low";

export type CheckLevel = "table" | "metric" | "deep_validation";

export type CheckStatus = "passed" | "warning" | "failed" | "skipped";

export type FeedbackItemType =
  | "anomaly_pattern"
  | "sql_template"
  | "scope_decision"
  | "handling_method";

export type NotificationType =
  | "scope_confirmation"
  | "feedback_confirmation"
  | "rollback_notice"
  | "rerun_notice";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

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

export interface AuditRecord {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  operatorUserId: string;
  operatorRole: UserRole;
  detail: Record<string, unknown>;
  createdAt: string;
}

export interface FeedbackBatchItemInput {
  itemType: FeedbackItemType;
  sourceId: string;
  selected: boolean;
}

export interface CreateFeedbackBatchInput {
  runId: string;
  reason: string;
  applicableScene: string;
  items: FeedbackBatchItemInput[];
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

export interface NotificationItem {
  id: string;
  userId: string;
  taskId?: string | null;
  type: NotificationType;
  title: string;
  content: string;
  status: "unread" | "read";
  createdAt: string;
}

