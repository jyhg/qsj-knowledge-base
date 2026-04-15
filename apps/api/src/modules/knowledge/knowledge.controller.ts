import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post
} from "@nestjs/common";
import type { CreateKnowledgeCardInput } from "@qsj/shared-types";

import { KnowledgeService } from "./knowledge.service.js";

@Controller("knowledge")
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get("cards")
  listCards() {
    return this.knowledgeService.list();
  }

  @Post("cards")
  createCard(@Body() body: CreateKnowledgeCardInput) {
    return this.knowledgeService.create(body);
  }

  @Get("cards/:cardId")
  getCard(@Param("cardId") cardId: string) {
    return this.knowledgeService.get(cardId);
  }

  @Patch("cards/:cardId")
  updateCard(
    @Param("cardId") cardId: string,
    @Body() body: Partial<CreateKnowledgeCardInput>
  ) {
    return this.knowledgeService.update(cardId, body);
  }

  @Get("cards/:cardId/versions")
  versions(@Param("cardId") cardId: string) {
    return this.knowledgeService.versions(cardId);
  }

  @Post("rules/:ruleId/rollback")
  rollbackRule(@Param("ruleId") ruleId: string) {
    return this.knowledgeService.rollbackRule(ruleId);
  }

  @Post("implementations/:implementationId/rollback")
  rollbackImplementation(@Param("implementationId") implementationId: string) {
    return this.knowledgeService.rollbackImplementation(implementationId);
  }

  @Post("cards/:cardId/clone")
  clone(@Param("cardId") cardId: string) {
    return this.knowledgeService.clone(cardId);
  }
}

