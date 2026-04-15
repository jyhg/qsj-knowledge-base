import { Injectable, NotFoundException } from "@nestjs/common";

import {
  businessRules,
  dqcDeployments,
  observationPoints,
  tableAssets,
  testCases
} from "../../data/mock-store.js";

@Injectable()
export class TablesService {
  list() {
    return tableAssets;
  }

  get(tableId: string) {
    const table = tableAssets.find((item) => item.id === tableId);
    if (!table) {
      throw new NotFoundException("TABLE_ASSET_NOT_FOUND");
    }
    return table;
  }

  listTestCases(tableId: string) {
    this.get(tableId);
    return testCases.filter((item) => item.tableAssetId === tableId);
  }

  listObservations(tableId: string) {
    this.get(tableId);
    return observationPoints.filter((item) => item.tableAssetId === tableId);
  }

  listBusinessRules(tableId: string) {
    this.get(tableId);
    return businessRules.filter((item) => item.tableAssetId === tableId);
  }

  getExecutionPublish(tableId: string) {
    const table = this.get(tableId);
    const relatedTestCases = this.listTestCases(tableId);
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
