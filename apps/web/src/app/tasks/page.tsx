import { listTasks } from "../../lib/api";
import { getSceneLabel, getStatusLabel } from "../../lib/presentation";

export default async function TasksPage() {
  const tasks = await listTasks();

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Task Center</span>
        <h1>任务中心</h1>
        <p>按任务状态、表、指标、执行人和时间范围管理分析验数与需求交付任务。</p>
      </section>

      <section className="panel">
        <div className="row wrap">
          <h2 className="section-title">任务列表</h2>
          <a className="button" href="/tasks/new">
            新建任务
          </a>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>任务标题</th>
              <th>场景</th>
              <th>目标表</th>
              <th>目标指标</th>
              <th>状态</th>
              <th>最近执行</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <a href={`/tasks/${task.id}`}>{task.title}</a>
                </td>
                <td>{getSceneLabel(task.scene)}</td>
                <td>{task.targetTable}</td>
                <td>{task.targetMetrics.map((item) => item.metricName).join(", ")}</td>
                <td>
                  <span className={`badge status-${task.status}`}>{getStatusLabel(task.status)}</span>
                </td>
                <td>{task.lastRunAt ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
