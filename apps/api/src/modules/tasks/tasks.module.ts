import { Module } from "@nestjs/common";

import { OneServiceSqlExecutorService } from "./one-service-sql-executor.service.js";
import { TasksController } from "./tasks.controller.js";
import { TasksService } from "./tasks.service.js";

@Module({
  controllers: [TasksController],
  providers: [TasksService, OneServiceSqlExecutorService],
  exports: [TasksService]
})
export class TasksModule {}
