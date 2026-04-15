import { listManualRunCandidates, listTableAssets } from "../../../../lib/api";
import {
  getExecutionChannelLabel,
  getRiskLabel
} from "../../../../lib/table-first-presentation";

export default async function ManualRunSelectPage({
  params
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const [candidates, tables] = await Promise.all([listManualRunCandidates(runId), listTableAssets()]);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Manual Runs</span>
        <h1>规则集合选择</h1>
        <p>按涉及表收敛出全部候选测试用例，人工确认后触发 one service 查询执行。</p>
      </section>

      <section className="panel">
        <div className="row wrap">
          <h2 className="section-title">候选规则</h2>
          <div className="button-row">
            <a className="button secondary" href={`/manual-runs/${runId}/executing`}>
              进入执行中页面
            </a>
            <a className="button" href={`/manual-runs/${runId}/results`}>
              直接查看示例结果
            </a>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>表</th>
              <th>测试用例</th>
              <th>通道</th>
              <th>风险</th>
              <th>推荐原因</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => {
              const table = tables.find((item) => item.id === candidate.tableId);
              return (
                <tr key={candidate.testCaseId}>
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
      </section>
    </div>
  );
}
