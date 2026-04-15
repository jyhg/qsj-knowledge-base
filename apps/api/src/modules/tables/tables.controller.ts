import { Controller, Get, Param } from "@nestjs/common";

import { TablesService } from "./tables.service.js";

@Controller("tables")
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  list() {
    return this.tablesService.list();
  }

  @Get(":tableId")
  get(@Param("tableId") tableId: string) {
    return this.tablesService.get(tableId);
  }

  @Get(":tableId/test-cases")
  listTestCases(@Param("tableId") tableId: string) {
    return this.tablesService.listTestCases(tableId);
  }

  @Get(":tableId/observations")
  listObservations(@Param("tableId") tableId: string) {
    return this.tablesService.listObservations(tableId);
  }

  @Get(":tableId/business-rules")
  listBusinessRules(@Param("tableId") tableId: string) {
    return this.tablesService.listBusinessRules(tableId);
  }

  @Get(":tableId/execution-publish")
  getExecutionPublish(@Param("tableId") tableId: string) {
    return this.tablesService.getExecutionPublish(tableId);
  }
}
