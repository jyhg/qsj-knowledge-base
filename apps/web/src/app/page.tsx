import { getCurrentUser, listNotifications, listTasks } from "../lib/api";
import { getSceneLabel, getStatusLabel } from "../lib/presentation";

export default async function HomePage() {
  const [user, tasks, notifications] = await Promise.all([
    getCurrentUser(),
    listTasks(),
    listNotifications()
  ]);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">MVP Console</span>
        <h1>数据质量知识库与 AI 验数助手</h1>
        <p>
          当前可以直接进入前后端开发。该骨架以任务单为中心，围绕知识库、执行审计、异常摘要、批量回写与版本对比组织核心流程。
        </p>
      </section>

      <section className="grid cols-2">
        <div className="panel">
          <h2 className="section-title">两条主流程</h2>
          <div className="button-row">
            <a className="button" href="/tasks/new">
              新建分析验数任务
            </a>
            <a className="button secondary" href="/tasks/new?scene=delivery_dqc">
              新建需求交付任务
            </a>
          </div>
        </div>
        <div className="panel">
          <h2 className="section-title">当前角色</h2>
        <div className="stat">
          <span className="stat-value">{user.name}</span>
          <span className="muted">角色：数仓开发</span>
        </div>
        </div>
      </section>

      <section className="grid cols-3">
        <div className="panel stat">
          <span className="muted">任务数</span>
          <span className="stat-value">{tasks.length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">待处理提示</span>
          <span className="stat-value">{notifications.filter((item) => item.status === "unread").length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">待回写任务</span>
          <span className="stat-value">{tasks.filter((item) => item.hasPendingFeedback).length}</span>
        </div>
      </section>

      <section className="panel">
        <div className="row wrap">
          <h2 className="section-title">最近任务</h2>
          <a className="button secondary" href="/tasks">
            查看全部
          </a>
        </div>
        <div className="list">
          {tasks.map((task) => (
            <a key={task.id} className="list-item" href={`/tasks/${task.id}`}>
              <div className="row wrap">
                <strong>{task.title}</strong>
                <span className={`badge status-${task.status}`}>{getStatusLabel(task.status)}</span>
              </div>
              <p className="muted">
                {getSceneLabel(task.scene)} · {task.targetTable} ·{" "}
                {task.targetMetrics.map((item) => item.metricName).join(" / ")}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
