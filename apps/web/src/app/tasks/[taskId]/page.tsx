import { confirmScopeAction, executeTaskAction } from "../actions";
import { getTask, getTaskResults, listAudits, listRuns } from "../../../lib/api";
import {
  getCheckTypeLabel,
  getExecutionActionLabel,
  getExecutionPlan,
  getLevelLabel,
  getRiskLabel,
  getSceneLabel,
  getStatusLabel
} from "../../../lib/presentation";

function formatCount(findingsCount: number, risk: "high" | "medium" | "low") {
  if (risk === "high") return findingsCount;
  if (risk === "medium") return Math.max(0, findingsCount - 1);
  return Math.max(0, findingsCount - 2);
}

export default async function TaskDetailPage({
  params
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const [task, runs, audits] = await Promise.all([getTask(taskId), listRuns(taskId), listAudits(taskId)]);
  const latestRun = runs[0];
  const results = await getTaskResults(taskId, latestRun?.id);

  const metricCodes = Array.from(
    new Set((results?.findings ?? []).filter((item) => item.metricCode).map((item) => item.metricCode as string))
  );

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Task Detail</span>
        <h1>{task.title}</h1>
        <p>
          {getSceneLabel(task.scene)} · {task.targetTable} · {task.businessDateStart} ~{" "}
          {task.businessDateEnd}
        </p>
      </section>

      <section className="panel">
        <div className="row wrap">
          <div>
            <div className="chips">
              <span className={`badge status-${task.status}`}>{getStatusLabel(task.status)}</span>
              <span className="chip">最近执行：{task.lastRunAt ?? "-"}</span>
              <span className="chip">待回写：{task.hasPendingFeedback ? "是" : "否"}</span>
            </div>
          </div>
          <div className="button-row">
            <a className="button secondary" href={`/tasks/${taskId}/history`}>
              历史版本
            </a>
            <a className="button secondary" href={`/tasks/${taskId}/audit`}>
              审计记录
            </a>
            {task.hasPendingFeedback ? (
              <a className="button" href={`/tasks/${taskId}/feedback`}>
                去批量回写
              </a>
            ) : (
              <span className="chip">本次回写已完成</span>
            )}
          </div>
        </div>
      </section>

      <section className="grid cols-2">
        <div className="panel">
          <h2 className="section-title">任务说明</h2>
          <div className="list">
            <div className="list-item">需求说明：{task.requirementDesc}</div>
            <div className="list-item">字段 / 指标变更：{task.changeDesc}</div>
            <div className="list-item">
              目标指标：{task.targetMetrics.map((item) => item.metricName).join(" / ")}
            </div>
          </div>
        </div>
        <div className="panel">
          <h2 className="section-title">本次执行方案</h2>
          <div className="list">
            {getExecutionPlan(task).map((item) => (
              <div className="list-item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid cols-2">
        <form
          action={confirmScopeAction.bind(
            null,
            taskId,
            task.targetMetrics.map((item) => item.metricCode)
          )}
          className="panel"
        >
          <h2 className="section-title">口径确认记录</h2>
          <p className="muted">如果本次改动涉及口径冲突，可先记录一次 PM 确认再继续执行。</p>
          <button className="button secondary" type="submit">
            记录 PM 确认
          </button>
        </form>

        <form action={executeTaskAction.bind(null, taskId)} className="panel">
          <h2 className="section-title">执行入口</h2>
          <p className="muted">
            {task.scene === "analysis_validation"
              ? "基于知识库生成验数 SQL，并优先通过 one service 执行只读 SQL；未配置时退回本地 mock。"
              : "基于知识库生成 DQC 规则包，并执行 mock 校验。"}
          </p>
          <button className="button" type="submit">
            {latestRun ? "重新执行全部检查" : getExecutionActionLabel(task.scene)}
          </button>
        </form>
      </section>

      <section className="grid cols-3">
        <div className="panel stat">
          <span className="muted">总异常数</span>
          <span className="stat-value">{results?.findings.length ?? 0}</span>
        </div>
        <div className="panel stat">
          <span className="muted">高风险</span>
          <span className="stat-value">{formatCount(results?.findings.length ?? 0, "high")}</span>
        </div>
        <div className="panel stat">
          <span className="muted">执行版本</span>
          <span className="stat-value">{runs.length}</span>
        </div>
      </section>

      <section className="panel">
        <div className="tabs">
          <span className="tab">运行结果</span>
          <a className="tab" href={`/tasks/${taskId}/history`}>
            历史版本
          </a>
          <a className="tab" href={`/tasks/${taskId}/audit`}>
            审计记录
          </a>
          <a className="tab" href={`/tasks/${taskId}/feedback`}>
            批量回写
          </a>
        </div>

        <h2 className="section-title">异常事实摘要</h2>
        {results ? (
          <table className="table">
            <thead>
              <tr>
                <th>风险</th>
                <th>层级</th>
                <th>检查类型</th>
                <th>异常事实</th>
                <th>影响范围</th>
              </tr>
            </thead>
            <tbody>
              {results.findings
                .slice()
                .sort((a, b) => b.sortScore - a.sortScore)
                .map((finding) => (
                  <tr key={finding.id}>
                    <td>
                      <span className={`badge risk-${finding.riskLevel}`}>
                        {getRiskLabel(finding.riskLevel)}
                      </span>
                    </td>
                    <td>{getLevelLabel(finding.level)}</td>
                    <td>{getCheckTypeLabel(finding.checkType)}</td>
                    <td>{finding.findingSummary}</td>
                    <td>{finding.impactScope}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="list-item">当前还没有执行记录。先点击上方执行入口生成验数结果。</div>
        )}
      </section>

      <section className="panel">
        <h2 className="section-title">指标下钻</h2>
        {metricCodes.length > 0 ? (
          <>
            <div className="chips" style={{ marginBottom: 14 }}>
              {metricCodes.map((metricCode) => (
                <span key={metricCode} className="chip">
                  {metricCode}
                </span>
              ))}
            </div>
            <div className="list">
              {metricCodes.map((metricCode) => {
                const metricFindings = (results?.findings ?? []).filter(
                  (item) => item.metricCode === metricCode
                );
                return (
                  <div className="list-item" key={metricCode}>
                    <div className="row wrap">
                      <strong>{metricCode}</strong>
                      <span className="muted">{metricFindings.length} 条异常/预警</span>
                    </div>
                    <ul>
                      {metricFindings.map((finding) => (
                        <li key={finding.id}>
                          {finding.findingSummary} [{getCheckTypeLabel(finding.checkType)}]
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="list-item">执行后会按指标聚合展示异常，便于逐个下钻。</div>
        )}
      </section>

      <section className="panel">
        <h2 className="section-title">最近审计记录</h2>
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
