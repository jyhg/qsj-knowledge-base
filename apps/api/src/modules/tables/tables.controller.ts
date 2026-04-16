import { Body, Controller, Get, Param, Patch, Post, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { TableAssetDetail } from "@qsj/shared-types";

import { TablesService } from "./tables.service.js";

@Controller("tables")
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  list() {
    return this.tablesService.list();
  }

  @Post()
  create(@Body() body: Partial<TableAssetDetail>) {
    return this.tablesService.create(body);
  }

  @Get(":tableId")
  get(@Param("tableId") tableId: string) {
    return this.tablesService.get(tableId);
  }

  @Patch(":tableId")
  update(
    @Param("tableId") tableId: string,
    @Body() body: Partial<TableAssetDetail>
  ) {
    return this.tablesService.update(tableId, body);
  }

  @Delete(":tableId")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("tableId") tableId: string) {
    return this.tablesService.remove(tableId);
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
