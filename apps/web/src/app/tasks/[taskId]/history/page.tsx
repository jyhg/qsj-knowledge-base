import { compareTaskRuns, listRuns } from "../../../../lib/api";
import { getRunStatusLabel } from "../../../../lib/presentation";

export default async function TaskHistoryPage({
  params
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const runs = await listRuns(taskId);
  const compare = runs.length >= 2 ? await compareTaskRuns(taskId) : null;

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">History</span>
        <h1>任务历史版本</h1>
        <p>查看多次执行记录，以及规则、SQL、结果的变化。</p>
      </section>

      <section className="panel">
        <h2 className="section-title">执行版本</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Run</th>
              <th>状态</th>
              <th>开始时间</th>
              <th>结束时间</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td>{run.id}</td>
                <td>
                  <span className={`badge status-${run.status}`}>{getRunStatusLabel(run.status)}</span>
                </td>
                <td>{run.startedAt}</td>
                <td>{run.finishedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2 className="section-title">版本对比</h2>
        {compare ? (
          <div className="diff-block">
            {compare.diffs.map((diff) => (
              <div className="diff-item" key={diff.section}>
                <div className="row wrap">
                  <strong>{diff.section}</strong>
                  <span className="muted">{diff.summary}</span>
                </div>
                <div className="diff-columns">
                  <div className="list-item">
                    <div className="muted">Base</div>
                    <div className="code">{diff.left}</div>
                  </div>
                  <div className="list-item">
                    <div className="muted">Target</div>
                    <div className="code">{diff.right}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="list-item">至少完成两次执行后，才会展示规则 / SQL / 结果差异。</div>
        )}
      </section>
    </div>
  );
}
