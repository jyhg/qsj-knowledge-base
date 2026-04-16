'use client';

import { Suspense, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TestCaseDetail } from '@qsj/shared-types';

import { createTestCase } from '../../../lib/api';
import { withUserRoleQuery } from '../../../lib/table-first-presentation';

function NewTestCasePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('tableId') ?? '';
  const role = searchParams.get('role') ?? undefined;
  const [formData, setFormData] = useState<Partial<TestCaseDetail>>({
    tableAssetId: tableId,
    name: '',
    testCaseType: 'reconciliation',
    logicDesc: '',
    thresholdDesc: '',
    sqlTemplate: '',
    supportsOneService: true,
    supportsDqc: false,
    oneServiceParser: '',
    dqcTemplateType: '',
    riskLevel: 'low',
    status: 'draft'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedRole = role === 'dw_developer' || role === 'pm' ? role : undefined;

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (event.target as HTMLInputElement).checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const created = await createTestCase({
        ...formData,
        tableAssetId: formData.tableAssetId ?? tableId,
        thresholdDesc: formData.thresholdDesc || null,
        oneServiceParser: formData.oneServiceParser || null,
        dqcTemplateType: formData.dqcTemplateType || null
      });
      router.push(withUserRoleQuery(`/test-cases/${created.id}`, resolvedRole));
      router.refresh();
    } catch (err) {
      setError('Failed to create test case.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Test Case</span>
        <h1>新建测试用例</h1>
        <p>从表详情页补全新建链路，创建后进入测试用例详情页继续编辑执行逻辑、阈值说明和执行通道。</p>
      </section>

      <section className="panel">
        <h2 className="section-title">基础信息</h2>
        <form onSubmit={handleSubmit} className="grid">
          <div className="grid cols-2">
            <label className="field" htmlFor="tableAssetId">
              <span className="field-label">表资产 ID</span>
              <input
                className="input"
                type="text"
                id="tableAssetId"
                name="tableAssetId"
                value={formData.tableAssetId || ''}
                onChange={handleChange}
                required
              />
            </label>
            <label className="field" htmlFor="name">
              <span className="field-label">测试用例名称</span>
              <input
                className="input"
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="grid cols-2">
            <label className="field" htmlFor="testCaseType">
              <span className="field-label">测试类型</span>
              <input
                className="input"
                type="text"
                id="testCaseType"
                name="testCaseType"
                value={formData.testCaseType || ''}
                onChange={handleChange}
                required
              />
              <span className="field-hint">例如 reconciliation、business_constraint、volatility。</span>
            </label>
            <label className="field" htmlFor="riskLevel">
              <span className="field-label">风险等级</span>
              <select
                className="select"
                id="riskLevel"
                name="riskLevel"
                value={formData.riskLevel || 'low'}
                onChange={handleChange}
                required
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </label>
          </div>

          <label className="field" htmlFor="logicDesc">
            <span className="field-label">校验逻辑说明</span>
            <textarea
              className="textarea"
              id="logicDesc"
              name="logicDesc"
              value={formData.logicDesc || ''}
              onChange={handleChange}
              required
            />
          </label>

          <div className="grid cols-2">
            <label className="field" htmlFor="thresholdDesc">
              <span className="field-label">阈值说明</span>
              <input
                className="input"
                type="text"
                id="thresholdDesc"
                name="thresholdDesc"
                value={formData.thresholdDesc || ''}
                onChange={handleChange}
              />
            </label>
            <label className="field" htmlFor="oneServiceParser">
              <span className="field-label">one service 结果解析器</span>
              <input
                className="input"
                type="text"
                id="oneServiceParser"
                name="oneServiceParser"
                value={formData.oneServiceParser || ''}
                onChange={handleChange}
              />
            </label>
          </div>

          <label className="field" htmlFor="sqlTemplate">
            <span className="field-label">SQL 模板</span>
            <textarea
              className="textarea"
              id="sqlTemplate"
              name="sqlTemplate"
              value={formData.sqlTemplate || ''}
              onChange={handleChange}
              required
            />
          </label>

          <div className="grid cols-2">
            <label className="field-toggle" htmlFor="supportsOneService">
              <input
                type="checkbox"
                id="supportsOneService"
                name="supportsOneService"
                checked={formData.supportsOneService || false}
                onChange={handleChange}
              />
              <span>
                <strong>支持 one service</strong>
                <span>用于取数分析和开发自测时的即时手动执行。</span>
              </span>
            </label>
            <label className="field-toggle" htmlFor="supportsDqc">
              <input
                type="checkbox"
                id="supportsDqc"
                name="supportsDqc"
                checked={formData.supportsDqc || false}
                onChange={handleChange}
              />
              <span>
                <strong>支持 DQC</strong>
                <span>可在后续回填流程中转成长期监控规则。</span>
              </span>
            </label>
          </div>

          <label className="field" htmlFor="dqcTemplateType">
            <span className="field-label">DQC 模板类型</span>
            <input
              className="input"
              type="text"
              id="dqcTemplateType"
              name="dqcTemplateType"
              value={formData.dqcTemplateType || ''}
              onChange={handleChange}
            />
          </label>

          <div className="button-row">
            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? '创建中...' : '创建测试用例'}
            </button>
            <a className="button secondary" href={withUserRoleQuery(tableId ? `/tables/${tableId}` : '/tables', resolvedRole)}>
              返回表详情
            </a>
          </div>

          {error ? <p className="inline-error">{error}</p> : null}
        </form>
      </section>
    </div>
  );
}

export default function NewTestCasePage() {
  return (
    <Suspense fallback={<div className="status-message">加载中...</div>}>
      <NewTestCasePageContent />
    </Suspense>
  );
}
