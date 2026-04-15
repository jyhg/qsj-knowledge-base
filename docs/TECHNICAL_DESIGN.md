# 数仓测试用例知识库与验数运营台 技术设计文档 v2.0

基于 [SPEC.md](/Users/zz/Documents/gitproject/qsj-knowledge-base/docs/SPEC.md#L1) 与 [PAGE_PROTOTYPE_IA.md](/Users/zz/Documents/gitproject/qsj-knowledge-base/docs/PAGE_PROTOTYPE_IA.md#L1) 输出。

本文件用于将当前产品定义收敛为可开发的技术方案，覆盖：

1. 系统架构。
2. 前端路由。
3. 后端领域模块与 API。
4. 数据模型。
5. `one service + DQC + Git` 三类外部能力的集成方式。

## 1. 技术目标
本设计需要解决 6 个问题：

1. 如何支撑“表优先”的信息架构。
2. 如何支撑 `观测点 -> 测试用例 -> 业务规则 -> DQC 发布实例` 的分层建模。
3. 如何把 `one service` 明确做成手动即时执行通道。
4. 如何把 DQC 明确做成定时监控发布通道。
5. 如何让知识资产以 Git 为权威版本源，同时又支持页面化编辑。
6. 如何以 MVP 复杂度落地，不引入过重基础设施。

## 2. 技术方案总览
### 2.1 默认技术选型
在没有现存代码约束的前提下，推荐采用以下简化方案：

1. 前端：`Next.js 15 + TypeScript + App Router`
2. 组件层：`shadcn/ui + Tailwind CSS`
3. 后端：`NestJS + TypeScript`
4. 数据库：`SQLite`
5. 数据访问：手写 Repository，不引入 ORM
6. 异步执行：应用内 Job Worker
7. AI 编排：独立 `ai-orchestrator` 模块
8. Git 集成：应用内 Git Adapter，调用本地 `git` 命令或等价库
9. 鉴权：内部账号体系，仅区分 `dw_developer` 与 `pm`

### 2.2 设计原则
1. 表是第一入口，对象分层是内部模型，不是首页入口。
2. `one service` 与 DQC 是双执行通道，后端必须显式拆开。
3. Git 是知识资产权威源，数据库是运行态索引和执行记录承载。
4. 先保证结构清晰与可追溯，再考虑高并发与自动化。
5. 首版允许大量同步接口配合少量异步执行接口，不追求过度事件化。

### 2.3 为什么这样选
1. 前后端统一 TypeScript，降低沟通成本。
2. Next.js 适合标准化运营台。
3. NestJS 适合领域模块拆分。
4. SQLite 足以支撑单实例内部工具 MVP。
5. 手写 Repository 对这种强定制建模更直接。
6. Git Adapter 能把“页面编辑”与“版本化资产”衔接起来。

## 3. 系统架构
### 3.1 逻辑分层
```text
Web UI
  -> BFF / API Gateway
    -> Table Asset Domain
    -> Observation Domain
    -> Test Case Domain
    -> Business Rule Domain
    -> Manual Run Domain
    -> DQC Publish Domain
    -> Feedback Domain
    -> Git Version Domain
    -> Audit Domain
    -> Notification Domain
    -> AI Orchestrator
      -> one service Adapter
      -> DQC Adapter
      -> Git Adapter
      -> SQLite
```

### 3.2 关键分层说明
#### Web UI
负责：

1. 表列表与表详情。
2. 测试用例选择与 `one service` 手动执行。
3. DQC 差异回填。
4. Git 版本查看与回滚。

#### API Gateway
负责：

1. 统一身份上下文。
2. 参数校验。
3. DTO 转换。
4. 聚合多领域返回。

#### 领域层
分为 8 个核心领域：

1. 表资产。
2. 观测点。
3. 测试用例。
4. 业务规则。
5. `one service` 手动执行。
6. DQC 发布。
7. 反馈回写。
8. Git 版本。

#### AI Orchestrator
负责：

1. 基于表召回相关资产。
2. 生成补充测试用例草案。
3. 生成 DQC 映射草案。
4. 生成异常解释草案。

注意：

1. AI 只产出草案，不直接生效。
2. AI 不跳过结构化对象层。

### 3.3 推荐仓库结构
```text
apps/
  web/
  api/

packages/
  shared-types/
  ui/
  config/

knowledge-assets/
  tables/
  observation-points/
  test-cases/
  business-rules/
  dqc-mappings/
  releases/

docs/
  SPEC.md
  PAGE_PROTOTYPE_IA.md
  TECHNICAL_DESIGN.md

apps/api/db/
  schema.sql
```

### 3.4 Git 与数据库的职责边界
#### Git 负责
1. 表资产定义。
2. 观测点定义。
3. 测试用例定义。
4. 业务规则定义。
5. DQC 映射定义。
6. DQC 发布快照。

#### 数据库负责
1. 表资产索引。
2. 任务与批次。
3. `one service` 执行记录。
4. DQC 同步记录。
5. 页面提示。
6. 审计日志。

## 4. 领域模块拆分
### 4.1 Table Asset 模块
负责：

1. 表列表。
2. 表详情聚合。
3. 表级摘要计算。
4. 表与观测点 / 测试用例 / 业务规则 / DQC 映射的索引关系。

### 4.2 Observation 模块
负责：

1. 观测点 CRUD。
2. 观测点结构校验。
3. 观测点与测试用例关联维护。

### 4.3 Test Case 模块
负责：

1. 测试用例 CRUD。
2. 执行通道标记。
3. SQL 模板管理。
4. 结果解析策略管理。
5. DQC 可发布性标记。

### 4.4 Business Rule 模块
负责：

1. 业务规则 CRUD。
2. 业务规则与观测点关联。
3. 业务规则与测试用例关联。
4. 异常解释辅助信息管理。

### 4.5 Manual Run 模块
负责：

1. 手动验数任务创建。
2. 规则集合选择。
3. 批次执行。
4. 调用 `one service`。
5. 聚合返回结果。
6. 输出异常摘要。

### 4.6 DQC Publish 模块
负责：

1. DQC 差异计算。
2. DQC 草案生成。
3. 与当前 DQC 规则比对。
4. 人工确认后的同步或导出。

### 4.7 Feedback 模块
负责：

1. 批量回写草案生成。
2. 结构化回写项选择。
3. 触发 Git 变更。
4. 回写状态管理。

### 4.8 Git Version 模块
负责：

1. 结构化资产落盘。
2. Git 变更集生成。
3. 提交记录索引。
4. 版本差异对比。
5. 回滚操作。

### 4.9 Audit 模块
负责：

1. `one service` 调用审计。
2. DQC 同步审计。
3. Git 变更审计。
4. 回滚审计。

### 4.10 Notification 模块
负责：

1. 待确认回写提示。
2. 待确认 DQC 更新提示。
3. 结果失效提示。
4. 回滚通知。

## 5. 前端路由设计
### 5.1 路由清单
| 路由 | 页面 | 角色 | 说明 |
| --- | --- | --- | --- |
| `/` | 工作台 | 数仓开发/PM | 首页 |
| `/tables` | 表列表 | 数仓开发/PM | 表资产第一入口 |
| `/tables/[tableId]` | 表详情 | 数仓开发/PM | 顶部摘要 + Tabs |
| `/tables/[tableId]/edit` | 表资产编辑 | 数仓开发 | 编辑表级资产 |
| `/manual-runs/new` | 手动验数任务录入 | 数仓开发 | 创建分析验数/开发自测任务 |
| `/manual-runs/[runId]/select` | 规则集合选择 | 数仓开发 | 勾选测试用例 |
| `/manual-runs/[runId]/executing` | 执行中 | 数仓开发 | 轮询 `one service` 状态 |
| `/manual-runs/[runId]/results` | 执行结果 | 数仓开发/PM | 总览、异常、下钻 |
| `/manual-runs/[runId]/feedback` | 批量回写 | 数仓开发 | 回写确认 |
| `/dqc-publish` | DQC 回填入口 | 数仓开发/PM | 选择涉及表 |
| `/dqc-publish/[publishId]/diff` | DQC 差异页 | 数仓开发/PM | 新增/更新/下线差异 |
| `/versions` | 版本记录 | 数仓开发/PM | Git 提交与差异 |
| `/versions/[versionId]` | 版本详情 | 数仓开发/PM | 差异与关联对象 |
| `/notifications` | 我的提示 | 数仓开发/PM | 页面提示中心 |

### 5.2 路由状态参数
#### `/tables`
查询参数建议：

1. `keyword`
2. `domain`
3. `riskLevel`
4. `hasOneService`
5. `hasDqc`
6. `owner`

#### `/tables/[tableId]`
查询参数建议：

1. `tab`
2. `status`
3. `channel`
4. `riskLevel`

#### `/manual-runs/[runId]/results`
查询参数建议：

1. `tableId`
2. `testCaseId`
3. `resultStatus`
4. `showOnlyAbnormal`

#### `/dqc-publish/[publishId]/diff`
查询参数建议：

1. `tableId`
2. `changeType`
3. `status`

## 6. 前端模块设计
### 6.1 页面组件层次
```text
Page
  -> Container
    -> HeaderSummary
    -> FilterBar
    -> DataTable / Tabs / Drawer / DiffViewer
    -> ActionBar
```

### 6.2 关键前端模块
1. `TableAssetList`
2. `TableSummaryHeader`
3. `TestCaseTable`
4. `ObservationTable`
5. `BusinessRulePanel`
6. `ExecutionPublishPanel`
7. `ManualRunForm`
8. `RuleSelectionTable`
9. `ManualRunProgress`
10. `AbnormalSummaryTable`
11. `FeedbackBatchSelector`
12. `DqcDiffTable`
13. `GitVersionTimeline`
14. `DiffViewer`

### 6.3 状态管理建议
1. 页面级异步数据：`TanStack Query`
2. 表单：`React Hook Form + Zod`
3. 全局用户信息：`zustand` 或 `React Context`
4. 大表格筛选与勾选：页面局部 store

## 7. 后端 API 设计
### 7.1 API 风格
采用 `REST + async polling`。

原则：

1. 资产 CRUD 接口以同步为主。
2. `one service` 执行与 DQC 差异同步用异步接口。
3. Git 写入可封装为同步请求触发的后台任务。
4. 所有写操作都带操作者信息。

基础前缀：
```text
/api/v1
```

### 7.2 认证与用户
#### `GET /api/v1/me`
返回当前用户身份和角色。

响应示例：
```json
{
  "id": "usr_xxx",
  "name": "张三",
  "role": "dw_developer"
}
```

## 7.3 表资产接口
### `GET /api/v1/tables`
获取表列表。

支持参数：

1. `keyword`
2. `domain`
3. `riskLevel`
4. `hasOneService`
5. `hasDqc`
6. `owner`

### `GET /api/v1/tables/:tableId`
获取表详情聚合数据。

返回内容：

1. 表摘要。
2. 观测点摘要。
3. 测试用例摘要。
4. 业务规则摘要。
5. DQC 映射摘要。
6. 当前版本信息。

### `PATCH /api/v1/tables/:tableId`
更新表级元数据。

### `GET /api/v1/tables/:tableId/test-cases`
获取该表的测试用例列表。

### `GET /api/v1/tables/:tableId/observations`
获取该表的观测点列表。

### `GET /api/v1/tables/:tableId/business-rules`
获取该表的业务规则列表。

### `GET /api/v1/tables/:tableId/execution-publish`
获取执行 / 发布页聚合数据。

## 7.4 观测点接口
### `POST /api/v1/observations`
新建观测点。

请求示例：
```json
{
  "tableId": "tbl_ads_app_qsj_agg_cate_conv",
  "name": "转化率_平台玩法经营类型",
  "metricCode": "conversion_rate",
  "timeGrain": "day",
  "dimensions": ["biz_date", "platform", "play_type", "operate_mode"],
  "filters": [],
  "aggregation": "sum(conversion_cnt) / sum(click_cnt)",
  "sceneTags": ["analysis_validation", "development_self_test"]
}
```

### `PATCH /api/v1/observations/:observationId`
更新观测点。

### `GET /api/v1/observations/:observationId`
获取观测点详情。

## 7.5 测试用例接口
### `POST /api/v1/test-cases`
新建测试用例。

### `PATCH /api/v1/test-cases/:testCaseId`
更新测试用例。

### `GET /api/v1/test-cases/:testCaseId`
获取测试用例详情。

### `POST /api/v1/test-cases/:testCaseId/clone`
复制测试用例。

### `POST /api/v1/test-cases/:testCaseId/validate`
校验测试用例定义是否合法。

## 7.6 业务规则接口
### `POST /api/v1/business-rules`
新建业务规则。

### `PATCH /api/v1/business-rules/:ruleId`
更新业务规则。

### `GET /api/v1/business-rules/:ruleId`
获取业务规则详情。

## 7.7 手动验数接口
### `POST /api/v1/manual-runs`
创建手动验数任务。

请求示例：
```json
{
  "title": "4月渠道投放归因开发自测",
  "scene": "development_self_test",
  "tableIds": ["tbl_ads_app_qsj_agg_cate_conv", "tbl_ads_app_qsj_zz_secondhand"],
  "metricCodes": ["conversion_rate", "order_cnt"],
  "requirementDesc": "新增玩法维度，自测转化表现",
  "changeDesc": "调整投流 / 自营口径",
  "businessDateStart": "2026-04-01",
  "businessDateEnd": "2026-04-07",
  "executorUserId": "usr_dw_1"
}
```

### `GET /api/v1/manual-runs/:runId/candidates`
根据表召回候选测试用例。

返回内容：

1. 命中的表。
2. 命中的测试用例。
3. 推荐理由。
4. 执行通道。

### `POST /api/v1/manual-runs/:runId/execute`
提交本次选择的测试用例，通过 `one service` 发起执行。

请求示例：
```json
{
  "selectedTestCaseIds": ["tc_1", "tc_2"]
}
```

响应示例：
```json
{
  "manualRunBatchId": "mrb_001",
  "status": "queued"
}
```

### `GET /api/v1/manual-runs/:runId/status`
查询批次执行状态。

### `GET /api/v1/manual-runs/:runId/results`
查询执行结果。

返回内容：

1. 批次总览。
2. 异常摘要。
3. 按表分组结果。
4. 按测试用例分组结果。
5. `one service` 返回摘要。
6. 关联业务规则。

## 7.8 批量回写接口
### `POST /api/v1/manual-runs/:runId/feedback-batches`
创建回写批次。

请求示例：
```json
{
  "reason": "补充直播玩法下经营类型异常模式",
  "applicableScenes": ["analysis_validation", "development_self_test"],
  "items": [
    {
      "itemType": "business_rule",
      "sourceId": "rule_draft_1",
      "selected": true
    },
    {
      "itemType": "anomaly_pattern",
      "sourceId": "finding_1",
      "selected": true
    }
  ]
}
```

### `POST /api/v1/feedback-batches/:batchId/confirm`
确认回写，并触发 Git 变更。

## 7.9 DQC 回填接口
### `POST /api/v1/dqc-publish`
创建 DQC 回填任务。

### `POST /api/v1/dqc-publish/:publishId/diff`
基于涉及表生成 DQC 差异清单。

### `GET /api/v1/dqc-publish/:publishId/diff`
查询差异结果。

返回内容：

1. 当前 DQC 规则。
2. 建议新增规则。
3. 建议更新规则。
4. 建议下线规则。

### `POST /api/v1/dqc-publish/:publishId/confirm`
人工确认差异结果。

### `POST /api/v1/dqc-publish/:publishId/sync`
执行同步，或生成导出包。

## 7.10 Git 版本接口
### `GET /api/v1/versions`
获取 Git 版本列表。

### `GET /api/v1/versions/:versionId`
获取单次版本详情与差异。

### `POST /api/v1/versions/:versionId/rollback`
执行回滚。

## 7.11 通知接口
### `GET /api/v1/notifications`
获取页面提示。

### `POST /api/v1/notifications/:notificationId/read`
标记已读。

## 8. 数据库设计
### 8.1 建模原则
1. 知识资产与执行记录分表。
2. 多对多关系显式建中间表。
3. Git 版本与数据库版本索引显式建模。
4. SQLite 兼容 SQL 为基线。

### 8.2 表清单
#### 1. `users`
```sql
id                  varchar primary key
name                varchar not null
email               varchar null
role                varchar not null
status              varchar not null
created_at          datetime not null
updated_at          datetime not null
```

#### 2. `table_assets`
```sql
id                  varchar primary key
table_name          varchar not null unique
display_name        varchar not null
domain_code         varchar null
description         text null
risk_level          varchar not null
owner_user_id       varchar null
status              varchar not null -- draft / active / deprecated
current_version_id  varchar null
created_at          datetime not null
updated_at          datetime not null
```

#### 3. `observation_points`
```sql
id                  varchar primary key
table_asset_id      varchar not null
name                varchar not null
metric_code         varchar not null
metric_name         varchar not null
aggregation_expr    text not null
time_grain          varchar not null
dimension_json      text not null
filter_json         text not null
scene_tags_json     text not null
status              varchar not null
git_path            varchar not null
version_no          int not null
created_by          varchar not null
created_at          datetime not null
updated_at          datetime not null
```

#### 4. `test_cases`
```sql
id                  varchar primary key
table_asset_id      varchar not null
name                varchar not null
test_case_type      varchar not null
logic_desc          text not null
threshold_desc      text null
sql_template        text not null
supports_one_service boolean not null
supports_dqc        boolean not null
one_service_parser  varchar null
dqc_template_type   varchar null
risk_level          varchar not null
status              varchar not null
git_path            varchar not null
version_no          int not null
created_by          varchar not null
created_at          datetime not null
updated_at          datetime not null
```

#### 5. `business_rules`
```sql
id                  varchar primary key
table_asset_id      varchar not null
name                varchar not null
semantic_desc       text not null
applicable_scope    text null
exception_scope     text null
common_causes       text null
analysis_hint       text null
status              varchar not null
git_path            varchar not null
version_no          int not null
created_by          varchar not null
created_at          datetime not null
updated_at          datetime not null
```

#### 6. `test_case_observation_links`
```sql
id                  varchar primary key
test_case_id        varchar not null
observation_id      varchar not null
created_at          datetime not null
```

#### 7. `business_rule_observation_links`
```sql
id                  varchar primary key
business_rule_id    varchar not null
observation_id      varchar not null
created_at          datetime not null
```

#### 8. `business_rule_test_case_links`
```sql
id                  varchar primary key
business_rule_id    varchar not null
test_case_id        varchar not null
created_at          datetime not null
```

#### 9. `dqc_deployments`
```sql
id                  varchar primary key
table_asset_id      varchar not null
test_case_id        varchar not null
dqc_rule_type       varchar not null
monitor_name        varchar not null
monitor_object      varchar not null
monitor_field       varchar null
pre_sql             text null
condition_expr      text not null
schedule_cycle      varchar null
schedule_time       varchar null
alert_level         varchar null
receivers_json      text null
dqc_rule_id         varchar null
publish_status      varchar not null -- draft / pending_confirm / published / offline
last_synced_at      datetime null
git_path            varchar not null
version_no          int not null
created_at          datetime not null
updated_at          datetime not null
```

#### 10. `manual_runs`
```sql
id                  varchar primary key
title               varchar not null
scene               varchar not null -- analysis_validation / development_self_test
table_ids_json      text not null
metric_codes_json   text not null
requirement_desc    text not null
change_desc         text not null
business_date_start date not null
business_date_end   date not null
executor_user_id    varchar not null
status              varchar not null -- draft / selecting / queued / running / pending_feedback / completed / failed
created_at          datetime not null
updated_at          datetime not null
```

#### 11. `manual_run_selected_test_cases`
```sql
id                  varchar primary key
manual_run_id       varchar not null
test_case_id        varchar not null
selected            boolean not null
created_at          datetime not null
```

#### 12. `manual_run_batches`
```sql
id                  varchar primary key
manual_run_id       varchar not null
one_service_request_id varchar null
status              varchar not null -- queued / running / succeeded / failed
triggered_by        varchar not null
started_at          datetime null
finished_at         datetime null
error_message       text null
created_at          datetime not null
```

#### 13. `manual_run_sql_jobs`
```sql
id                  varchar primary key
batch_id            varchar not null
test_case_id        varchar not null
sql_text            text not null
sql_summary         text not null
execution_status    varchar not null
result_row_count    bigint null
raw_result_json     text null
parsed_result_json  text null
started_at          datetime null
finished_at         datetime null
error_message       text null
created_at          datetime not null
```

#### 14. `manual_run_findings`
```sql
id                  varchar primary key
batch_id            varchar not null
table_asset_id      varchar not null
test_case_id        varchar not null
business_rule_id    varchar null
result_status       varchar not null -- passed / warning / failed
finding_summary     text not null
abnormal_dimensions_json text null
evidence_json       text not null
one_service_summary text null
sort_score          numeric not null default 0
created_at          datetime not null
```

#### 15. `feedback_batches`
```sql
id                  varchar primary key
manual_run_id       varchar not null
reason              text not null
applicable_scenes_json text not null
status              varchar not null -- pending / confirmed / cancelled
confirmed_by        varchar null
created_at          datetime not null
confirmed_at        datetime null
```

#### 16. `feedback_batch_items`
```sql
id                  varchar primary key
batch_id            varchar not null
item_type           varchar not null -- observation / test_case / business_rule / anomaly_pattern / dqc_mapping
source_id           varchar not null
selected            boolean not null
payload_json        text not null
created_at          datetime not null
```

#### 17. `dqc_publish_tasks`
```sql
id                  varchar primary key
title               varchar not null
table_ids_json      text not null
status              varchar not null -- draft / diff_ready / pending_confirm / syncing / completed / failed
created_by          varchar not null
created_at          datetime not null
updated_at          datetime not null
```

#### 18. `dqc_publish_diffs`
```sql
id                  varchar primary key
publish_task_id     varchar not null
table_asset_id      varchar not null
test_case_id        varchar not null
current_dqc_status  varchar not null
suggested_action    varchar not null -- create / update / offline / unchanged
reason              text not null
selected            boolean not null default false
created_at          datetime not null
```

#### 19. `git_versions`
```sql
id                  varchar primary key
commit_sha          varchar not null
commit_message      text not null
author_user_id      varchar not null
related_object_type varchar not null
related_object_id   varchar not null
version_no          int not null
created_at          datetime not null
```

#### 20. `git_change_items`
```sql
id                  varchar primary key
git_version_id      varchar not null
file_path           varchar not null
change_type         varchar not null -- add / modify / delete
diff_summary        text null
created_at          datetime not null
```

#### 21. `notifications`
```sql
id                  varchar primary key
user_id             varchar not null
notification_type   varchar not null
title               varchar not null
content             text not null
related_object_type varchar null
related_object_id   varchar null
read_at             datetime null
created_at          datetime not null
```

#### 22. `audit_logs`
```sql
id                  varchar primary key
actor_user_id       varchar not null
action_type         varchar not null
target_type         varchar not null
target_id           varchar not null
payload_json        text not null
created_at          datetime not null
```

## 9. 结构化资产文件设计
### 9.1 文件组织建议
```text
knowledge-assets/
  tables/
    ads_app_qsj_agg_cate_conv.yaml
  observation-points/
    op_conversion_rate_platform_play_mode.yaml
  test-cases/
    tc_self_vs_paid_conversion.yaml
  business-rules/
    br_self_conversion_lower_than_paid.yaml
  dqc-mappings/
    dqc_tc_table_consistency.yaml
```

### 9.2 YAML 示例
#### 观测点
```yaml
id: op_conversion_rate_platform_play_mode
table: ads_app_qsj_agg_cate_conv
metric_code: conversion_rate
time_grain: day
dimensions:
  - biz_date
  - platform
  - play_type
  - operate_mode
filters: []
aggregation: sum(conversion_cnt) / sum(click_cnt)
status: active
version_no: 3
```

#### 测试用例
```yaml
id: tc_self_vs_paid_conversion
table: ads_app_qsj_agg_cate_conv
type: business_constraint
observation_ids:
  - op_conversion_rate_platform_play_mode
supports_one_service: true
supports_dqc: false
sql_template: |
  select ...
one_service_parser: percentage_compare
status: active
version_no: 2
```

## 10. 关键流程与时序
### 10.1 分析验数 / 开发自测时序
```text
用户
  -> Web: 创建 manual run
  -> API: 保存 manual_runs
  -> API: 按 tableIds 召回 test cases
  -> Web: 选择 test cases
  -> API: 创建 manual_run_batch
  -> Manual Run Worker: 生成 SQL
  -> one service Adapter: 提交 SQL
  -> one service Adapter: 轮询 / 获取结果
  -> Manual Run Worker: 解析结果
  -> API: 写入 findings
  -> Web: 展示异常摘要与结论
```

### 10.2 DQC 回填时序
```text
用户
  -> Web: 创建 dqc publish task
  -> API: 读取 tableIds 对应 test cases
  -> DQC Publish Service: 过滤 supports_dqc = true
  -> DQC Adapter: 读取当前 DQC 规则
  -> DQC Publish Service: 计算 diff
  -> Web: 展示新增 / 更新 / 下线建议
  -> 用户确认
  -> DQC Adapter: 同步或导出
  -> API: 写入同步结果
```

### 10.3 批量回写时序
```text
用户
  -> Web: 选择回写项
  -> API: 创建 feedback batch
  -> Git Version Service: 生成结构化文件
  -> Git Adapter: git add / commit
  -> API: 写入 git_versions
  -> Table Asset Service: 更新 current_version_id
```

### 10.4 回滚时序
```text
用户
  -> Web: 选择版本回滚
  -> API: 校验权限
  -> Git Adapter: 执行回滚
  -> API: 更新索引
  -> Notification Service: 发送页面提示
```

## 11. 外部集成设计
### 11.1 one service Adapter
职责：

1. 提交 SQL。
2. 获取请求 ID。
3. 轮询执行状态。
4. 返回结果原文。

接口建议：
```ts
interface OneServiceAdapter {
  submitSql(input: {
    sql: string;
    submittedBy: string;
    scene: 'analysis_validation' | 'development_self_test';
  }): Promise<{ requestId: string }>;

  getStatus(requestId: string): Promise<{
    status: 'queued' | 'running' | 'succeeded' | 'failed';
    rowCount?: number;
    rawResult?: unknown;
    errorMessage?: string;
  }>;
}
```

约束：

1. 只允许只读 SQL。
2. 批次大小需要限制。
3. 原始返回结果建议保留采样。

### 11.2 DQC Adapter
职责：

1. 获取当前 DQC 规则。
2. 创建 / 更新 / 下线规则。
3. 生成导出包。

接口建议：
```ts
interface DqcAdapter {
  listRulesByTables(tableNames: string[]): Promise<DqcRuleSnapshot[]>;
  syncRules(changes: DqcRuleChange[]): Promise<{ syncId: string }>;
  exportRules(changes: DqcRuleChange[]): Promise<{ filePath: string }>;
}
```

### 11.3 Git Adapter
职责：

1. 结构化文件写入。
2. 生成提交。
3. 查看提交详情。
4. 回滚。

接口建议：
```ts
interface GitAdapter {
  writeFiles(files: Array<{ path: string; content: string }>): Promise<void>;
  commit(input: { message: string; authorName: string }): Promise<{ sha: string }>;
  showCommit(sha: string): Promise<{ diff: string }>;
  rollbackToCommit(sha: string): Promise<void>;
}
```

## 12. 权限模型
| 动作 | 数仓开发 | PM |
| --- | --- | --- |
| 查看表资产 | Y | Y |
| 编辑观测点 | Y | N |
| 编辑测试用例 | Y | N |
| 编辑业务规则草稿 | Y | Y |
| 触发 `one service` 执行 | Y | N |
| 查看执行结果 | Y | Y |
| 确认回写 | Y | N |
| 发起 DQC 同步 | Y | N |
| 查看版本记录 | Y | Y |
| 执行回滚 | Y | N |

## 13. 审计与日志
### 13.1 必须审计的动作
1. 创建 / 编辑 / 删除表资产。
2. 创建 / 编辑 / 删除观测点。
3. 创建 / 编辑 / 删除测试用例。
4. 创建 / 编辑 / 删除业务规则。
5. 触发 `one service` 执行。
6. DQC 差异确认与同步。
7. Git 提交。
8. 回滚。

### 13.2 关键日志事件
1. `MANUAL_RUN_CREATED`
2. `MANUAL_RUN_EXECUTION_STARTED`
3. `MANUAL_RUN_EXECUTION_FAILED`
4. `MANUAL_RUN_RESULT_PARSED`
5. `DQC_DIFF_GENERATED`
6. `DQC_SYNC_STARTED`
7. `DQC_SYNC_FAILED`
8. `FEEDBACK_BATCH_CONFIRMED`
9. `GIT_COMMIT_CREATED`
10. `GIT_ROLLBACK_EXECUTED`

## 14. MVP 实施顺序
### Phase 1：表资产与手动执行闭环
1. 表列表。
2. 表详情。
3. 观测点 / 测试用例 / 业务规则基础建模。
4. `one service` 手动执行。
5. 执行结果页。

### Phase 2：批量回写与 Git 版本化
1. 回写批次。
2. 结构化文件落盘。
3. Git 提交记录。
4. 版本列表。

### Phase 3：DQC 回填闭环
1. DQC 差异计算。
2. 人工确认。
3. 同步或导出。

## 15. 已知风险与技术应对
1. 风险：`one service` 返回结构不稳定。
应对：引入 `one_service_parser` 策略字段，按测试用例类型做解析。

2. 风险：Git 文件与数据库索引不一致。
应对：Git 提交成功后再刷新数据库索引；失败则整批回滚。

3. 风险：一张表关联对象过多，详情页查询慢。
应对：表详情接口按 Tab 分段拉取，不一次返回全部明细。

4. 风险：DQC 实际接口字段未完全确定。
应对：先用内部 `DqcRuleChange` 模型隔离外部协议。

5. 风险：SQLite 对并发写入能力有限。
应对：MVP 先控制单实例；后续平滑迁移 PostgreSQL。

## 16. 下阶段待确认技术问题
1. `one service` 的真实请求协议、认证方式、轮询机制。
2. DQC 规则读取与同步接口字段协议。
3. Git 变更是在同仓提交还是独立资产仓提交。
4. YAML 是否为最终资产格式，还是 JSON 更适合。
5. 首批试点表的真实 SQL 模板复杂度是否会要求引入模板引擎。

---

本版技术设计的核心目标，是让实现层与当前产品定义完全一致：表优先、测试用例优先、`one service` 负责即时手动验数、DQC 负责长期监控、Git 负责知识资产版本治理。
