'use client';

import { FormEvent, Suspense, useState } from 'react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      router.push(withUserRoleQuery(`/business-rules/${created.id}`, role === 'dw_developer' || role === 'pm' ? role : undefined));
      router.refresh();
    } catch (err) {
      setError('Failed to create business rule.');
      console.error(err);
    } finally {
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
            <label htmlFor="semanticDesc">Semantic Description:</label>
            <textarea
              id="semanticDesc"
              name="semanticDesc"
              value={formData.semanticDesc || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="applicableScope">Applicable Scope:</label>
            <textarea
              id="applicableScope"
              name="applicableScope"
              value={formData.applicableScope || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="exceptionScope">Exception Scope:</label>
            <textarea
              id="exceptionScope"
              name="exceptionScope"
              value={formData.exceptionScope || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="commonCauses">Common Causes:</label>
            <textarea
              id="commonCauses"
              name="commonCauses"
              value={formData.commonCauses || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="analysisHint">Analysis Hint:</label>
            <textarea
              id="analysisHint"
              name="analysisHint"
              value={formData.analysisHint || ''}
              onChange={handleChange}
            />
          </div>
          <div className="button-row">
            <button type="submit" className="button primary" disabled={isSubmitting}>
              {isSubmitting ? '创建中...' : '创建业务规则'}
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

export default function NewBusinessRulePage() {
  return (
    <Suspense fallback={<div className="grid">Loading...</div>}>
      <NewBusinessRulePageContent />
    </Suspense>
  );
}
