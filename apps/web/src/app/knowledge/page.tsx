import { listKnowledgeCards } from "../../lib/api";

export default async function KnowledgePage() {
  const cards = await listKnowledgeCards();

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Knowledge</span>
        <h1>知识库</h1>
        <p>支持空白模板新建，也支持从历史规则或历史任务复制后修改。</p>
      </section>

      <section className="panel">
        <div className="row wrap">
          <h2 className="section-title">知识卡片列表</h2>
          <div className="button-row">
            <a className="button" href="/knowledge/new?source=blank">
              空白模板新建
            </a>
            <a className="button secondary" href="/knowledge/new?source=task&sourceId=task_1">
              从历史任务复制
            </a>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>指标</th>
              <th>表</th>
              <th>业务粒度</th>
              <th>版本</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id}>
                <td>
                  <a href={`/knowledge/${card.id}`}>{card.metricName}</a>
                </td>
                <td>{card.tableName}</td>
                <td>{card.businessGrain}</td>
                <td>v{card.currentVersionNo}</td>
                <td>
                  <span className="chip">{card.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

