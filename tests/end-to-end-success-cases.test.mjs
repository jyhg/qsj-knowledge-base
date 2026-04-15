import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const API_URL = "http://localhost:3001";
const WEB_URL = "http://localhost:3000";

async function isReachable(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForUrl(url, timeoutMs = 30000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isReachable(url)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`TIMEOUT_WAITING_FOR_${url}`);
}

function startServer(command, args) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: "ignore",
    shell: false
  });
  return child;
}

let apiProcess = null;
let webProcess = null;

test.before(async () => {
  if (!(await isReachable(`${API_URL}/api/v1/me`))) {
    apiProcess = startServer("npm", ["run", "dev:api"]);
  }

  if (!(await isReachable(`${WEB_URL}/`))) {
    webProcess = startServer("npm", ["run", "dev:web"]);
  }

  await waitForUrl(`${API_URL}/api/v1/me`);
  await waitForUrl(`${WEB_URL}/`);
});

test.after(() => {
  for (const child of [webProcess, apiProcess]) {
    if (child && !child.killed) {
      child.kill("SIGTERM");
    }
  }
});

test("manual run creation page supports creating analysis and self-test tasks from the UI", async () => {
  const html = await fetch(`${WEB_URL}/manual-runs/new`).then((response) => response.text());

  assert.match(html, /<form[\s\S]*name="title"/, "expected manual-runs/new to expose a creation form");
  assert.match(html, /name="scene"/, "expected manual-runs/new to let the user choose a scene");
  assert.match(html, /取数分析/, "expected analysis scene copy on manual-runs/new");
  assert.match(html, /开发自测/, "expected self-test scene copy on manual-runs/new");
  assert.doesNotMatch(
    html,
    /href="\/manual-runs\/mr_1\/select\?tableId=/,
    "expected manual-runs/new to stop hardcoding links to an existing demo run"
  );
});

test("manual run candidate selection filters the rules by the selected table", async () => {
  const html = await fetch(
    `${WEB_URL}/manual-runs/mr_1/select?tableId=tbl_ads_app_qsj_zz_secondhand`
  ).then((response) => response.text());

  assert.doesNotMatch(
    html,
    /ads_app_qsj_agg_cate_conv/,
    "expected select page to hide candidates from other tables"
  );
  assert.match(
    html,
    /ads_app_qsj_zz_secondhand|暂无候选规则/,
    "expected select page to either show selected-table candidates or an empty state"
  );
});

test("manual run candidate selection page exposes a manual execute action", async () => {
  const html = await fetch(
    `${WEB_URL}/manual-runs/mr_1/select?tableId=tbl_ads_app_qsj_agg_cate_conv`
  ).then((response) => response.text());

  assert.match(html, /<form[\s\S]*selectedTestCaseIds/, "expected select page to expose candidate checkboxes");
  assert.match(html, /触发执行|执行选中规则/, "expected select page to expose an execution CTA");
});

test("dqc publish entry page supports creating a publish task from selected tables", async () => {
  const html = await fetch(`${WEB_URL}/dqc-publish`).then((response) => response.text());

  assert.match(html, /<form[\s\S]*name="title"/, "expected dqc-publish to expose a task creation form");
  assert.match(html, /name="tableIds"/, "expected dqc-publish to allow selecting involved tables");
  assert.match(html, /创建回填任务|生成差异/, "expected dqc-publish to expose a creation CTA");
});

test("analysis/self-test success case can create a manual run, execute selected rules, and return results", async () => {
  const createdRun = await fetch(`${API_URL}/api/v1/manual-runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "端到端开发自测任务",
      scene: "development_self_test",
      tableIds: ["tbl_ads_app_qsj_zz_secondhand"],
      metricCodes: ["order_cnt"],
      requirementDesc: "验证二手订单量一致性。",
      changeDesc: "调整二手链路汇总口径。",
      businessDateStart: "2026-04-08",
      businessDateEnd: "2026-04-14",
      executorUserId: "usr_dw_1"
    })
  }).then((response) => response.json());

  const candidates = await fetch(`${API_URL}/api/v1/manual-runs/${createdRun.id}/candidates`).then((response) =>
    response.json()
  );

  assert.ok(candidates.length > 0, "expected created manual run to have selectable candidates");
  assert.ok(
    candidates.every((item) => item.tableId === "tbl_ads_app_qsj_zz_secondhand"),
    "expected candidates to stay within the selected table scope"
  );

  await fetch(`${API_URL}/api/v1/manual-runs/${createdRun.id}/execute`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      selectedTestCaseIds: candidates.map((item) => item.testCaseId)
    })
  }).then((response) => response.json());

  const result = await fetch(`${API_URL}/api/v1/manual-runs/${createdRun.id}/results`).then((response) =>
    response.json()
  );

  assert.equal(result.runId, createdRun.id, "expected execution results to bind to the created run");
  assert.ok(result.findings.length > 0, "expected execution to generate findings");
});

test("dqc publish success case can create a publish task and generate scoped diffs", async () => {
  const createdTask = await fetch(`${API_URL}/api/v1/dqc-publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "端到端 DQC 回填任务",
      tableIds: ["tbl_ads_app_qsj_agg_cate_conv"],
      createdBy: "usr_dw_1"
    })
  }).then((response) => response.json());

  const diffs = await fetch(`${API_URL}/api/v1/dqc-publish/${createdTask.id}/diff`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({})
  }).then((response) => response.json());

  assert.ok(diffs.length > 0, "expected created publish task to generate diffs");
  assert.ok(
    diffs.every((item) => item.tableAssetId === "tbl_ads_app_qsj_agg_cate_conv"),
    "expected generated diffs to stay within the selected table scope"
  );
});
