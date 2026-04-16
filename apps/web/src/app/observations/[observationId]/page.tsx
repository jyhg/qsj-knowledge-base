'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ObservationPoint } from '@qsj/shared-types';

import { getObservationPoint, updateObservationPoint } from '../../../lib/api';
import { formatDateTime, withUserRoleQuery } from '../../../lib/table-first-presentation';

export default function ObservationPointDetailPage() {
  const router = useRouter();
  const params = useParams<{ observationId: string }>();
  const searchParams = useSearchParams();
  const observationId = params.observationId;
  const role = searchParams.get('role') ?? undefined;
  const [observationPoint, setObservationPoint] = useState<ObservationPoint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ObservationPoint>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedRole = role === 'dw_developer' || role === 'pm' ? role : undefined;

  useEffect(() => {
    const fetchObservationPoint = async () => {
      try {
        setIsLoading(true);
        const data = await getObservationPoint(observationId);
        setObservationPoint(data);
        setFormData(data);
      } catch (err) {
        setError('Failed to load observation point.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchObservationPoint();
  }, [observationId]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await updateObservationPoint(observationId, formData);
      setObservationPoint(updated);
      setFormData(updated);
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError('Failed to update observation point.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="status-message">加载中...</div>;
  }

  if (error && !observationPoint) {
    return <div className="status-message error">{error}</div>;
  }

  if (!observationPoint) {
    return <div className="status-message">未找到观测点。</div>;
  }

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Observation Point Detail</span>
        <h1>{observationPoint.name}</h1>
        <p>查看观测点的指标定义、维度组合和版本信息，必要时切换到编辑态维护。</p>
        <div className="button-row">
          <button className="button" onClick={() => setIsEditing((prev) => !prev)} type="button">
            {isEditing ? '取消编辑' : '编辑观测点'}
          </button>
          <a
            className="button secondary"
            href={withUserRoleQuery(`/tables/${observationPoint.tableAssetId}`, resolvedRole)}
          >
            返回表详情
          </a>
        </div>
      </section>

      {isEditing ? (
        <section className="panel">
          <h2 className="section-title">编辑观测点</h2>
          <form onSubmit={handleSubmit} className="grid">
            <div className="grid cols-2">
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

            <label className="field" htmlFor="dimensions">
              <span className="field-label">维度组合</span>
              <input
                className="input"
                type="text"
                id="dimensions"
                name="dimensions"
                value={Array.isArray(formData.dimensions) ? formData.dimensions.join(', ') : ''}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    dimensions: event.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)
                  }))
                }
                required
              />
              <span className="field-hint">多个维度请用英文逗号分隔。</span>
            </label>

            <div className="button-row">
              <button type="submit" className="button" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : '保存观测点'}
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
              <strong>ID：</strong> {observationPoint.id}
            </div>
            <div className="list-item">
              <strong>表资产 ID：</strong> {observationPoint.tableAssetId}
            </div>
            <div className="list-item">
              <strong>指标编码：</strong> {observationPoint.metricCode}
            </div>
            <div className="list-item">
              <strong>指标名称：</strong> {observationPoint.metricName}
            </div>
            <div className="list-item">
              <strong>聚合表达式：</strong>
              <pre className="code code-block">{observationPoint.aggregationExpr}</pre>
            </div>
            <div className="list-item">
              <strong>时间粒度：</strong> {observationPoint.timeGrain}
            </div>
            <div className="list-item">
              <strong>维度组合：</strong> {observationPoint.dimensions.join(', ') || '-'}
            </div>
            <div className="list-item">
              <strong>过滤条件：</strong>
              <pre className="code code-block">{JSON.stringify(observationPoint.filters, null, 2)}</pre>
            </div>
            <div className="list-item">
              <strong>场景标签：</strong> {observationPoint.sceneTags.join(', ') || '-'}
            </div>
            <div className="list-item">
              <strong>状态：</strong> {observationPoint.status}
            </div>
            <div className="list-item">
              <strong>Git Path：</strong> {observationPoint.gitPath}
            </div>
            <div className="list-item">
              <strong>Version No：</strong> {observationPoint.versionNo}
            </div>
            <div className="list-item">
              <strong>Created By：</strong> {observationPoint.createdBy}
            </div>
            <div className="list-item">
              <strong>Created At：</strong> {formatDateTime(observationPoint.createdAt)}
            </div>
            <div className="list-item">
              <strong>Updated At：</strong> {formatDateTime(observationPoint.updatedAt)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
