  'use client'; // Convert to client component

import { useEffect, useState } from 'react'; // Import useState and useEffect
import { useParams, useRouter, useSearchParams } from 'next/navigation'; // Import useRouter

import {
  getExecutionPublishSummary,
  getTableAsset,
  listGitVersions,
  listTableBusinessRules,
  listTableObservationPoints,
  listTableTestCases,
  deleteTestCase,
  deleteObservationPoint,
  deleteBusinessRule,
  // deleteTableAsset, // Not used here directly, but added to api.ts
} from "../../../lib/api";
import {
  formatDateTime,
  getAssetStatusLabel,
  getExecutionChannelLabel,
  getManualRunResultLabel,
  getRiskLabel
} from "../../../lib/table-first-presentation";

// Define an enum for tabs for better readability
enum KnowledgeAssetTab {
  TEST_CASES = '测试用例',
  OBSERVATION_POINTS = '观测点',
  BUSINESS_RULES = '业务规则',
  EXECUTION_PUBLISH = '执行/发布',
  VERSION_HISTORY = '版本记录',
}

export default function TableDetailPage() {
  const router = useRouter();
  const params = useParams<{ tableId: string }>();
  const searchParams = useSearchParams();
  const tableId = params.tableId;
  const currentRole = searchParams.get('role');
  const withRole = (path: string) => {
    if (!currentRole) {
      return path;
    }
    return `${path}${path.includes('?') ? '&' : '?'}role=${encodeURIComponent(currentRole)}`;
  };

  const [table, setTable] = useState<any>(null);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [observationPoints, setObservationPoints] = useState<any[]>([]);
  const [businessRules, setBusinessRules] = useState<any[]>([]);
  const [executionSummary, setExecutionSummary] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [relatedVersions, setRelatedVersions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<KnowledgeAssetTab>(KnowledgeAssetTab.TEST_CASES); // Default to Test Cases tab

  useEffect(() => {
    const fetchData = async () => {
      const [tableData, testCasesData, observationPointsData, businessRulesData, executionSummaryData, versionsData] =
        await Promise.all([
          getTableAsset(tableId),
          listTableTestCases(tableId),
          listTableObservationPoints(tableId),
          listTableBusinessRules(tableId),
          getExecutionPublishSummary(tableId),
          listGitVersions()
        ]);
      setTable(tableData);
      setTestCases(testCasesData);
      setObservationPoints(observationPointsData);
      setBusinessRules(businessRulesData);
      setExecutionSummary(executionSummaryData);
      setVersions(versionsData);
      setRelatedVersions(versionsData.filter((item: any) => item.relatedObjectId === tableId));
    };

    fetchData();
  }, [tableId]); // Re-fetch data if tableId changes

  if (!table) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  const handleDeleteTestCase = async (id: string) => {
    if (confirm('确定要删除此测试用例吗？')) {
      await deleteTestCase(id);
      // Refresh data after deletion
      setTestCases(testCases.filter(tc => tc.id !== id));
    }
  };

  const handleDeleteObservationPoint = async (id: string) => {
    if (confirm('确定要删除此观测点吗？')) {
      await deleteObservationPoint(id);
      setObservationPoints(observationPoints.filter(op => op.id !== id));
    }
  };

  const handleDeleteBusinessRule = async (id: string) => {
    if (confirm('确定要删除此业务规则吗？')) {
      await deleteBusinessRule(id);
      setBusinessRules(businessRules.filter(br => br.id !== id));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case KnowledgeAssetTab.TEST_CASES:
        return (
          <>
            <div className="button-row" style={{ justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="button" onClick={() => router.push(withRole(`/test-cases/new?tableId=${tableId}`))}>新增测试用例</button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>测试用例</th>
                  <th>类型</th>
                  <th>通道</th>
                  <th>阈值</th>
                  <th>最近结果</th>
                  <th>操作</th> {/* New column for actions */}
                </tr>
              </thead>
              <tbody>
                {testCases.map((testCase) => (
                  <tr key={testCase.id}>
                    <td>
                      <a href={withRole(`/test-cases/${testCase.id}`)}>
                        <strong>{testCase.name}</strong>
                        <div className="muted">{testCase.logicDesc}</div>
                      </a>
                    </td>
                    <td>{testCase.testCaseType}</td>
                    <td>{getExecutionChannelLabel(testCase.channel)}</td>
                    <td>{testCase.thresholdDesc ?? "-"}</td>
                    <td>
                      {testCase.lastResultStatus ? getManualRunResultLabel(testCase.lastResultStatus) : "-"} ·{" "}
                      {formatDateTime(testCase.lastExecutedAt)}
                    </td>
                    <td>
                      <a className="button secondary small" href={withRole(`/test-cases/${testCase.id}`)}>编辑</a>
                      <button className="button danger small" onClick={() => handleDeleteTestCase(testCase.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      case KnowledgeAssetTab.OBSERVATION_POINTS:
        return (
          <>
            <div className="button-row" style={{ justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="button" onClick={() => router.push(withRole(`/observations/new?tableId=${tableId}`))}>新增观测点</button>
            </div>
            <div className="list">
              {observationPoints.map((item) => (
                <div className="list-item" key={item.id}>
                  <a href={withRole(`/observations/${item.id}`)}>
                    <div className="row wrap">
                      <strong>{item.name}</strong>
                      <span className="chip">v{item.versionNo}</span>
                    </div>
                    <p className="muted">
                      {item.metricName} · {item.timeGrain} · {item.dimensions.join(" / ")}
                    </p>
                    <div className="code">{item.aggregationExpr}</div>
                  </a>
                  <div className="button-row">
                    <a className="button secondary small" href={withRole(`/observations/${item.id}`)}>编辑</a>
                    <button className="button danger small" onClick={() => handleDeleteObservationPoint(item.id)}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case KnowledgeAssetTab.BUSINESS_RULES:
        return (
          <>
            <div className="button-row" style={{ justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="button" onClick={() => router.push(withRole(`/business-rules/new?tableId=${tableId}`))}>新增业务规则</button>
            </div>
            <div className="list">
              {businessRules.map((rule) => (
                <div className="list-item" key={rule.id}>
                  <a href={withRole(`/business-rules/${rule.id}`)}>
                    <div className="row wrap">
                      <strong>{rule.name}</strong>
                      <span className="chip">v{rule.versionNo}</span>
                    </div>
                    <p>{rule.semanticDesc}</p>
                    <p className="muted">适用范围：{rule.applicableScope ?? "-"}</p>
                    <p className="muted">排查建议：{rule.analysisHint ?? "-"}</p>
                  </a>
                  <div className="button-row">
                    <a className="button secondary small" href={withRole(`/business-rules/${rule.id}`)}>编辑</a>
                    <button className="button danger small" onClick={() => handleDeleteBusinessRule(rule.id)}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case KnowledgeAssetTab.EXECUTION_PUBLISH:
        return (
          <div className="panel">
            <h2 className="section-title">执行 / 发布摘要</h2>
            <div className="list">
              <div className="list-item">one service 可执行用例：{executionSummary.oneServiceExecutableCount}</div>
              <div className="list-item">最近执行批次数：{executionSummary.recentBatchCount}</div>
              <div className="list-item">最近异常数：{executionSummary.recentAbnormalCount}</div>
              <div className="list-item">DQC 已发布：{executionSummary.dqcPublishedCount}</div>
              <div className="list-item">DQC 待确认：{executionSummary.dqcPendingCount}</div>
              <div className="list-item">DQC 未映射：{executionSummary.dqcUnmappedCount}</div>
            </div>
          </div>
        );
      case KnowledgeAssetTab.VERSION_HISTORY:
        return (
          <div className="panel">
            <h2 className="section-title">版本记录</h2>
            <div className="list">
              {relatedVersions.map((version) => (
                <a className="list-item" key={version.id} href={withRole(`/versions/${version.id}`)}>
                  <div className="row wrap">
                    <strong>{version.commitMessage}</strong>
                    <span className="chip">v{version.versionNo}</span>
                  </div>
                  <p className="muted">
                    {version.commitSha} · {formatDateTime(version.createdAt)}
                  </p>
                </a>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Table Detail</span>
        <h1>{table.tableName}</h1>
        <p>{table.displayName}。此处是知识维护主入口：PM 与数仓开发都可在本页新增、编辑、删除测试用例、观测点和业务规则。</p>
      </section>

      <section className="panel">
        <div className="row wrap">
          <div className="chips">
            <span className={`badge risk-${table.riskLevel}`}>{getRiskLabel(table.riskLevel)}</span>
            <span className="chip">{getAssetStatusLabel(table.status)}</span>
            <span className="chip">当前版本 v{table.currentVersionNo ?? "-"}</span>
            <span className="chip">Git {table.latestVersionSha ?? "-"}</span>
          </div>
          <div className="button-row">
            <a className="button secondary" href={withRole(`/tables/${tableId}/edit`)}>
              编辑表资产
            </a>
            <a className="button" href={withRole('/manual-runs/new')}>
              发起手动验数
            </a>
            <a className="button secondary" href={withRole('/dqc-publish')}>
              进入 DQC 回填
            </a>
          </div>
        </div>
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          维护提示：当前表下的测试用例、观测点、业务规则均支持 PM 与数仓开发直接维护；删除后会立即从当前列表移除。
        </p>
      </section>

      <section className="grid cols-3">
        <div className="panel stat">
          <span className="muted">观测点</span>
          <span className="stat-value">{observationPoints.length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">测试用例</span>
          <span className="stat-value">{testCases.length}</span>
        </div>
        <div className="panel stat">
          <span className="muted">业务规则</span>
          <span className="stat-value">{businessRules.length}</span>
        </div>
      </section>

      <section className="panel">
        <div className="tabs">
          {Object.values(KnowledgeAssetTab).map((tab) => (
            <span
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </span>
          ))}
        </div>
        {renderContent()}
      </section>
    </div>
  );
}
