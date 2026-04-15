import { listTableAssets } from "../../lib/api";
import {
  formatDateTime,
  getAssetStatusLabel,
  getRiskLabel
} from "../../lib/table-first-presentation";

export default async function TablesPage() {
  const tables = await listTableAssets();

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Tables</span>
        <h1>表资产</h1>
        <p>以表为第一入口浏览观测点、测试用例、业务规则、执行发布状态和版本信息。</p>
      </section>

      <section className="grid cols-3">
        <div className="panel stat">
          <span className="muted">表数量</span>
          <span className="stat-value">{tables.length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">测试用例</span>
          <span className="stat-value">{tables.reduce((sum, item) => sum + item.testCaseCount, 0)}</span>
        </div>
        <div className="panel stat">
          <span className="muted">DQC 映射</span>
          <span className="stat-value">{tables.reduce((sum, item) => sum + item.dqcDeploymentCount, 0)}</span>
        </div>
      </section>

      <section className="panel">
        <div className="row wrap">
          <h2 className="section-title">表列表</h2>
          <a className="button secondary" href="/manual-runs/new">
            发起验数执行
          </a>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>表名</th>
              <th>说明</th>
              <th>风险</th>
              <th>资产概况</th>
              <th>最近异常</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table.id}>
                <td>
                  <a href={`/tables/${table.id}`}>
                    <strong>{table.tableName}</strong>
                  </a>
                  <div className="muted">{table.displayName}</div>
                </td>
                <td>{table.description}</td>
                <td>
                  <span className={`badge risk-${table.riskLevel}`}>{getRiskLabel(table.riskLevel)}</span>
                </td>
                <td>
                  观测点 {table.observationPointCount} / 测试用例 {table.testCaseCount} / 业务规则{" "}
                  {table.businessRuleCount}
                </td>
                <td>{formatDateTime(table.lastAbnormalAt)}</td>
                <td>{getAssetStatusLabel(table.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
