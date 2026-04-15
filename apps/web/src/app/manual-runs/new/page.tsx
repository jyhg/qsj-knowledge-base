import { createManualRunAction } from "../actions";
import { listTableAssets } from "../../../lib/api";
import { getRiskLabel } from "../../../lib/table-first-presentation";

export default async function ManualRunNewPage() {
  const tables = await listTableAssets();

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Manual Runs</span>
        <h1>验数执行台</h1>
        <p>补充 DQC 的定时调度能力，在取数分析和开发自测场景下，通过 one service 手动触发规则集合执行。</p>
      </section>

      <section className="grid cols-2">
        <div className="panel">
          <h2 className="section-title">场景入口</h2>
          <div className="list">
            <div className="list-item">
              <strong>取数分析</strong>
              <p className="muted">围绕问题表快速筛出全部可执行验数规则，先看异常事实再看分析结论。</p>
            </div>
            <div className="list-item">
              <strong>开发自测</strong>
              <p className="muted">在需求上线前，按涉及表批量执行 one service 验数脚本，确认数据错漏和异常点。</p>
            </div>
          </div>
        </div>

        <form action={createManualRunAction} className="panel">
          <h2 className="section-title">创建执行任务</h2>
          <label>
            任务标题
            <input
              className="input"
              defaultValue="4月第二周归因逻辑调整验数"
              name="title"
              required
              type="text"
            />
          </label>

          <div style={{ marginTop: 16 }}>
            <div className="muted">执行场景</div>
            <div className="list" style={{ marginTop: 8 }}>
              <label className="list-item">
                <input defaultChecked name="scene" type="radio" value="analysis_validation" /> 取数分析
              </label>
              <label className="list-item">
                <input name="scene" type="radio" value="development_self_test" /> 开发自测
              </label>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="muted">涉及表</div>
            <div className="list" style={{ marginTop: 8 }}>
              {tables.map((table, index) => (
                <label className="list-item" key={table.id}>
                  <input defaultChecked={index === 0} name="tableIds" type="checkbox" value={table.id} />{" "}
                  {table.tableName}
                  <div className="muted">
                    {table.displayName} · {getRiskLabel(table.riskLevel)} · {table.testCaseCount} 条测试用例
                  </div>
                </label>
              ))}
            </div>
          </div>

          <label style={{ display: "block", marginTop: 16 }}>
            指标编码
            <textarea
              className="textarea"
              defaultValue={"conversion_rate\norder_cnt"}
              name="metricCodes"
            />
          </label>

          <label style={{ display: "block", marginTop: 16 }}>
            需求说明
            <textarea
              className="textarea"
              defaultValue="新增玩法维度并调整转化率口径，需要验证不同平台和经营类型下的数据表现。"
              name="requirementDesc"
            />
          </label>

          <label style={{ display: "block", marginTop: 16 }}>
            变更说明
            <textarea
              className="textarea"
              defaultValue="调整 SQL 归因逻辑，补充玩法维度映射。"
              name="changeDesc"
            />
          </label>

          <div className="grid cols-2" style={{ marginTop: 16 }}>
            <label>
              开始日期
              <input className="input" defaultValue="2026-04-08" name="businessDateStart" type="date" />
            </label>
            <label>
              结束日期
              <input className="input" defaultValue="2026-04-14" name="businessDateEnd" type="date" />
            </label>
          </div>

          <div className="button-row" style={{ marginTop: 16 }}>
            <button className="button" type="submit">
              创建任务并选择规则
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
