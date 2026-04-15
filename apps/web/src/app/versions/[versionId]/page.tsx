import { getGitVersion } from "../../../lib/api";
import { demoGitChangeItems } from "../../../lib/demo-data";
import { formatDateTime } from "../../../lib/table-first-presentation";

export default async function VersionDetailPage({
  params
}: {
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  const version = await getGitVersion(versionId);
  const changes = demoGitChangeItems.filter((item) => item.gitVersionId === versionId);

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Versions</span>
        <h1>版本详情</h1>
        <p>查看单次 Git 提交涉及的对象、变更文件和差异摘要。</p>
      </section>

      <section className="grid cols-3">
        <div className="panel stat">
          <span className="muted">版本号</span>
          <span className="stat-value">v{version.versionNo}</span>
        </div>
        <div className="panel stat">
          <span className="muted">提交 SHA</span>
          <span className="stat-value">{version.commitSha}</span>
        </div>
        <div className="panel stat">
          <span className="muted">创建时间</span>
          <span className="stat-value">{formatDateTime(version.createdAt)}</span>
        </div>
      </section>

      <section className="panel">
        <div className="list">
          <div className="list-item">提交说明：{version.commitMessage}</div>
          <div className="list-item">
            关联对象：{version.relatedObjectType} / {version.relatedObjectId}
          </div>
          <div className="list-item">作者：{version.authorUserId}</div>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">变更文件</h2>
        <div className="list">
          {changes.map((change) => (
            <div className="list-item" key={change.id}>
              <div className="row wrap">
                <strong>{change.filePath}</strong>
                <span className="chip">{change.changeType}</span>
              </div>
              <p className="muted">{change.diffSummary ?? "-"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
