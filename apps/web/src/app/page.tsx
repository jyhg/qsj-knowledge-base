import {
  getCurrentUser,
  getDqcPublishDiff,
  getManualRunResults,
  listGitVersions,
  listNotifications,
  listTableAssets
} from "../lib/api";
import {
  formatDateTime,
  getManualRunBatchStatusLabel,
  getRiskLabel
} from "../lib/table-first-presentation";

export default async function HomePage() {
  const [user, tables, notifications, versions, latestRun, dqcDiffs] = await Promise.all([
    getCurrentUser(),
    listTableAssets(),
    listNotifications(),
    listGitVersions(),
    getManualRunResults("mr_1"),
    getDqcPublishDiff("dqc_task_1")
  ]);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Table First Console</span>
        <h1>数仓测试用例知识库与验数运营台</h1>
        <p>
          UI 已切到“表”为第一入口，围绕表资产、one service 手动验数、DQC 回填与 Git 版本追踪组织主流程。
        </p>
      </section>

      <section className="grid cols-2">
        <div className="panel">
          <h2 className="section-title">核心入口</h2>
          <div className="button-row">
            <a className="button" href="/tables">
              表资产
            </a>
            <a className="button secondary" href="/manual-runs/new">
              验数执行台
            </a>
            <a className="button secondary" href="/dqc-publish">
              DQC 回填台
            </a>
            <a className="button secondary" href="/versions">
              版本记录
            </a>
          </div>
        </div>
        <div className="panel">
          <h2 className="section-title">当前角色</h2>
          <div className="stat">
            <span className="stat-value">{user.name}</span>
            <span className="muted">角色：数仓开发</span>
          </div>
        </div>
      </section>

      <section className="grid cols-3">
        <div className="panel stat">
          <span className="muted">表资产</span>
          <span className="stat-value">{tables.length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">待处理提示</span>
          <span className="stat-value">{notifications.filter((item) => item.status === "unread").length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">版本记录</span>
          <span className="stat-value">{versions.length}</span>
        </div>
      </section>

      <section className="panel">
        <div className="row wrap">
          <h2 className="section-title">主流程看板</h2>
          <a className="button secondary" href="/notifications">
            查看我的提示
          </a>
        </div>
        <div className="list">
          <a className="list-item" href="/tables">
            <div className="row wrap">
              <strong>表资产</strong>
              <span className="chip">{tables.reduce((sum, item) => sum + item.testCaseCount, 0)} 条测试用例</span>
            </div>
            <p className="muted">按表汇总查看观测点、测试用例、业务规则、执行记录与版本。</p>
          </a>
          <a className="list-item" href="/manual-runs/new">
            <div className="row wrap">
              <strong>验数执行台</strong>
              <span className="chip">
                {latestRun?.findings.filter((item) => item.resultStatus === "failed").length ?? 0} 个异常点
              </span>
            </div>
            <p className="muted">在取数分析和开发自测场景下，按表筛选规则集合并通过 one service 手动触发。</p>
          </a>
          <a className="list-item" href="/dqc-publish">
            <div className="row wrap">
              <strong>DQC 回填台</strong>
              <span className="chip">{dqcDiffs.filter((item) => item.selected).length} 条待确认差异</span>
            </div>
            <p className="muted">对照 DQC 已运行规则，人工确认后回填最新生效规则。</p>
          </a>
          <a className="list-item" href="/versions">
            <div className="row wrap">
              <strong>版本记录</strong>
              <span className="chip">{versions.length} 次 Git 变更</span>
            </div>
            <p className="muted">查看对象版本、提交说明、影响范围与回滚线索。</p>
          </a>
        </div>
      </section>

      <section className="grid cols-2">
        <div className="panel">
          <div className="row wrap">
            <h2 className="section-title">最近执行批次</h2>
            <a className="button secondary" href="/manual-runs/mr_1/results">
              查看结果
            </a>
          </div>
          {latestRun ? (
            <div className="list-item">
                  <div className="row wrap">
                    <strong>{latestRun.runId}</strong>
                    <span className={`badge status-${latestRun.batch.status}`}>
                      {getManualRunBatchStatusLabel(latestRun.batch.status)}
                    </span>
                  </div>
              <p className="muted">
                one service 请求号：{latestRun.oneServiceRequestId ?? "-"} · 完成时间：
                {formatDateTime(latestRun.batch.finishedAt)}
              </p>
              <p>
                异常 {latestRun.findings.filter((item) => item.resultStatus === "failed").length} 条，涉及业务规则{" "}
                {latestRun.referencedBusinessRuleIds.length} 条。
              </p>
            </div>
          ) : (
            <div className="list-item">暂无手动执行结果。</div>
          )}
        </div>

        <div className="panel">
          <div className="row wrap">
            <h2 className="section-title">高风险表快照</h2>
            <a className="button secondary" href="/tables">
              查看全部表
            </a>
          </div>
          <div className="list">
            {tables.map((table) => (
              <a key={table.id} className="list-item" href={`/tables/${table.id}`}>
                <div className="row wrap">
                  <strong>{table.tableName}</strong>
                  <span className={`badge risk-${table.riskLevel}`}>{getRiskLabel(table.riskLevel)}</span>
                </div>
                <p className="muted">
                  {table.displayName} · 测试用例 {table.testCaseCount} · DQC 映射 {table.dqcDeploymentCount}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
