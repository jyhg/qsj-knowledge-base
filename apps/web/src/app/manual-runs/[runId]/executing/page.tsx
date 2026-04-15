import { getManualRunStatus } from "../../../../lib/api";
import {
  formatDateTime,
  getManualRunBatchStatusLabel
} from "../../../../lib/table-first-presentation";

export default async function ManualRunExecutingPage({
  params
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const status = await getManualRunStatus(runId);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Manual Runs</span>
        <h1>one service 执行中</h1>
        <p>该页面承接手动触发后的执行进度、请求号和运行阶段，和 DQC 的定时调度通道明确分开。</p>
      </section>

      <section className="grid cols-3">
        <div className="panel stat">
          <span className="muted">批次号</span>
          <span className="stat-value">{status.id}</span>
        </div>
        <div className="panel stat">
          <span className="muted">状态</span>
          <span className="stat-value">{getManualRunBatchStatusLabel(status.status)}</span>
        </div>
        <div className="panel stat">
          <span className="muted">请求号</span>
          <span className="stat-value">{status.oneServiceRequestId ?? "-"}</span>
        </div>
      </section>

      <section className="panel">
        <div className="list">
          <div className="list-item">触发人：{status.triggeredBy}</div>
          <div className="list-item">开始时间：{formatDateTime(status.startedAt)}</div>
          <div className="list-item">结束时间：{formatDateTime(status.finishedAt)}</div>
        </div>
        <div className="button-row" style={{ marginTop: 16 }}>
          <a className="button" href={`/manual-runs/${runId}/results`}>
            查看执行结果
          </a>
          <a className="button secondary" href={`/manual-runs/${runId}/feedback`}>
            查看待回写项
          </a>
        </div>
      </section>
    </div>
  );
}
