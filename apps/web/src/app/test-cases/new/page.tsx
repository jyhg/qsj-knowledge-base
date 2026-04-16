'use client';

import { FormEvent, Suspense, useState } from 'react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      router.push(withUserRoleQuery(`/test-cases/${created.id}`, role === 'dw_developer' || role === 'pm' ? role : undefined));
      router.refresh();
    } catch (err) {
      setError('Failed to create test case.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Test Case</span>
        <h1>新建测试用例</h1>
        <p>从表详情页补全新建链路，创建后进入测试用例详情页继续编辑。</p>
      </section>

      <section className="panel">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="tableAssetId">Table Asset ID:</label>
            <input
              type="text"
              id="tableAssetId"
              name="tableAssetId"
              value={formData.tableAssetId || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="testCaseType">Type:</label>
            <input
              type="text"
              id="testCaseType"
              name="testCaseType"
              value={formData.testCaseType || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="logicDesc">Logic Description:</label>
            <textarea
              id="logicDesc"
              name="logicDesc"
              value={formData.logicDesc || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="thresholdDesc">Threshold Description:</label>
            <input
              type="text"
              id="thresholdDesc"
              name="thresholdDesc"
              value={formData.thresholdDesc || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sqlTemplate">SQL Template:</label>
            <textarea
              id="sqlTemplate"
              name="sqlTemplate"
              value={formData.sqlTemplate || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="supportsOneService"
              name="supportsOneService"
              checked={formData.supportsOneService || false}
              onChange={handleChange}
            />
            <label htmlFor="supportsOneService">Supports One Service</label>
          </div>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="supportsDqc"
              name="supportsDqc"
              checked={formData.supportsDqc || false}
              onChange={handleChange}
            />
            <label htmlFor="supportsDqc">Supports DQC</label>
          </div>
          <div className="form-group">
            <label htmlFor="oneServiceParser">One Service Parser:</label>
            <input
              type="text"
              id="oneServiceParser"
              name="oneServiceParser"
              value={formData.oneServiceParser || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="dqcTemplateType">DQC Template Type:</label>
            <input
              type="text"
              id="dqcTemplateType"
              name="dqcTemplateType"
              value={formData.dqcTemplateType || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="riskLevel">Risk Level:</label>
            <select id="riskLevel" name="riskLevel" value={formData.riskLevel || 'low'} onChange={handleChange} required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="button-row">
            <button type="submit" className="button primary" disabled={isSubmitting}>
              {isSubmitting ? '创建中...' : '创建测试用例'}
            </button>
            <a className="button secondary" href={withUserRoleQuery(tableId ? `/tables/${tableId}` : '/tables', role === 'dw_developer' || role === 'pm' ? role : undefined)}>
              返回
            </a>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>
      </section>
    </div>
  );
}

export default function NewTestCasePage() {
  return (
    <Suspense fallback={<div className="grid">Loading...</div>}>
      <NewTestCasePageContent />
    </Suspense>
  );
}
