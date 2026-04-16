'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { TestCaseDetail } from '@qsj/shared-types';

import { getTestCase, updateTestCase } from '../../../lib/api';
import { formatDateTime, withUserRoleQuery } from '../../../lib/table-first-presentation';

export default function TestCaseDetailPage() {
  const router = useRouter();
  const params = useParams<{ testCaseId: string }>();
  const searchParams = useSearchParams();
  const testCaseId = params.testCaseId;
  const role = searchParams.get('role') ?? undefined;
  const [testCase, setTestCase] = useState<TestCaseDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<TestCaseDetail>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedRole = role === 'dw_developer' || role === 'pm' ? role : undefined;

  useEffect(() => {
    const fetchTestCase = async () => {
      try {
        setIsLoading(true);
        const data = await getTestCase(testCaseId);
        setTestCase(data);
        setFormData(data);
      } catch (err) {
        setError('Failed to load test case.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestCase();
  }, [testCaseId]);

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
      const updated = await updateTestCase(testCaseId, formData);
      setTestCase(updated);
      setFormData(updated);
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError('Failed to update test case.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="status-message">加载中...</div>;
  }

  if (error && !testCase) {
    return <div className="status-message error">{error}</div>;
  }

  if (!testCase) {
    return <div className="status-message">未找到测试用例。</div>;
  }

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Test Case Detail</span>
        <h1>{testCase.name}</h1>
        <p>查看测试用例的执行逻辑、阈值、执行通道和版本信息，必要时切换到编辑态维护。</p>
        <div className="button-row">
          <button className="button" onClick={() => setIsEditing((prev) => !prev)} type="button">
            {isEditing ? '取消编辑' : '编辑测试用例'}
          </button>
          <a
            className="button secondary"
            href={withUserRoleQuery(`/tables/${testCase.tableAssetId}`, resolvedRole)}
          >
            返回表详情
          </a>
        </div>
      </section>

      {isEditing ? (
        <section className="panel">
          <h2 className="section-title">编辑测试用例</h2>
          <form onSubmit={handleSubmit} className="grid">
            <div className="grid cols-2">
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
                  <span>允许在取数分析和开发自测时手动执行。</span>
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
                  <span>允许在后续回填流程中映射为长期监控规则。</span>
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
                {isSubmitting ? '保存中...' : '保存测试用例'}
              </button>
              <button className="button secondary" onClick={() => setIsEditing(false)} type="button">
                取消
              </button>
            </div>

            {error ? <p className="inline-error">{error}</p> : null}
          </form>
        </section>
      ) : (
        <section className="panel">
          <div className="list">
            <div className="list-item">
              <strong>ID：</strong> {testCase.id}
            </div>
            <div className="list-item">
              <strong>表资产 ID：</strong> {testCase.tableAssetId}
            </div>
            <div className="list-item">
              <strong>类型：</strong> {testCase.testCaseType}
            </div>
            <div className="list-item">
              <strong>校验逻辑说明：</strong> {testCase.logicDesc}
            </div>
            <div className="list-item">
              <strong>阈值说明：</strong> {testCase.thresholdDesc ?? '-'}
            </div>
            <div className="list-item">
              <strong>SQL 模板：</strong>
              <pre className="code code-block">{testCase.sqlTemplate}</pre>
            </div>
            <div className="list-item">
              <strong>支持 one service：</strong> {testCase.supportsOneService ? 'Yes' : 'No'}
            </div>
            <div className="list-item">
              <strong>支持 DQC：</strong> {testCase.supportsDqc ? 'Yes' : 'No'}
            </div>
            <div className="list-item">
              <strong>one service 结果解析器：</strong> {testCase.oneServiceParser ?? '-'}
            </div>
            <div className="list-item">
              <strong>DQC 模板类型：</strong> {testCase.dqcTemplateType ?? '-'}
            </div>
            <div className="list-item">
              <strong>风险等级：</strong> {testCase.riskLevel}
            </div>
            <div className="list-item">
              <strong>状态：</strong> {testCase.status}
            </div>
            <div className="list-item">
              <strong>Git Path：</strong> {testCase.gitPath}
            </div>
            <div className="list-item">
              <strong>Version No：</strong> {testCase.versionNo}
            </div>
            <div className="list-item">
              <strong>Created By：</strong> {testCase.createdBy}
            </div>
            <div className="list-item">
              <strong>Created At：</strong> {formatDateTime(testCase.createdAt)}
            </div>
            <div className="list-item">
              <strong>Updated At：</strong> {formatDateTime(testCase.updatedAt)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
