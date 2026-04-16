'use client';

import { Suspense, useState, type ChangeEvent, type FormEvent } from 'react';
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

  const resolvedRole = role === 'dw_developer' || role === 'pm' ? role : undefined;

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const created = await createObservationPoint({
        ...formData,
        tableAssetId: formData.tableAssetId ?? tableId,
        filters: [],
        sceneTags: []
      });
      router.push(withUserRoleQuery(`/observations/${created.id}`, resolvedRole));
      router.refresh();
    } catch (err) {
      setError('Failed to create observation point.');
      console.error(err);
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
        <h2 className="section-title">观测点基础信息</h2>
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
              <span className="field-label">观测点名称</span>
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
            <label className="field" htmlFor="metricCode">
              <span className="field-label">指标编码</span>
              <input
                className="input"
                type="text"
                id="metricCode"
                name="metricCode"
                value={formData.metricCode || ''}
                onChange={handleChange}
                required
              />
            </label>
            <label className="field" htmlFor="metricName">
              <span className="field-label">指标名称</span>
              <input
                className="input"
                type="text"
                id="metricName"
                name="metricName"
                value={formData.metricName || ''}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="grid cols-2">
            <label className="field" htmlFor="timeGrain">
              <span className="field-label">时间粒度</span>
              <input
                className="input"
                type="text"
                id="timeGrain"
                name="timeGrain"
                value={formData.timeGrain || ''}
                onChange={handleChange}
                required
              />
            </label>
            <label className="field" htmlFor="dimensions">
              <span className="field-label">维度组合</span>
              <input
                className="input"
                type="text"
                id="dimensions"
                name="dimensions"
                value={Array.isArray(formData.dimensions) ? formData.dimensions.join(', ') : ''}
                onChange={(event) => handleDimensionsChange(event.target.value)}
              />
              <span className="field-hint">多个维度请用英文逗号分隔，例如 dt, platform, channel。</span>
            </label>
          </div>

          <label className="field" htmlFor="aggregationExpr">
            <span className="field-label">聚合表达式</span>
            <textarea
              className="textarea"
              id="aggregationExpr"
              name="aggregationExpr"
              value={formData.aggregationExpr || ''}
              onChange={handleChange}
              required
            />
          </label>

          <div className="button-row">
            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? '创建中...' : '创建观测点'}
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

export default function NewObservationPointPage() {
  return (
    <Suspense fallback={<div className="status-message">加载中...</div>}>
      <NewObservationPointPageContent />
    </Suspense>
  );
}
