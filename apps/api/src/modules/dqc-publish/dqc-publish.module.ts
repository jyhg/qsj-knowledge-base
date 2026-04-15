import { Module } from "@nestjs/common";

import { DqcPublishController } from "./dqc-publish.controller.js";
import { DqcPublishService } from "./dqc-publish.service.js";

@Module({
  controllers: [DqcPublishController],
  providers: [DqcPublishService]
})
export class DqcPublishModule {}
