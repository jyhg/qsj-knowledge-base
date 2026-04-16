'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTestCase, updateTestCase } from "../../../lib/api";
import { TestCaseDetail } from "@qsj/shared-types";
import { formatDateTime } from "../../../lib/table-first-presentation";

export default function TestCaseDetailPage() {
  const router = useRouter();
  const params = useParams<{ testCaseId: string }>();
  const testCaseId = params.testCaseId;
  const [testCase, setTestCase] = useState<TestCaseDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<TestCaseDetail>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestCase = async () => {
      try {
        setIsLoading(true);
        const data = await getTestCase(testCaseId);
        setTestCase(data);
        setFormData(data); // Initialize form data with fetched data
      } catch (err) {
        setError("Failed to load test case.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestCase();
  }, [testCaseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setIsLoading(true);
      if (testCaseId) {
        const updated = await updateTestCase(testCaseId, formData);
        setTestCase(updated);
        setFormData(updated);
        setIsEditing(false);
        router.refresh(); // Refresh the page to reflect changes
      }
    } catch (err) {
      setError("Failed to update test case.");
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

  if (!testCase) {
    return <div className="grid">Test Case not found.</div>;
  }

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Test Case Detail</span>
        <h1>{testCase.name}</h1>
        <div className="button-row">
            <button className="button" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "取消编辑" : "编辑测试用例"}
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
              <label htmlFor="logicDesc">Logic Description:</label>
              <textarea
                id="logicDesc"
                name="logicDesc"
                value={formData.logicDesc || ""}
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
                value={formData.thresholdDesc || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="sqlTemplate">SQL Template:</label>
              <textarea
                id="sqlTemplate"
                name="sqlTemplate"
                value={formData.sqlTemplate || ""}
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
                value={formData.oneServiceParser || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dqcTemplateType">DQC Template Type:</label>
              <input
                type="text"
                id="dqcTemplateType"
                name="dqcTemplateType"
                value={formData.dqcTemplateType || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="riskLevel">Risk Level:</label>
              <select
                id="riskLevel"
                name="riskLevel"
                value={formData.riskLevel || "low"}
                onChange={handleChange}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="submit" className="button primary">保存</button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </section>
      ) : (
        <section className="panel">
          <div className="list">
            <div className="list-item">
              <strong>ID:</strong> {testCase.id}
            </div>
            <div className="list-item">
              <strong>Table Asset ID:</strong> {testCase.tableAssetId}
            </div>
            <div className="list-item">
              <strong>Type:</strong> {testCase.testCaseType}
            </div>
            <div className="list-item">
              <strong>Logic Description:</strong> {testCase.logicDesc}
            </div>
            <div className="list-item">
              <strong>Threshold Description:</strong> {testCase.thresholdDesc ?? "-"}
            </div>
            <div className="list-item">
              <strong>SQL Template:</strong> <pre>{testCase.sqlTemplate}</pre>
            </div>
            <div className="list-item">
              <strong>Supports One Service:</strong> {testCase.supportsOneService ? "Yes" : "No"}
            </div>
            <div className="list-item">
              <strong>Supports DQC:</strong> {testCase.supportsDqc ? "Yes" : "No"}
            </div>
            <div className="list-item">
              <strong>One Service Parser:</strong> {testCase.oneServiceParser ?? "-"}
            </div>
            <div className="list-item">
              <strong>DQC Template Type:</strong> {testCase.dqcTemplateType ?? "-"}
            </div>
            <div className="list-item">
              <strong>Risk Level:</strong> {testCase.riskLevel}
            </div>
            <div className="list-item">
              <strong>Status:</strong> {testCase.status}
            </div>
            <div className="list-item">
              <strong>Git Path:</strong> {testCase.gitPath}
            </div>
            <div className="list-item">
              <strong>Version No:</strong> {testCase.versionNo}
            </div>
            <div className="list-item">
              <strong>Created By:</strong> {testCase.createdBy}
            </div>
            <div className="list-item">
              <strong>Created At:</strong> {formatDateTime(testCase.createdAt)}
            </div>
            <div className="list-item">
              <strong>Updated At:</strong> {formatDateTime(testCase.updatedAt)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
