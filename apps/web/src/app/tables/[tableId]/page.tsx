import {
  getExecutionPublishSummary,
  getTableAsset,
  listGitVersions,
  listTableBusinessRules,
  listTableObservationPoints,
  listTableTestCases
} from "../../../lib/api";
import {
  formatDateTime,
  getAssetStatusLabel,
  getExecutionChannelLabel,
  getManualRunResultLabel,
  getRiskLabel
} from "../../../lib/table-first-presentation";

export default async function TableDetailPage({
  params
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;
  const [table, testCases, observationPoints, businessRules, executionSummary, versions] =
    await Promise.all([
      getTableAsset(tableId),
      listTableTestCases(tableId),
      listTableObservationPoints(tableId),
      listTableBusinessRules(tableId),
      getExecutionPublishSummary(tableId),
      listGitVersions()
    ]);

  const relatedVersions = versions.filter((item) => item.relatedObjectId === tableId);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Table Detail</span>
        <h1>{table.tableName}</h1>
        <p>{table.displayName}。先看测试用例，再看观测点、业务规则、执行发布和版本记录。</p>
      </section>

      <section className="panel">
        <div className="row wrap">
          <div className="chips">
            <span className={`badge risk-${table.riskLevel}`}>{getRiskLabel(table.riskLevel)}</span>
            <span className="chip">{getAssetStatusLabel(table.status)}</span>
            <span className="chip">当前版本 v{table.currentVersionNo ?? "-"}</span>
            <span className="chip">Git {table.latestVersionSha ?? "-"}</span>
          </div>
          <div className="button-row">
            <a className="button" href="/manual-runs/new">
              发起手动验数
            </a>
            <a className="button secondary" href="/dqc-publish">
              进入 DQC 回填
            </a>
          </div>
        </div>
      </section>

      <section className="grid cols-3">
        <div className="panel stat">
          <span className="muted">观测点</span>
          <span className="stat-value">{observationPoints.length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">测试用例</span>
          <span className="stat-value">{testCases.length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">业务规则</span>
          <span className="stat-value">{businessRules.length}</span>
        </div>
      </section>

      <section className="panel">
        <div className="tabs">
          <span className="tab">测试用例</span>
          <span className="tab">观测点</span>
          <span className="tab">业务规则</span>
          <span className="tab">执行/发布</span>
          <span className="tab">版本记录</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>测试用例</th>
              <th>类型</th>
              <th>通道</th>
              <th>阈值</th>
              <th>最近结果</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((testCase) => (
              <tr key={testCase.id}>
                <td>
                  <strong>{testCase.name}</strong>
                  <div className="muted">{testCase.logicDesc}</div>
                </td>
                <td>{testCase.testCaseType}</td>
                <td>{getExecutionChannelLabel(testCase.channel)}</td>
                <td>{testCase.thresholdDesc ?? "-"}</td>
                <td>
                  {testCase.lastResultStatus ? getManualRunResultLabel(testCase.lastResultStatus) : "-"} ·{" "}
                  {formatDateTime(testCase.lastExecutedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid cols-2">
        <div className="panel">
          <h2 className="section-title">观测点</h2>
          <div className="list">
            {observationPoints.map((item) => (
              <div className="list-item" key={item.id}>
                <div className="row wrap">
                  <strong>{item.name}</strong>
                  <span className="chip">v{item.versionNo}</span>
                </div>
                <p className="muted">
                  {item.metricName} · {item.timeGrain} · {item.dimensions.join(" / ")}
                </p>
                <div className="code">{item.aggregationExpr}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2 className="section-title">业务规则</h2>
          <div className="list">
            {businessRules.map((rule) => (
              <div className="list-item" key={rule.id}>
                <div className="row wrap">
                  <strong>{rule.name}</strong>
                  <span className="chip">v{rule.versionNo}</span>
                </div>
                <p>{rule.semanticDesc}</p>
                <p className="muted">适用范围：{rule.applicableScope ?? "-"}</p>
                <p className="muted">排查建议：{rule.analysisHint ?? "-"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid cols-2">
        <div className="panel">
          <h2 className="section-title">执行 / 发布摘要</h2>
          <div className="list">
            <div className="list-item">one service 可执行用例：{executionSummary.oneServiceExecutableCount}</div>
            <div className="list-item">最近执行批次数：{executionSummary.recentBatchCount}</div>
            <div className="list-item">最近异常数：{executionSummary.recentAbnormalCount}</div>
            <div className="list-item">DQC 已发布：{executionSummary.dqcPublishedCount}</div>
            <div className="list-item">DQC 待确认：{executionSummary.dqcPendingCount}</div>
            <div className="list-item">DQC 未映射：{executionSummary.dqcUnmappedCount}</div>
          </div>
        </div>

        <div className="panel">
          <h2 className="section-title">版本记录</h2>
          <div className="list">
            {relatedVersions.map((version) => (
              <a className="list-item" key={version.id} href={`/versions/${version.id}`}>
                <div className="row wrap">
                  <strong>{version.commitMessage}</strong>
                  <span className="chip">v{version.versionNo}</span>
                </div>
                <p className="muted">
                  {version.commitSha} · {formatDateTime(version.createdAt)}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
