import { Injectable, NotFoundException } from "@nestjs/common";
import { TableAssetDetail } from "@qsj/shared-types";

import {
  tableAssets as mockTableAssets,
  testCases as mockTestCases,
  observationPoints as mockObservationPoints,
  businessRules as mockBusinessRules,
  dqcDeployments
} from "../../data/mock-store.js";

@Injectable()
export class TablesService {
  async list(): Promise<TableAssetDetail[]> {
    return mockTableAssets;
  }

  async get(tableId: string): Promise<TableAssetDetail> {
    const table = mockTableAssets.find((item) => item.id === tableId);
    if (!table) {
      throw new NotFoundException("TABLE_ASSET_NOT_FOUND");
    }
    return table;
  }

  async create(createTableAssetDto: Partial<TableAssetDetail>): Promise<TableAssetDetail> {
    const now = new Date().toISOString();
    const created: TableAssetDetail = {
      id: `tbl_${Date.now()}`,
      tableName: createTableAssetDto.tableName ?? "",
      displayName: createTableAssetDto.displayName ?? "",
      domainCode: createTableAssetDto.domainCode ?? null,
      description: createTableAssetDto.description ?? null,
      riskLevel: createTableAssetDto.riskLevel ?? "low",
      ownerUserId: createTableAssetDto.ownerUserId ?? null,
      status: createTableAssetDto.status ?? "draft",
      currentVersionId: null,
      currentVersionNo: 1,
      observationPointCount: 0,
      testCaseCount: 0,
      businessRuleCount: 0,
      dqcDeploymentCount: 0,
      lastAbnormalAt: null,
      oneServiceOnlyCaseCount: 0,
      dualChannelCaseCount: 0,
      latestVersionSha: null,
      createdBy: createTableAssetDto.createdBy ?? "system",
      createdAt: now,
      updatedAt: now,
    };
    mockTableAssets.unshift(created);
    return created;
  }

  async update(tableId: string, updateTableAssetDto: Partial<TableAssetDetail>): Promise<TableAssetDetail> {
    const index = mockTableAssets.findIndex((item) => item.id === tableId);
    if (index < 0) {
      throw new NotFoundException(`Table Asset with ID ${tableId} not found`);
    }
    const updated = { ...mockTableAssets[index], ...updateTableAssetDto, updatedAt: new Date().toISOString() };
    mockTableAssets.splice(index, 1, updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const index = mockTableAssets.findIndex((item) => item.id === id);
    if (index >= 0) {
      mockTableAssets.splice(index, 1);
    }
  }

  async listTestCases(tableId: string) {
    await this.get(tableId);
    return mockTestCases.filter((item) => item.tableAssetId === tableId);
  }

  async listObservations(tableId: string) {
    await this.get(tableId);
    return mockObservationPoints.filter((item) => item.tableAssetId === tableId);
  }

  async listBusinessRules(tableId: string) {
    await this.get(tableId);
    return mockBusinessRules.filter((item) => item.tableAssetId === tableId);
  }

  async getExecutionPublish(tableId: string) {
    const table = await this.get(tableId);
    const relatedTestCases = await this.listTestCases(tableId);
    const relatedDeployments = dqcDeployments.filter((item) => item.tableAssetId === tableId);

    return {
      table,
      oneServiceExecutableCount: relatedTestCases.filter((item) => item.supportsOneService).length,
      recentBatchCount: 1,
      recentAbnormalCount: relatedTestCases.filter((item) => item.lastResultStatus === "failed").length,
      dqcPublishedCount: relatedDeployments.filter((item) => item.publishStatus === "published").length,
      dqcPendingCount: relatedDeployments.filter((item) => item.publishStatus === "pending_confirm").length,
      dqcUnmappedCount: relatedTestCases.filter((item) => item.supportsDqc).length - relatedDeployments.length,
      suggestedDqcTestCases: relatedTestCases.filter((item) => item.supportsDqc),
      deployments: relatedDeployments
    };
  }
}
