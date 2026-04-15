import { Module } from "@nestjs/common";

import { CompareController } from "./compare.controller.js";

@Module({
  controllers: [CompareController]
})
export class CompareModule {}

