import { listNotifications } from "../../lib/api";

export default async function NotificationsPage() {
  const notifications = await listNotifications();

  return (
    <div className="grid">
      <section className="hero">
        <span className="eyebrow">Notifications</span>
        <h1>我的提示</h1>
        <p>回滚提示、待确认口径、待确认回写等都先通过页面提示承载。</p>
      </section>

      <section className="panel">
        <div className="list">
          {notifications.map((notification) => (
            <div className="list-item" key={notification.id}>
              <div className="row wrap">
                <strong>{notification.title}</strong>
                <span className={`badge status-${notification.status}`}>{notification.status}</span>
              </div>
              <p>{notification.content}</p>
              <p className="muted">{notification.createdAt}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
