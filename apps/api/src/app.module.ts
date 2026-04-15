import { Module } from "@nestjs/common";

import { CompareModule } from "./modules/compare/compare.module.js";
import { KnowledgeModule } from "./modules/knowledge/knowledge.module.js";
import { MetaModule } from "./modules/meta/meta.module.js";
import { NotificationsModule } from "./modules/notifications/notifications.module.js";
import { TasksModule } from "./modules/tasks/tasks.module.js";
import { UsersModule } from "./modules/users/users.module.js";

@Module({
  imports: [
    UsersModule,
    TasksModule,
    KnowledgeModule,
    CompareModule,
    NotificationsModule,
    MetaModule
  ]
})
export class AppModule {}

