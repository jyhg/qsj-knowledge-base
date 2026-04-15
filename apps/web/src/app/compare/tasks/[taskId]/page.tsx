import { compareTaskRuns } from "../../../../lib/api";

export default async function CompareTaskPage({
  params
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const compare = await compareTaskRuns(taskId);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Compare</span>
        <h1>任务版本对比</h1>
        <p>优先展示规则内容差异、SQL 差异、执行结果差异。</p>
      </section>

      <section className="panel">
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
      </section>
    </div>
  );
}
