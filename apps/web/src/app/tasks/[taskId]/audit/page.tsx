import { listAudits } from "../../../../lib/api";

export default async function TaskAuditPage({
  params
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const audits = await listAudits(taskId);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Audit</span>
        <h1>执行审计</h1>
        <p>保留提交人、执行时间、SQL 摘要、执行模式、执行状态和结果行数。</p>
      </section>

      <section className="panel">
        <div className="list">
          {audits.map((audit) => (
            <div className="list-item" key={audit.id}>
              <div className="row wrap">
                <strong>{audit.action}</strong>
                <span className="muted">{audit.createdAt}</span>
              </div>
              <div className="code">{JSON.stringify(audit.detail, null, 2)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
