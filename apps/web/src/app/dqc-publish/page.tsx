import { createDqcPublishTaskAction } from "./actions";
import { getDqcPublishDiff, listTableAssets } from "../../lib/api";
import { demoDqcPublishTask } from "../../lib/demo-data";
import {
  getDqcSuggestedActionLabel,
  getRiskLabel
} from "../../lib/table-first-presentation";

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

      <form action={createDqcPublishTaskAction} className="panel">
        <div className="row wrap">
          <h2 className="section-title">创建回填任务</h2>
          <button className="button" type="submit">
            创建回填任务并生成差异
          </button>
        </div>
        <label style={{ display: "block", marginTop: 16 }}>
          任务标题
          <input
            className="input"
            defaultValue="4月第二周需求上线 DQC 回填"
            name="title"
            required
            type="text"
          />
        </label>
        <div style={{ marginTop: 16 }}>
          <div className="muted">涉及表</div>
          <div className="list" style={{ marginTop: 8 }}>
            {tables.map((table, index) => (
              <label className="list-item" key={table.id}>
                <input defaultChecked={index === 0} name="tableIds" type="checkbox" value={table.id} />{" "}
                {table.tableName}
                <div className="muted">
                  {table.displayName} · {getRiskLabel(table.riskLevel)} · DQC 映射 {table.dqcDeploymentCount}
                </div>
              </label>
            ))}
          </div>
        </div>
      </form>

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
