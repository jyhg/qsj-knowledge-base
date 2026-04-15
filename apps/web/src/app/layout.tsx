import type { ReactNode } from "react";

import "./globals.css";

const navItems = [
  { href: "/", label: "工作台" },
  { href: "/tasks", label: "任务中心" },
  { href: "/knowledge", label: "知识库" },
  { href: "/notifications", label: "我的提示" }
];

export const metadata = {
  title: "数据质量知识库与 AI 验数助手",
  description: "QSJ internal data quality console"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <div className="topbar-inner">
              <div className="brand">
                <span className="brand-title">QSJ Quality Console</span>
                <span className="brand-subtitle">Data Knowledge + Validation Ops</span>
              </div>
              <nav className="nav">
                {navItems.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </header>
          <main className="page">{children}</main>
        </div>
      </body>
    </html>
  );
}

