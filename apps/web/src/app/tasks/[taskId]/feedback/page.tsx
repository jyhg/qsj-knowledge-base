import { submitFeedbackAction } from "../../actions";
import { getTask, listRuns } from "../../../../lib/api";

export default async function TaskFeedbackPage({
  params
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const [task, runs] = await Promise.all([getTask(taskId), listRuns(taskId)]);
  const latestRun = runs[0];

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Feedback</span>
        <h1>批量回写</h1>
        <p>
          {task.hasPendingFeedback
            ? "勾选需要沉淀的异常模式、SQL / DQC 规则和口径决策，统一批量确认回写。"
            : "该任务已经完成回写，本页用于回看本次入库内容。"}
        </p>
      </section>

      <section className="panel">
        <h2 className="section-title">待入库项</h2>
        <div className="list">
          <div className="list-item">[x] 异常模式：沉淀本次高风险异常摘要</div>
          <div className="list-item">
            [x] {task.scene === "analysis_validation" ? "SQL 模板" : "DQC 规则"}：保留本次执行方案
          </div>
          <div className="list-item">[x] 口径决策：保留本次确认意见文本</div>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">强制填写项</h2>
        <div className="list">
          <div className="list-item">补充原因：从真实异常任务中沉淀稳定检查规则</div>
          <div className="list-item">适用场景：分析验数 + 后续需求交付</div>
        </div>
        <div className="button-row" style={{ marginTop: 12 }}>
          {latestRun && task.hasPendingFeedback ? (
            <form action={submitFeedbackAction.bind(null, taskId, latestRun.id)}>
              <button className="button" type="submit">
                确认回写
              </button>
            </form>
          ) : null}
          <a className="button" href={`/tasks/${taskId}`}>
            返回任务详情
          </a>
        </div>
      </section>
    </div>
  );
}
