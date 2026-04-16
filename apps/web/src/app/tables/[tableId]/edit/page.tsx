'use client';

import {
  Suspense,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent
} from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { TableAssetDetail } from '@qsj/shared-types';

import { getTableAsset, updateTableAsset } from '../../../../lib/api';
import {
  formatDateTime,
  getAssetStatusLabel,
  getRiskLabel,
  resolveUserRole,
  withUserRoleQuery
} from '../../../../lib/table-first-presentation';

function EditTableAssetPageContent() {
  const router = useRouter();
  const params = useParams<{ tableId: string }>();
  const searchParams = useSearchParams();
  const tableId = params.tableId;
  const role = resolveUserRole(searchParams.get('role'));
  const [table, setTable] = useState<TableAssetDetail | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    domainCode: '',
    description: '',
    ownerUserId: '',
    riskLevel: 'low' as TableAssetDetail['riskLevel'],
    status: 'draft' as TableAssetDetail['status']
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        setIsLoading(true);
        const data = await getTableAsset(tableId);
        setTable(data);
        setFormData({
          displayName: data.displayName,
          domainCode: data.domainCode ?? '',
          description: data.description ?? '',
          ownerUserId: data.ownerUserId ?? '',
          riskLevel: data.riskLevel,
          status: data.status
        });
      } catch (err) {
        setError('Failed to load table asset.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTable();
  }, [tableId]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await updateTableAsset(tableId, {
        displayName: formData.displayName.trim(),
        domainCode: formData.domainCode.trim() || null,
        description: formData.description.trim() || null,
        ownerUserId: formData.ownerUserId.trim() || null,
        riskLevel: formData.riskLevel,
        status: formData.status
      });
      router.push(withUserRoleQuery(`/tables/${updated.id}`, role));
      router.refresh();
    } catch (err) {
      setError('Failed to update table asset.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="grid">Loading...</div>;
  }

  if (!table) {
    return <div className="grid">Table asset not found.</div>;
  }

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Table Asset</span>
        <h1>编辑表资产</h1>
        <p>{table.tableName} 的表级说明、Owner、风险和状态可在此维护，保存后立即返回表详情页。</p>
      </section>

      <section className="panel">
        <div className="list">
          <div className="list-item">
            <strong>表名：</strong> {table.tableName}
          </div>
          <div className="list-item">
            <strong>当前展示名：</strong> {table.displayName}
          </div>
          <div className="list-item">
            <strong>当前风险：</strong> {getRiskLabel(table.riskLevel)}
          </div>
          <div className="list-item">
            <strong>当前状态：</strong> {getAssetStatusLabel(table.status)}
          </div>
          <div className="list-item">
            <strong>最近更新时间：</strong> {formatDateTime(table.updatedAt)}
          </div>
        </div>
      </section>

      <section className="panel">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="tableName">Table Name:</label>
            <input type="text" id="tableName" value={table.tableName} readOnly />
          </div>
          <div className="form-group">
            <label htmlFor="displayName">Display Name:</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="domainCode">Domain Code:</label>
            <input
              type="text"
              id="domainCode"
              name="domainCode"
              value={formData.domainCode}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="ownerUserId">Owner User ID:</label>
            <input
              type="text"
              id="ownerUserId"
              name="ownerUserId"
              value={formData.ownerUserId}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="riskLevel">Risk Level:</label>
            <select id="riskLevel" name="riskLevel" value={formData.riskLevel} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
          <div className="button-row">
            <button type="submit" className="button primary" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存表资产'}
            </button>
            <a className="button secondary" href={withUserRoleQuery(`/tables/${tableId}`, role)}>
              返回表详情
            </a>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>
      </section>
    </div>
  );
}

export default function EditTableAssetPage() {
  return (
    <Suspense fallback={<div className="grid">Loading...</div>}>
      <EditTableAssetPageContent />
    </Suspense>
  );
}
