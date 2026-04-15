import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { CreateFeedbackBatchInput, ManualRunInput } from "@qsj/shared-types";

import { ManualRunsService } from "./manual-runs.service.js";

@Controller("manual-runs")
export class ManualRunsController {
  constructor(private readonly manualRunsService: ManualRunsService) {}

  @Get()
  list() {
    return this.manualRunsService.list();
  }

  @Post()
  create(@Body() body: ManualRunInput) {
    return this.manualRunsService.create(body);
  }

  @Get(":runId/candidates")
  candidates(@Param("runId") runId: string) {
    return this.manualRunsService.listCandidates(runId);
  }

  @Post(":runId/execute")
  execute(
    @Param("runId") runId: string,
    @Body() body: { selectedTestCaseIds: string[] }
  ) {
    return this.manualRunsService.execute(runId, body.selectedTestCaseIds);
  }

  @Get(":runId/status")
  status(@Param("runId") runId: string) {
    return this.manualRunsService.getStatus(runId);
  }

  @Get(":runId/results")
  results(@Param("runId") runId: string) {
    return this.manualRunsService.getResults(runId);
  }

  @Post(":runId/feedback-batches")
  createFeedbackBatch(
    @Param("runId") runId: string,
    @Body() body: CreateFeedbackBatchInput
  ) {
    return this.manualRunsService.createFeedbackBatch(runId, body);
  }
}
