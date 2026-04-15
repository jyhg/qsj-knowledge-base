import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const layoutSource = readFileSync(resolve("apps/web/src/app/layout.tsx"), "utf8");
const homePageSource = readFileSync(resolve("apps/web/src/app/page.tsx"), "utf8");

test("web app exposes the new table-first route pages", () => {
  const expectedFiles = [
    "apps/web/src/app/tables/page.tsx",
    "apps/web/src/app/tables/[tableId]/page.tsx",
    "apps/web/src/app/manual-runs/new/page.tsx",
    "apps/web/src/app/manual-runs/[runId]/select/page.tsx",
    "apps/web/src/app/manual-runs/[runId]/executing/page.tsx",
    "apps/web/src/app/manual-runs/[runId]/results/page.tsx",
    "apps/web/src/app/manual-runs/[runId]/feedback/page.tsx",
    "apps/web/src/app/dqc-publish/page.tsx",
    "apps/web/src/app/dqc-publish/[publishId]/diff/page.tsx",
    "apps/web/src/app/versions/page.tsx",
    "apps/web/src/app/versions/[versionId]/page.tsx",
    "apps/web/src/app/notifications/page.tsx"
  ];

  for (const filePath of expectedFiles) {
    assert.ok(existsSync(resolve(filePath)), `expected ${filePath} to exist`);
  }
});

test("top-level navigation uses tables, manual runs, dqc publish, versions, and notifications", () => {
  for (const href of ["/", "/tables", "/manual-runs/new", "/dqc-publish", "/versions", "/notifications"]) {
    assert.match(layoutSource, new RegExp(`href: "${href.replace("/", "\\/")}"`), `expected layout nav to include ${href}`);
  }

  assert.doesNotMatch(layoutSource, /href: "\/tasks"/, "expected /tasks to be removed from primary nav");
  assert.doesNotMatch(layoutSource, /href: "\/knowledge"/, "expected /knowledge to be removed from primary nav");
});

test("home page promotes the new table-first workflows instead of legacy task center copy", () => {
  for (const expectedText of ["表资产", "验数执行台", "DQC 回填台", "版本记录", "我的提示"]) {
    assert.match(homePageSource, new RegExp(expectedText), `expected home page to mention ${expectedText}`);
  }

  assert.doesNotMatch(homePageSource, /任务中心/, "expected legacy task center copy to be removed");
  assert.doesNotMatch(homePageSource, /href="\/knowledge"|href="\/tasks"/, "expected legacy home links to be replaced");
});
