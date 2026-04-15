import { listGitVersions } from "../../lib/api";
import { formatDateTime } from "../../lib/table-first-presentation";

export default async function VersionsPage() {
  const versions = await listGitVersions();

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Versions</span>
        <h1>版本记录</h1>
        <p>所有知识资产与发布动作通过 Git 版本追踪，支持查看提交、影响对象和后续回滚分析。</p>
      </section>

      <section className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>版本</th>
              <th>提交信息</th>
              <th>对象</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((version) => (
              <tr key={version.id}>
                <td>
                  <a href={`/versions/${version.id}`}>v{version.versionNo}</a>
                </td>
                <td>
                  <strong>{version.commitMessage}</strong>
                  <div className="muted">{version.commitSha}</div>
                </td>
                <td>
                  {version.relatedObjectType} / {version.relatedObjectId}
                </td>
                <td>{formatDateTime(version.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
