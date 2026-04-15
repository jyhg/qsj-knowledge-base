import { Module } from "@nestjs/common";

import { CompareModule } from "./modules/compare/compare.module.js";
import { DqcPublishModule } from "./modules/dqc-publish/dqc-publish.module.js";
import { KnowledgeModule } from "./modules/knowledge/knowledge.module.js";
import { ManualRunsModule } from "./modules/manual-runs/manual-runs.module.js";
import { MetaModule } from "./modules/meta/meta.module.js";
import { NotificationsModule } from "./modules/notifications/notifications.module.js";
import { TablesModule } from "./modules/tables/tables.module.js";
import { TasksModule } from "./modules/tasks/tasks.module.js";
import { UsersModule } from "./modules/users/users.module.js";
import { VersionsModule } from "./modules/versions/versions.module.js";

@Module({
  imports: [
    UsersModule,
    TablesModule,
    ManualRunsModule,
    DqcPublishModule,
    VersionsModule,
    TasksModule,
    KnowledgeModule,
    CompareModule,
    NotificationsModule,
    MetaModule
  ]
})
export class AppModule {}
