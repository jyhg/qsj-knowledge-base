import { getDqcPublishDiff, listTableAssets } from "../../lib/api";
import { demoDqcPublishTask } from "../../lib/demo-data";
import { getDqcSuggestedActionLabel } from "../../lib/table-first-presentation";

export default async function DqcPublishPage() {
  const [tables, diffs] = await Promise.all([listTableAssets(), getDqcPublishDiff(demoDqcPublishTask.id)]);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">DQC Publish</span>
        <h1>DQC 回填台</h1>
        <p>对照知识库涉及表的最新规则与 DQC 平台已运行规则，人工确认后同步长期监控配置。</p>
      </section>

      <section className="grid cols-3">
        <div className="panel stat">
          <span className="muted">涉及表</span>
          <span className="stat-value">{tables.length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">建议差异</span>
          <span className="stat-value">{diffs.length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">待确认</span>
          <span className="stat-value">{diffs.filter((item) => item.selected).length}</span>
        </div>
      </section>

      <section className="panel">
        <div className="row wrap">
          <h2 className="section-title">{demoDqcPublishTask.title}</h2>
          <a className="button" href={`/dqc-publish/${demoDqcPublishTask.id}/diff`}>
            查看差异
          </a>
        </div>
        <div className="list">
          {diffs.map((diff) => {
            const table = tables.find((item) => item.id === diff.tableAssetId);
            return (
              <div className="list-item" key={diff.id}>
                <div className="row wrap">
                  <strong>{table?.tableName ?? diff.tableAssetId}</strong>
                  <span className="chip">{getDqcSuggestedActionLabel(diff.suggestedAction)}</span>
                </div>
                <p className="muted">{diff.reason}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
