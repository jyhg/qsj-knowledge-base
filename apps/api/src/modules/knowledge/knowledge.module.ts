import { Module } from "@nestjs/common";

import { KnowledgeController } from "./knowledge.controller.js";
import { TestCasesController } from "./test-cases.controller.js";
import { ObservationPointsController } from "./observation-points.controller.js";
import { BusinessRulesController } from "./business-rules.controller.js";
import { KnowledgeService } from "./knowledge.service.js";
import { TestCasesService } from "./test-cases.service.js";
import { ObservationPointsService } from "./observation-points.service.js";
import { BusinessRulesService } from "./business-rules.service.js";

@Module({
  imports: [],
  controllers: [KnowledgeController, TestCasesController, ObservationPointsController, BusinessRulesController],
  providers: [KnowledgeService, TestCasesService, ObservationPointsService, BusinessRulesService],
  exports: [KnowledgeService, TestCasesService, ObservationPointsService, BusinessRulesService]
})
export class KnowledgeModule {}

