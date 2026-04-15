import { Controller, Get, Param, Post } from "@nestjs/common";

import { VersionsService } from "./versions.service.js";

@Controller("versions")
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get()
  list() {
    return this.versionsService.list();
  }

  @Get(":versionId")
  get(@Param("versionId") versionId: string) {
    return this.versionsService.get(versionId);
  }

  @Post(":versionId/rollback")
  rollback(@Param("versionId") versionId: string) {
    return this.versionsService.rollback(versionId);
  }
}
