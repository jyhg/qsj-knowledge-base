'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getObservationPoint, updateObservationPoint } from "../../../lib/api";
import { ObservationPoint } from "@qsj/shared-types";
import { formatDateTime } from "../../../lib/table-first-presentation";

export default function ObservationPointDetailPage() {
  const router = useRouter();
  const params = useParams<{ observationId: string }>();
  const observationId = params.observationId;
  const [observationPoint, setObservationPoint] = useState<ObservationPoint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ObservationPoint>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchObservationPoint = async () => {
      try {
        setIsLoading(true);
        const data = await getObservationPoint(observationId);
        setObservationPoint(data);
        setFormData(data); // Initialize form data with fetched data
      } catch (err) {
        setError("Failed to load observation point.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchObservationPoint();
  }, [observationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setIsLoading(true);
      if (observationId) {
        const updated = await updateObservationPoint(observationId, formData);
        setObservationPoint(updated);
        setFormData(updated);
        setIsEditing(false);
        router.refresh(); // Refresh the page to reflect changes
      }
    } catch (err) {
      setError("Failed to update observation point.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="grid">Loading...</div>;
  }

  if (error) {
    return <div className="grid error">Error: {error}</div>;
  }

  if (!observationPoint) {
    return <div className="grid">Observation Point not found.</div>;
  }

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Observation Point Detail</span>
        <h1>{observationPoint.name}</h1>
        <div className="button-row">
            <button className="button" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "取消编辑" : "编辑观测点"}
            </button>
        </div>
      </section>

      {isEditing ? (
        <section className="panel">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="metricCode">Metric Code:</label>
              <input
                type="text"
                id="metricCode"
                name="metricCode"
                value={formData.metricCode || ""}
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
                value={formData.metricName || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="aggregationExpr">Aggregation Expression:</label>
              <textarea
                id="aggregationExpr"
                name="aggregationExpr"
                value={formData.aggregationExpr || ""}
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
                value={formData.timeGrain || ""}
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
                value={Array.isArray(formData.dimensions) ? formData.dimensions.join(', ') : (formData.dimensions || '')}
                onChange={(e) => setFormData((prev) => ({ ...prev, dimensions: e.target.value.split(',').map(d => d.trim()) }))}
                required
              />
            </div>
            {/* Filters and sceneTags are complex objects/arrays, simplifying for now */}
            <button type="submit" className="button primary">保存</button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </section>
      ) : (
        <section className="panel">
          <div className="list">
            <div className="list-item">
              <strong>ID:</strong> {observationPoint.id}
            </div>
            <div className="list-item">
              <strong>Table Asset ID:</strong> {observationPoint.tableAssetId}
            </div>
            <div className="list-item">
              <strong>Metric Code:</strong> {observationPoint.metricCode}
            </div>
            <div className="list-item">
              <strong>Metric Name:</strong> {observationPoint.metricName}
            </div>
            <div className="list-item">
              <strong>Aggregation Expression:</strong> <pre>{observationPoint.aggregationExpr}</pre>
            </div>
            <div className="list-item">
              <strong>Time Grain:</strong> {observationPoint.timeGrain}
            </div>
            <div className="list-item">
              <strong>Dimensions:</strong> {observationPoint.dimensions.join(", ")}
            </div>
            <div className="list-item">
              <strong>Filters:</strong> <pre>{JSON.stringify(observationPoint.filters, null, 2)}</pre>
            </div>
            <div className="list-item">
              <strong>Scene Tags:</strong> {observationPoint.sceneTags.join(", ")}
            </div>
            <div className="list-item">
              <strong>Status:</strong> {observationPoint.status}
            </div>
            <div className="list-item">
              <strong>Git Path:</strong> {observationPoint.gitPath}
            </div>
            <div className="list-item">
              <strong>Version No:</strong> {observationPoint.versionNo}
            </div>
            <div className="list-item">
              <strong>Created By:</strong> {observationPoint.createdBy}
            </div>
            <div className="list-item">
              <strong>Created At:</strong> {formatDateTime(observationPoint.createdAt)}
            </div>
            <div className="list-item">
              <strong>Updated At:</strong> {formatDateTime(observationPoint.updatedAt)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
