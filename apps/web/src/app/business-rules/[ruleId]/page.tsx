'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBusinessRule, updateBusinessRule } from "../../../lib/api";
import { BusinessRuleDetail } from "@qsj/shared-types";
import { formatDateTime } from "../../../lib/table-first-presentation";

export default function BusinessRuleDetailPage() {
  const router = useRouter();
  const params = useParams<{ ruleId: string }>();
  const ruleId = params.ruleId;
  const [businessRule, setBusinessRule] = useState<BusinessRuleDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BusinessRuleDetail>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessRule = async () => {
      try {
        setIsLoading(true);
        const data = await getBusinessRule(ruleId);
        setBusinessRule(data);
        setFormData(data); // Initialize form data with fetched data
      } catch (err) {
        setError("Failed to load business rule.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusinessRule();
  }, [ruleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setIsLoading(true);
      if (ruleId) {
        const updated = await updateBusinessRule(ruleId, formData);
        setBusinessRule(updated);
        setFormData(updated);
        setIsEditing(false);
        router.refresh(); // Refresh the page to reflect changes
      }
    } catch (err) {
      setError("Failed to update business rule.");
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

  if (!businessRule) {
    return <div className="grid">Business Rule not found.</div>;
  }

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Business Rule Detail</span>
        <h1>{businessRule.name}</h1>
        <div className="button-row">
            <button className="button" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "取消编辑" : "编辑业务规则"}
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
              <label htmlFor="semanticDesc">Semantic Description:</label>
              <textarea
                id="semanticDesc"
                name="semanticDesc"
                value={formData.semanticDesc || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="applicableScope">Applicable Scope:</label>
              <textarea
                id="applicableScope"
                name="applicableScope"
                value={formData.applicableScope || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="exceptionScope">Exception Scope:</label>
              <textarea
                id="exceptionScope"
                name="exceptionScope"
                value={formData.exceptionScope || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="commonCauses">Common Causes:</label>
              <textarea
                id="commonCauses"
                name="commonCauses"
                value={formData.commonCauses || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="analysisHint">Analysis Hint:</label>
              <textarea
                id="analysisHint"
                name="analysisHint"
                value={formData.analysisHint || ""}
                onChange={handleChange}
              />
            </div>
            {/* observationIds and testCaseIds are arrays, simplifying for now */}
            <button type="submit" className="button primary">保存</button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </section>
      ) : (
        <section className="panel">
          <div className="list">
            <div className="list-item">
              <strong>ID:</strong> {businessRule.id}
            </div>
            <div className="list-item">
              <strong>Table Asset ID:</strong> {businessRule.tableAssetId}
            </div>
            <div className="list-item">
              <strong>Semantic Description:</strong> {businessRule.semanticDesc}
            </div>
            <div className="list-item">
              <strong>Applicable Scope:</strong> {businessRule.applicableScope ?? "-"}
            </div>
            <div className="list-item">
              <strong>Exception Scope:</strong> {businessRule.exceptionScope ?? "-"}
            </div>
            <div className="list-item">
              <strong>Observation IDs:</strong> {businessRule.observationIds.join(", ")}
            </div>
            <div className="list-item">
              <strong>Test Case IDs:</strong> {businessRule.testCaseIds.join(", ")}
            </div>
            <div className="list-item">
              <strong>Common Causes:</strong> {businessRule.commonCauses ?? "-"}
            </div>
            <div className="list-item">
              <strong>Analysis Hint:</strong> {businessRule.analysisHint ?? "-"}
            </div>
            <div className="list-item">
              <strong>Status:</strong> {businessRule.status}
            </div>
            <div className="list-item">
              <strong>Git Path:</strong> {businessRule.gitPath}
            </div>
            <div className="list-item">
              <strong>Version No:</strong> {businessRule.versionNo}
            </div>
            <div className="list-item">
              <strong>Created By:</strong> {businessRule.createdBy}
            </div>
            <div className="list-item">
              <strong>Created At:</strong> {formatDateTime(businessRule.createdAt)}
            </div>
            <div className="list-item">
              <strong>Updated At:</strong> {formatDateTime(businessRule.updatedAt)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
