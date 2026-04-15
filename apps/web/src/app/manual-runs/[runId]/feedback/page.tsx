import {
  getManualRunResults,
  listTableBusinessRules,
  listTableObservationPoints,
  listTableTestCases
} from "../../../../lib/api";

export default async function ManualRunFeedbackPage({
  params
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const result = await getManualRunResults(runId);
  const tableId = result?.findings[0]?.tableAssetId;

  const [testCases, observationPoints, businessRules] = await Promise.all([
    tableId ? listTableTestCases(tableId) : Promise.resolve([]),
    tableId ? listTableObservationPoints(tableId) : Promise.resolve([]),
    tableId ? listTableBusinessRules(tableId) : Promise.resolve([])
  ]);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Manual Runs</span>
        <h1>批量回写</h1>
        <p>将本次执行沉淀为观测点、测试用例、业务规则或结论修订，形成可追踪的知识资产。</p>
      </section>

      <section className="grid cols-3">
        <div className="panel">
          <h2 className="section-title">观测点候选</h2>
          <div className="list">
            {observationPoints.map((item) => (
              <div className="list-item" key={item.id}>
                <strong>{item.name}</strong>
                <p className="muted">{item.dimensions.join(" / ")}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2 className="section-title">测试用例候选</h2>
          <div className="list">
            {testCases.map((item) => (
              <div className="list-item" key={item.id}>
                <strong>{item.name}</strong>
                <p className="muted">{item.thresholdDesc ?? "待补阈值说明"}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2 className="section-title">业务规则候选</h2>
          <div className="list">
            {businessRules.map((item) => (
              <div className="list-item" key={item.id}>
                <strong>{item.name}</strong>
                <p className="muted">{item.semanticDesc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">本次回写建议</h2>
        <div className="list">
          <div className="list-item">更新异常维度组合下的观测点 evidence 与分析结论。</div>
          <div className="list-item">确认当前测试用例是否仍满足 one service 手动执行场景。</div>
          <div className="list-item">如果业务规则影响多个表 + 维度组合，需要补充跨表映射关系。</div>
          <div className="list-item">
            当前执行结果 {result ? `共 ${result.findings.length} 条` : "尚未产出"}，待人工确认后再提交回写。
          </div>
        </div>
      </section>
    </div>
  );
}
