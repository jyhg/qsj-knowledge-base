import { getKnowledgeCard } from "../../../lib/api";

export default async function KnowledgeCardPage({
  params
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const card = await getKnowledgeCard(cardId);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Knowledge Card</span>
        <h1>{card.metricName}</h1>
        <p>
          {card.tableName} · {card.businessGrain} · v{card.currentVersionNo}
        </p>
      </section>

      <section className="grid cols-2">
        <div className="panel">
          <h2 className="section-title">基础信息</h2>
          <p>{card.businessDefinition}</p>
          <div className="chips">
            {card.dimensions.map((dimension) => (
              <span className="chip" key={dimension}>
                {dimension}
              </span>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2 className="section-title">沉淀信息</h2>
          <div className="list">
            <div className="list-item">创建方式：{card.createMode}</div>
            <div className="list-item">补充原因：{card.reason ?? "-"}</div>
            <div className="list-item">适用场景：{card.applicableScene ?? "-"}</div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">规则</h2>
        <div className="list">
          {card.rules.map((rule) => (
            <div className="list-item" key={rule.id}>
              <div className="row wrap">
                <strong>{rule.name}</strong>
                <span className={`badge risk-${rule.riskLevel}`}>{rule.riskLevel}</span>
              </div>
              <p className="muted">{rule.logicDesc}</p>
              <div className="code">{rule.sqlTemplate ?? "No SQL template"}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
