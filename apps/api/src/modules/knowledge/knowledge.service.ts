import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateKnowledgeCardInput } from "@qsj/shared-types";

import { audits, knowledgeCards, notifications } from "../../data/mock-store.js";

function nowIso() {
  return new Date().toISOString();
}

@Injectable()
export class KnowledgeService {
  list() {
    return knowledgeCards;
  }

  get(cardId: string) {
    const card = knowledgeCards.find((item) => item.id === cardId);
    if (!card) {
      throw new NotFoundException("KNOWLEDGE_CARD_NOT_FOUND");
    }
    return card;
  }

  create(input: CreateKnowledgeCardInput) {
    const card = {
      id: `card_${knowledgeCards.length + 1}`,
      metricCode: input.metricCode,
      metricName: input.metricName,
      tableName: input.tableName,
      businessGrain: input.businessGrain,
      businessDefinition: input.businessDefinition,
      dimensions: input.dimensions,
      createMode: input.createMode,
      reason: input.reason ?? null,
      applicableScene: input.applicableScene ?? null,
      isStandard: false,
      ownerUserId: null,
      status: "active" as const,
      currentVersionNo: 1,
      rules: []
    };
    knowledgeCards.unshift(card);
    return card;
  }

  update(cardId: string, patch: Partial<CreateKnowledgeCardInput>) {
    const card = this.get(cardId);
    if (patch.metricCode) card.metricCode = patch.metricCode;
    if (patch.metricName) card.metricName = patch.metricName;
    if (patch.tableName) card.tableName = patch.tableName;
    if (patch.businessGrain) card.businessGrain = patch.businessGrain;
    if (patch.businessDefinition) card.businessDefinition = patch.businessDefinition;
    if (patch.dimensions) card.dimensions = patch.dimensions;
    if (patch.reason !== undefined) card.reason = patch.reason ?? null;
    if (patch.applicableScene !== undefined) {
      card.applicableScene = patch.applicableScene ?? null;
    }
    card.currentVersionNo += 1;
    return card;
  }

  versions(cardId: string) {
    const card = this.get(cardId);
    return [
      {
        id: `${cardId}_v${Math.max(1, card.currentVersionNo - 1)}`,
        versionNo: Math.max(1, card.currentVersionNo - 1)
      },
      {
        id: `${cardId}_v${card.currentVersionNo}`,
        versionNo: card.currentVersionNo
      }
    ];
  }

  rollbackRule(ruleId: string) {
    audits.unshift({
      id: `audit_${audits.length + 1}`,
      entityType: "knowledge_rule",
      entityId: ruleId,
      action: "rollback_rule",
      operatorUserId: "usr_dw_1",
      operatorRole: "dw_developer",
      detail: { ruleId },
      createdAt: nowIso()
    });
    notifications.unshift({
      id: `notice_${notifications.length + 1}`,
      userId: "usr_dw_1",
      taskId: null,
      type: "rollback_notice",
      title: "知识规则已回滚",
      content: `规则 ${ruleId} 已回滚，请相关负责人关注。`,
      status: "unread",
      createdAt: nowIso()
    });
    return { ruleId, status: "rolled_back" };
  }

  rollbackImplementation(implementationId: string) {
    audits.unshift({
      id: `audit_${audits.length + 1}`,
      entityType: "knowledge_implementation",
      entityId: implementationId,
      action: "rollback_implementation",
      operatorUserId: "usr_dw_1",
      operatorRole: "dw_developer",
      detail: { implementationId },
      createdAt: nowIso()
    });
    notifications.unshift({
      id: `notice_${notifications.length + 1}`,
      userId: "usr_dw_1",
      taskId: null,
      type: "rollback_notice",
      title: "指标实现已回滚",
      content: `实现 ${implementationId} 已回滚，请相关负责人关注。`,
      status: "unread",
      createdAt: nowIso()
    });
    return { implementationId, status: "rolled_back" };
  }

  clone(cardId: string) {
    const card = this.get(cardId);
    return {
      ...card,
      id: `card_clone_${cardId}`,
      currentVersionNo: 1,
      createMode: "copy_task" as const
    };
  }
}

