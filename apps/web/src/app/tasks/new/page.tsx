import { createTaskAction } from "../actions";

const taskDefaults = {
  analysis_validation: {
    title: "4月第一周投放归因验数",
    targetTable: "ads_attribution_daily",
    targetMetricIds: "metric_order_cnt, metric_roi",
    requirementDesc: "查看4月第一周不同平台和玩法下的归因表现。",
    changeDesc: "新增投放玩法维度，调整ROI计算口径。",
    businessDateStart: "2026-04-01",
    businessDateEnd: "2026-04-07",
    extraSql: "select * from ads_attribution_daily where dt between '2026-04-01' and '2026-04-07'"
  },
  delivery_dqc: {
    title: "达人投放周报需求交付验收",
    targetTable: "ads_delivery_daily",
    targetMetricIds: "metric_spend, metric_conversion_rate",
    requirementDesc: "交付达人投放周报，覆盖平台、达人、素材、地域维度。",
    changeDesc: "新增达人层级汇总逻辑，并调整转化率口径。",
    businessDateStart: "2026-04-08",
    businessDateEnd: "2026-04-14",
    extraSql: ""
  }
} as const;

export default async function NewTaskPage({
  searchParams
}: {
  searchParams?: Promise<{ scene?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const sceneKey =
    resolvedSearchParams?.scene === "delivery_dqc" ? "delivery_dqc" : "analysis_validation";
  const defaults = taskDefaults[sceneKey];
  const sceneLabel = sceneKey === "delivery_dqc" ? "需求交付" : "分析验数";

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Task Form</span>
        <h1>新建{sceneLabel}任务</h1>
        <p>提交后会进入任务详情页，数仓开发可继续触发验数 SQL 或 DQC mock 执行。</p>
      </section>

      <form action={createTaskAction} className="panel">
        <input type="hidden" name="scene" value={sceneKey} />

        <div className="grid cols-2">
          <label>
            <p className="muted">需求标题</p>
            <input className="input" name="title" defaultValue={defaults.title} required />
          </label>
          <label>
            <p className="muted">场景类型</p>
            <input className="input" value={sceneLabel} readOnly />
          </label>
          <label>
            <p className="muted">目标表</p>
            <input className="input" name="targetTable" defaultValue={defaults.targetTable} required />
          </label>
          <label>
            <p className="muted">目标指标</p>
            <input
              className="input"
              name="targetMetricIds"
              defaultValue={defaults.targetMetricIds}
              required
            />
          </label>
          <label>
            <p className="muted">开始日期</p>
            <input
              className="input"
              type="date"
              name="businessDateStart"
              defaultValue={defaults.businessDateStart}
              required
            />
          </label>
          <label>
            <p className="muted">结束日期</p>
            <input
              className="input"
              type="date"
              name="businessDateEnd"
              defaultValue={defaults.businessDateEnd}
              required
            />
          </label>
        </div>

        <label>
          <p className="muted">需求说明</p>
          <textarea className="textarea" name="requirementDesc" defaultValue={defaults.requirementDesc} rows={3} />
        </label>

        <label>
          <p className="muted">字段 / 指标变更说明</p>
          <textarea className="textarea" name="changeDesc" defaultValue={defaults.changeDesc} rows={3} />
        </label>

        <label>
          <p className="muted">补充探查 SQL</p>
          <textarea className="textarea" name="extraSql" defaultValue={defaults.extraSql} rows={3} />
        </label>

        <div className="button-row" style={{ marginTop: 18 }}>
          <button className="button" type="submit">
            创建任务
          </button>
          <a className="button secondary" href="/tasks">
            返回任务列表
          </a>
        </div>
      </form>
    </div>
  );
}
