'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ObservationPoint } from '@qsj/shared-types';

import { createObservationPoint } from '../../../lib/api';
import { withUserRoleQuery } from '../../../lib/table-first-presentation';

function NewObservationPointPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('tableId') ?? '';
  const role = searchParams.get('role') ?? undefined;
  const [formData, setFormData] = useState<Partial<ObservationPoint>>({
    tableAssetId: tableId,
    name: '',
    metricCode: '',
    metricName: '',
    aggregationExpr: '',
    timeGrain: 'day',
    dimensions: [],
    status: 'draft'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDimensionsChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const created = await createObservationPoint({
        ...formData,
        tableAssetId: formData.tableAssetId ?? tableId,
        filters: [],
        sceneTags: []
      });
      router.push(withUserRoleQuery(`/observations/${created.id}`, role === 'dw_developer' || role === 'pm' ? role : undefined));
      router.refresh();
    } catch (err) {
      setError('Failed to create observation point.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Observation Point</span>
        <h1>新建观测点</h1>
        <p>创建后进入观测点详情页继续补充维度、过滤条件和场景标签。</p>
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
            <label htmlFor="metricCode">Metric Code:</label>
            <input
              type="text"
              id="metricCode"
              name="metricCode"
              value={formData.metricCode || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="metricName">Metric Name:</label>
            <input
              type="text"
              id="metricName"
              name="metricName"
              value={formData.metricName || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="aggregationExpr">Aggregation Expression:</label>
            <textarea
              id="aggregationExpr"
              name="aggregationExpr"
              value={formData.aggregationExpr || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="timeGrain">Time Grain:</label>
            <input
              type="text"
              id="timeGrain"
              name="timeGrain"
              value={formData.timeGrain || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dimensions">Dimensions (comma-separated):</label>
            <input
              type="text"
              id="dimensions"
              name="dimensions"
              value={Array.isArray(formData.dimensions) ? formData.dimensions.join(', ') : ''}
              onChange={(e) => handleDimensionsChange(e.target.value)}
            />
          </div>
          <div className="button-row">
            <button type="submit" className="button primary" disabled={isSubmitting}>
              {isSubmitting ? '创建中...' : '创建观测点'}
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

export default function NewObservationPointPage() {
  return (
    <Suspense fallback={<div className="grid">Loading...</div>}>
      <NewObservationPointPageContent />
    </Suspense>
  );
}
