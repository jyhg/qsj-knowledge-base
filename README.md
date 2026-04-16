# qsj-knowledge-base

`qsj-knowledge-base` 是一个面向数仓开发和 PM 的“数仓测试用例知识库与验数运营台”。

它把分散在表、SQL、历史经验和业务规则里的验数知识沉淀为可维护资产，并围绕“表优先”流程提供手动验数、DQC 回填和版本追踪能力。

## 项目功能

- **表资产管理**：以表为第一入口查看和维护观测点、测试用例、业务规则等知识资产。
- **验数执行台**：在取数分析和开发自测场景下，按表筛选规则集合，并通过 `one service` 手动触发执行。
- **DQC 回填台**：对比知识库规则与 DQC 当前配置差异，人工确认后回填长期监控规则。
- **版本记录与追踪**：结合 Git 记录知识资产变更、影响范围和回滚线索。
- **PM / 数仓协同维护**：支持 PM 与数仓开发共同维护知识沉淀。

## 技术栈

- 前端：Next.js 15 + React 19 + TypeScript
- 后端：NestJS 11 + TypeScript
- 数据库：SQLite
- 测试：Node Test Runner + Playwright

## 项目结构

```text
apps/
  api/      # NestJS API
  web/      # Next.js 前端
packages/
  shared-types/
docs/       # 产品说明、原型和技术设计
tests/      # 对齐测试与端到端测试
```

## 启动方式

### 1. 安装依赖

```bash
npm install
```

### 2. 启动后端

```bash
npm run dev:api
```

默认监听地址：`http://localhost:3001/api/v1`

说明：
- 本地开发默认使用 SQLite。
- 如果未配置 `ONE_SERVICE_BASE_URL`，验数执行会走本地 mock 模式。
- 如需接入真实 `one service`，可在启动前设置以下环境变量：

```bash
export ONE_SERVICE_BASE_URL="<your-one-service-base-url>"
export ONE_SERVICE_TOKEN="<your-token>"
```

### 3. 启动前端

```bash
npm run dev:web
```

默认访问地址：`http://localhost:3000`

前端默认请求 `http://localhost:3001/api/v1`。如需自定义，可在启动前设置：

```bash
export NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api/v1"
```

### 4. 打开页面

浏览器访问：

```text
http://localhost:3000
```

## 常用命令

```bash
npm run build:api      # 构建后端
npm run build:web      # 构建前端
npm test               # 运行项目测试
npm run test:e2e       # 运行 Playwright E2E 测试
```

## 补充说明

- 首页包含工作台、表资产、验数执行台、DQC 回填台、版本记录和通知入口。
- 项目文档位于 `docs/`，其中 `SPEC.md` 和 `TECHNICAL_DESIGN.md` 说明了产品定位与技术设计。
