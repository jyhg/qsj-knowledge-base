import { getDqcPublishDiff, listTableAssets, listTableTestCases } from "../../../../lib/api";
import {
  getDqcSuggestedActionLabel,
  getExecutionChannelLabel
} from "../../../../lib/table-first-presentation";

export default async function DqcPublishDiffPage({
  params
}: {
  params: Promise<{ publishId: string }>;
}) {
  const { publishId } = await params;
  const [diffs, tables] = await Promise.all([getDqcPublishDiff(publishId), listTableAssets()]);

  const testCasesByTable = await Promise.all(
    Array.from(new Set(diffs.map((item) => item.tableAssetId))).map(async (tableId) => [
      tableId,
      await listTableTestCases(tableId)
    ] as const)
  );
  const testCaseMap = new Map(testCasesByTable);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">DQC Publish</span>
        <h1>DQC 差异比对</h1>
        <p>逐条核对建议动作、当前 DQC 状态与知识库规则，确认后再同步到 DQC 平台。</p>
      </section>

      <section className="panel">
        <div className="row wrap">
          <h2 className="section-title">差异明细</h2>
          <div className="button-row">
            <a className="button secondary" href="/dqc-publish">
              返回任务列表
            </a>
            <a className="button" href="/versions">
              查看关联版本
            </a>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>表</th>
              <th>测试用例</th>
              <th>执行通道</th>
              <th>DQC 当前状态</th>
              <th>建议动作</th>
              <th>原因</th>
            </tr>
          </thead>
          <tbody>
            {diffs.map((diff) => {
              const table = tables.find((item) => item.id === diff.tableAssetId);
              const testCase = testCaseMap.get(diff.tableAssetId)?.find((item) => item.id === diff.testCaseId);
              return (
                <tr key={diff.id}>
                  <td>{table?.tableName ?? diff.tableAssetId}</td>
                  <td>{testCase?.name ?? diff.testCaseId}</td>
                  <td>{testCase ? getExecutionChannelLabel(testCase.channel) : "-"}</td>
                  <td>{diff.currentDqcStatus}</td>
                  <td>{getDqcSuggestedActionLabel(diff.suggestedAction)}</td>
                  <td>{diff.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
