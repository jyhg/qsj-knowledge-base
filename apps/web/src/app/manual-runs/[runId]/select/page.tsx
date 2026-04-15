import { executeManualRunAction } from "../../actions";
import { listManualRunCandidates, listTableAssets } from "../../../../lib/api";
import {
  getExecutionChannelLabel,
  getRiskLabel
} from "../../../../lib/table-first-presentation";

export default async function ManualRunSelectPage({
  params,
  searchParams
}: {
  params: Promise<{ runId: string }>;
  searchParams: Promise<{ tableId?: string }>;
}) {
  const { runId } = await params;
  const { tableId } = await searchParams;
  const [candidates, tables] = await Promise.all([listManualRunCandidates(runId), listTableAssets()]);
  const filteredCandidates = tableId
    ? candidates.filter((candidate) => candidate.tableId === tableId)
    : candidates;
  const selectedTable = tableId ? tables.find((item) => item.id === tableId) : null;

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Manual Runs</span>
        <h1>规则集合选择</h1>
        <p>按涉及表收敛出全部候选测试用例，人工确认后触发 one service 查询执行。</p>
      </section>

      <form action={executeManualRunAction.bind(null, runId)} className="panel">
        <div className="row wrap">
          <div>
            <h2 className="section-title">候选规则</h2>
            <p className="muted">
              {selectedTable
                ? `当前已按表 ${selectedTable.tableName} 过滤。`
                : "当前展示本次任务涉及表的全部 one service 候选规则。"}
            </p>
          </div>
          <div className="button-row">
            <button className="button" type="submit">
              执行选中规则
            </button>
            <a className="button secondary" href={`/manual-runs/${runId}/results`}>
              查看已有结果
            </a>
          </div>
        </div>
        {filteredCandidates.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>选择</th>
                <th>表</th>
                <th>测试用例</th>
                <th>通道</th>
                <th>风险</th>
                <th>推荐原因</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => {
                const table = tables.find((item) => item.id === candidate.tableId);
                return (
                  <tr key={candidate.testCaseId}>
                    <td>
                      <input
                        defaultChecked
                        name="selectedTestCaseIds"
                        type="checkbox"
                        value={candidate.testCaseId}
                      />
                    </td>
                    <td>{table?.tableName ?? candidate.tableId}</td>
                    <td>{candidate.testCaseName}</td>
                    <td>{getExecutionChannelLabel(candidate.channel)}</td>
                    <td>
                      <span className={`badge risk-${candidate.riskLevel}`}>
                        {getRiskLabel(candidate.riskLevel)}
                      </span>
                    </td>
                    <td>{candidate.recommendationReason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="list-item">暂无候选规则，请切换其他表或先补充测试用例资产。</div>
        )}
      </form>
    </div>
  );
}
