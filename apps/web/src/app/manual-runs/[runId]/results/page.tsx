import {
  getManualRunResults,
  listTableAssets,
  listTableBusinessRules,
  listTableTestCases
} from "../../../../lib/api";
import {
  getManualRunResultLabel,
  getRiskLabel
} from "../../../../lib/table-first-presentation";

export default async function ManualRunResultsPage({
  params
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const result = await getManualRunResults(runId);

  if (!result) {
    return (
      <div className="grid">
        <section className="hero">
          <span className="eyebrow">Manual Runs</span>
          <h1>执行结果</h1>
          <p>当前批次还没有结果。</p>
        </section>
      </div>
    );
  }

  const tableId = result.findings[0]?.tableAssetId;
  const [tables, testCases, businessRules] = await Promise.all([
    listTableAssets(),
    tableId ? listTableTestCases(tableId) : Promise.resolve([]),
    tableId ? listTableBusinessRules(tableId) : Promise.resolve([])
  ]);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Manual Runs</span>
        <h1>执行结果</h1>
        <p>输出异常事实、涉及规则和分析结论，帮助判断是否存在数据错漏以及异常点。</p>
      </section>

      <section className="grid cols-3">
        <div className="panel stat">
          <span className="muted">总结果数</span>
          <span className="stat-value">{result.findings.length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">异常数</span>
          <span className="stat-value">
            {result.findings.filter((item) => item.resultStatus === "failed").length}
          </span>
        </div>
        <div className="panel stat">
          <span className="muted">引用业务规则</span>
          <span className="stat-value">{result.referencedBusinessRuleIds.length}</span>
        </div>
      </section>

      <section className="panel">
        <div className="row wrap">
          <h2 className="section-title">结果明细</h2>
          <a className="button" href={`/manual-runs/${runId}/feedback`}>
            去确认回写
          </a>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>表</th>
              <th>测试用例</th>
              <th>状态</th>
              <th>异常事实</th>
              <th>分析结论</th>
            </tr>
          </thead>
          <tbody>
            {result.findings
              .slice()
              .sort((a, b) => b.sortScore - a.sortScore)
              .map((finding) => {
                const table = tables.find((item) => item.id === finding.tableAssetId);
                const testCase = testCases.find((item) => item.id === finding.testCaseId);
                const businessRule = businessRules.find((item) => item.id === finding.businessRuleId);

                return (
                  <tr key={finding.id}>
                    <td>{table?.tableName ?? finding.tableAssetId}</td>
                    <td>
                      <strong>{testCase?.name ?? finding.testCaseId}</strong>
                      <div className="muted">
                        {testCase?.riskLevel ? getRiskLabel(testCase.riskLevel) : null}
                      </div>
                    </td>
                    <td>{getManualRunResultLabel(finding.resultStatus)}</td>
                    <td>{finding.findingSummary}</td>
                    <td>{businessRule?.analysisHint ?? businessRule?.semanticDesc ?? "需人工补充结论"}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
