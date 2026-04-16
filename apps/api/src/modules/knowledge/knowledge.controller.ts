import {
  Body,
  Controller,
  Param,
  Post
} from "@nestjs/common";
// import type { CreateKnowledgeCardInput } from "@qsj/shared-types"; // No longer needed

import { KnowledgeService } from "./knowledge.service.js";

@Controller("knowledge")
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  // Removed listCards, createCard, getCard, updateCard, versions methods

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

