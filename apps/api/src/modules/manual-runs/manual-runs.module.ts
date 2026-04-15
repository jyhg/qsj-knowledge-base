import { Module } from "@nestjs/common";

import { ManualRunsController } from "./manual-runs.controller.js";
import { ManualRunsService } from "./manual-runs.service.js";

@Module({
  controllers: [ManualRunsController],
  providers: [ManualRunsService]
})
export class ManualRunsModule {}
