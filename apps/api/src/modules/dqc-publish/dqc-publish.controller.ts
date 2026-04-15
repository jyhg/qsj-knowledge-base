import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { DqcPublishService } from "./dqc-publish.service.js";

@Controller("dqc-publish")
export class DqcPublishController {
  constructor(private readonly dqcPublishService: DqcPublishService) {}

  @Post()
  create(@Body() body: { title: string; tableIds: string[]; createdBy?: string }) {
    return this.dqcPublishService.create(body);
  }

  @Post(":publishId/diff")
  generateDiff(@Param("publishId") publishId: string) {
    return this.dqcPublishService.generateDiff(publishId);
  }

  @Get(":publishId/diff")
  getDiff(@Param("publishId") publishId: string) {
    return this.dqcPublishService.getDiff(publishId);
  }

  @Post(":publishId/confirm")
  confirm(@Param("publishId") publishId: string) {
    return this.dqcPublishService.confirm(publishId);
  }

  @Post(":publishId/sync")
  sync(@Param("publishId") publishId: string) {
    return this.dqcPublishService.sync(publishId);
  }
}
