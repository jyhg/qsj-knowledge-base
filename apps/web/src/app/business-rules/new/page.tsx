'use client';

import { Suspense, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BusinessRuleDetail } from '@qsj/shared-types';

import { createBusinessRule } from '../../../lib/api';
import { withUserRoleQuery } from '../../../lib/table-first-presentation';

function NewBusinessRulePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('tableId') ?? '';
  const role = searchParams.get('role') ?? undefined;
  const [formData, setFormData] = useState<Partial<BusinessRuleDetail>>({
    tableAssetId: tableId,
    name: '',
    semanticDesc: '',
    applicableScope: '',
    exceptionScope: '',
    commonCauses: '',
    analysisHint: '',
    status: 'draft'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedRole = role === 'dw_developer' || role === 'pm' ? role : undefined;

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const created = await createBusinessRule({
        ...formData,
        tableAssetId: formData.tableAssetId ?? tableId,
        applicableScope: formData.applicableScope || null,
        exceptionScope: formData.exceptionScope || null,
        commonCauses: formData.commonCauses || null,
        analysisHint: formData.analysisHint || null,
        observationIds: [],
        testCaseIds: []
      });
      router.push(withUserRoleQuery(`/business-rules/${created.id}`, resolvedRole));
      router.refresh();
    } catch (err) {
      setError('Failed to create business rule.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Business Rule</span>
        <h1>新建业务规则</h1>
        <p>先创建基础语义描述，后续再在详情页补充关联观测点和测试用例。</p>
      </section>

      <section className="panel">
        <h2 className="section-title">业务语义描述</h2>
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
              <span className="field-label">业务规则名称</span>
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

          <label className="field" htmlFor="semanticDesc">
            <span className="field-label">规则语义</span>
            <textarea
              className="textarea"
              id="semanticDesc"
              name="semanticDesc"
              value={formData.semanticDesc || ''}
              onChange={handleChange}
              required
            />
          </label>

          <div className="grid cols-2">
            <label className="field" htmlFor="applicableScope">
              <span className="field-label">适用范围</span>
              <textarea
                className="textarea"
                id="applicableScope"
                name="applicableScope"
                value={formData.applicableScope || ''}
                onChange={handleChange}
              />
            </label>
            <label className="field" htmlFor="exceptionScope">
              <span className="field-label">例外范围</span>
              <textarea
                className="textarea"
                id="exceptionScope"
                name="exceptionScope"
                value={formData.exceptionScope || ''}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="grid cols-2">
            <label className="field" htmlFor="commonCauses">
              <span className="field-label">常见原因</span>
              <textarea
                className="textarea"
                id="commonCauses"
                name="commonCauses"
                value={formData.commonCauses || ''}
                onChange={handleChange}
              />
            </label>
            <label className="field" htmlFor="analysisHint">
              <span className="field-label">排查建议</span>
              <textarea
                className="textarea"
                id="analysisHint"
                name="analysisHint"
                value={formData.analysisHint || ''}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="button-row">
            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? '创建中...' : '创建业务规则'}
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

export default function NewBusinessRulePage() {
  return (
    <Suspense fallback={<div className="status-message">加载中...</div>}>
      <NewBusinessRulePageContent />
    </Suspense>
  );
}
