'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BusinessRuleDetail } from '@qsj/shared-types';

import { getBusinessRule, updateBusinessRule } from '../../../lib/api';
import { formatDateTime, withUserRoleQuery } from '../../../lib/table-first-presentation';

export default function BusinessRuleDetailPage() {
  const router = useRouter();
  const params = useParams<{ ruleId: string }>();
  const searchParams = useSearchParams();
  const ruleId = params.ruleId;
  const role = searchParams.get('role') ?? undefined;
  const [businessRule, setBusinessRule] = useState<BusinessRuleDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BusinessRuleDetail>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedRole = role === 'dw_developer' || role === 'pm' ? role : undefined;

  useEffect(() => {
    const fetchBusinessRule = async () => {
      try {
        setIsLoading(true);
        const data = await getBusinessRule(ruleId);
        setBusinessRule(data);
        setFormData(data);
      } catch (err) {
        setError('Failed to load business rule.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessRule();
  }, [ruleId]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await updateBusinessRule(ruleId, formData);
      setBusinessRule(updated);
      setFormData(updated);
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError('Failed to update business rule.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="status-message">加载中...</div>;
  }

  if (error && !businessRule) {
    return <div className="status-message error">{error}</div>;
  }

  if (!businessRule) {
    return <div className="status-message">未找到业务规则。</div>;
  }

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Business Rule Detail</span>
        <h1>{businessRule.name}</h1>
        <p>查看业务规则的语义、适用范围与排查建议，必要时切换到编辑态维护。</p>
        <div className="button-row">
          <button className="button" onClick={() => setIsEditing((prev) => !prev)} type="button">
            {isEditing ? '取消编辑' : '编辑业务规则'}
          </button>
          <a
            className="button secondary"
            href={withUserRoleQuery(`/tables/${businessRule.tableAssetId}`, resolvedRole)}
          >
            返回表详情
          </a>
        </div>
      </section>

      {isEditing ? (
        <section className="panel">
          <h2 className="section-title">编辑业务规则</h2>
          <form onSubmit={handleSubmit} className="grid">
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
                {isSubmitting ? '保存中...' : '保存业务规则'}
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
              <strong>ID：</strong> {businessRule.id}
            </div>
            <div className="list-item">
              <strong>表资产 ID：</strong> {businessRule.tableAssetId}
            </div>
            <div className="list-item">
              <strong>规则语义：</strong> {businessRule.semanticDesc}
            </div>
            <div className="list-item">
              <strong>适用范围：</strong> {businessRule.applicableScope ?? '-'}
            </div>
            <div className="list-item">
              <strong>例外范围：</strong> {businessRule.exceptionScope ?? '-'}
            </div>
            <div className="list-item">
              <strong>观测点 ID：</strong> {businessRule.observationIds.join(', ') || '-'}
            </div>
            <div className="list-item">
              <strong>测试用例 ID：</strong> {businessRule.testCaseIds.join(', ') || '-'}
            </div>
            <div className="list-item">
              <strong>常见原因：</strong> {businessRule.commonCauses ?? '-'}
            </div>
            <div className="list-item">
              <strong>排查建议：</strong> {businessRule.analysisHint ?? '-'}
            </div>
            <div className="list-item">
              <strong>状态：</strong> {businessRule.status}
            </div>
            <div className="list-item">
              <strong>Git Path：</strong> {businessRule.gitPath}
            </div>
            <div className="list-item">
              <strong>Version No：</strong> {businessRule.versionNo}
            </div>
            <div className="list-item">
              <strong>Created By：</strong> {businessRule.createdBy}
            </div>
            <div className="list-item">
              <strong>Created At：</strong> {formatDateTime(businessRule.createdAt)}
            </div>
            <div className="list-item">
              <strong>Updated At：</strong> {formatDateTime(businessRule.updatedAt)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
