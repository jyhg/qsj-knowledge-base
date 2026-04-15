import type { ReactNode } from "react";

import "./globals.css";

const navItems = [
  { href: "/", label: "工作台" },
  { href: "/tables", label: "表资产" },
  { href: "/manual-runs/new", label: "验数执行台" },
  { href: "/dqc-publish", label: "DQC 回填台" },
  { href: "/versions", label: "版本记录" },
  { href: "/notifications", label: "我的提示" }
];

export const metadata = {
  title: "数仓测试用例知识库与验数运营台",
  description: "Table-first warehouse validation knowledge base and operations console"
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
