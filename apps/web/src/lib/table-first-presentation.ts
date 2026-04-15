import type {
  AssetStatus,
  DqcPublishStatus,
  DqcSuggestedAction,
  ExecutionChannel,
  ManualRunBatch,
  ManualRunResultStatus,
  ManualRunScene,
  NotificationItem
} from "@qsj/shared-types";

const riskLabels = {
  high: "高风险",
  medium: "中风险",
  low: "低风险"
} as const;

const assetStatusLabels: Record<AssetStatus, string> = {
  draft: "草稿",
  active: "生效中",
  deprecated: "已废弃"
};

const sceneLabels: Record<ManualRunScene, string> = {
  analysis_validation: "取数分析",
  development_self_test: "开发自测"
};

const channelLabels: Record<ExecutionChannel, string> = {
  one_service: "one service",
  dqc: "DQC",
  dual: "双通道"
};

const resultLabels: Record<ManualRunResultStatus, string> = {
  passed: "通过",
  warning: "预警",
  failed: "异常"
};

const batchStatusLabels: Record<ManualRunBatch["status"], string> = {
  queued: "排队中",
  running: "执行中",
  succeeded: "执行成功",
  failed: "执行失败"
};

const dqcPublishStatusLabels: Record<DqcPublishStatus, string> = {
  draft: "草稿",
  pending_confirm: "待确认",
  published: "已发布",
  offline: "已下线"
};

const dqcActionLabels: Record<DqcSuggestedAction, string> = {
  create: "新增",
  update: "更新",
  offline: "下线",
  unchanged: "保持不变"
};

const notificationStatusLabels: Record<NonNullable<NotificationItem["status"]>, string> = {
  unread: "未读",
  read: "已读"
};

export function getRiskLabel(risk: keyof typeof riskLabels) {
  return riskLabels[risk];
}

export function getAssetStatusLabel(status: AssetStatus) {
  return assetStatusLabels[status];
}

export function getManualRunSceneLabel(scene: ManualRunScene) {
  return sceneLabels[scene];
}

export function getExecutionChannelLabel(channel: ExecutionChannel) {
  return channelLabels[channel];
}

export function getManualRunResultLabel(status: ManualRunResultStatus) {
  return resultLabels[status];
}

export function getManualRunBatchStatusLabel(status: ManualRunBatch["status"]) {
  return batchStatusLabels[status];
}

export function getDqcPublishStatusLabel(status: DqcPublishStatus) {
  return dqcPublishStatusLabels[status];
}

export function getDqcSuggestedActionLabel(action: DqcSuggestedAction) {
  return dqcActionLabels[action];
}

export function getNotificationStatusLabel(status?: NotificationItem["status"]) {
  if (!status) {
    return "-";
  }
  return notificationStatusLabels[status];
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return value.replace("T", " ").replace(".000Z", "");
}
