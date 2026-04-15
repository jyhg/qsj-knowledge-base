import { listTableAssets } from "../../../lib/api";

export default async function ManualRunNewPage() {
  const tables = await listTableAssets();

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Manual Runs</span>
        <h1>验数执行台</h1>
        <p>补充 DQC 的定时调度能力，在取数分析和开发自测场景下，通过 one service 手动触发规则集合执行。</p>
      </section>

      <section className="grid cols-2">
        <div className="panel">
          <h2 className="section-title">场景入口</h2>
          <div className="list">
            <div className="list-item">
              <strong>取数分析</strong>
              <p className="muted">围绕问题表快速筛出全部可执行验数规则，先看异常事实再看分析结论。</p>
            </div>
            <div className="list-item">
              <strong>开发自测</strong>
              <p className="muted">在需求上线前，按涉及表批量执行 one service 验数脚本，确认数据错漏和异常点。</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2 className="section-title">候选表</h2>
          <div className="list">
            {tables.map((table) => (
              <a className="list-item" key={table.id} href={`/manual-runs/mr_1/select?tableId=${table.id}`}>
                <div className="row wrap">
                  <strong>{table.tableName}</strong>
                  <span className="chip">{table.testCaseCount} 条测试用例</span>
                </div>
                <p className="muted">{table.displayName}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
