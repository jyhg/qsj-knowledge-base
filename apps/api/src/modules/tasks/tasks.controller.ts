import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post
} from "@nestjs/common";
import type {
  ConfirmScopeInput,
  CreateFeedbackBatchInput,
  CreateTaskInput,
  UpdateTaskInput
} from "@qsj/shared-types";

import { TasksService } from "./tasks.service.js";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  list() {
    return this.tasksService.list();
  }

  @Post()
  create(@Body() body: CreateTaskInput) {
    return this.tasksService.create(body);
  }

  @Get(":taskId")
  get(@Param("taskId") taskId: string) {
    return this.tasksService.get(taskId);
  }

  @Patch(":taskId")
  update(@Param("taskId") taskId: string, @Body() body: UpdateTaskInput) {
    return this.tasksService.update(taskId, body);
  }

  @Post(":taskId/confirm-scope")
  confirmScope(@Param("taskId") taskId: string, @Body() body: ConfirmScopeInput) {
    return this.tasksService.confirmScope(taskId, body);
  }

  @Post(":taskId/execute")
  execute(@Param("taskId") taskId: string) {
    return this.tasksService.execute(taskId);
  }

  @Get(":taskId/runs")
  listRuns(@Param("taskId") taskId: string) {
    return this.tasksService.listRuns(taskId);
  }

  @Get(":taskId/runs/:runId")
  getRun(@Param("taskId") taskId: string, @Param("runId") runId: string) {
    return this.tasksService.getRun(taskId, runId);
  }

  @Get(":taskId/runs/:runId/results")
  getRunResults(@Param("taskId") taskId: string, @Param("runId") runId: string) {
    return this.tasksService.getRunResults(taskId, runId);
  }

  @Get(":taskId/audits")
  audits(@Param("taskId") taskId: string) {
    return this.tasksService.listAudits(taskId);
  }

  @Post(":taskId/feedback-batches")
  createFeedbackBatch(
    @Param("taskId") taskId: string,
    @Body() body: CreateFeedbackBatchInput
  ) {
    return this.tasksService.createFeedbackBatch(taskId, body);
  }
}

