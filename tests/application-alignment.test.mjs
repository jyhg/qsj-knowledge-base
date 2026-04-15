import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const mockStoreSource = readFileSync(resolve("apps/api/src/data/mock-store.ts"), "utf8");
const apiLibSource = readFileSync(resolve("apps/web/src/lib/api.ts"), "utf8");
const demoDataSource = readFileSync(resolve("apps/web/src/lib/demo-data.ts"), "utf8");
const appModuleSource = readFileSync(resolve("apps/api/src/app.module.ts"), "utf8");

function expectSourceContains(source, pattern, message) {
  assert.match(source, pattern, message);
}

test("mock store exposes the new table-asset and execution demo datasets", () => {
  expectSourceContains(
    mockStoreSource,
    /export const tableAssets\s*:/,
    "expected mock-store to export tableAssets",
  );
  expectSourceContains(
    mockStoreSource,
    /export const observationPoints\s*:/,
    "expected mock-store to export observationPoints",
  );
  expectSourceContains(
    mockStoreSource,
    /export const testCases\s*:/,
    "expected mock-store to export testCases",
  );
  expectSourceContains(
    mockStoreSource,
    /export const businessRules\s*:/,
    "expected mock-store to export businessRules",
  );
  expectSourceContains(
    mockStoreSource,
    /export const manualRuns\s*:/,
    "expected mock-store to export manualRuns",
  );
  expectSourceContains(
    mockStoreSource,
    /export const manualRunFindings\s*:/,
    "expected mock-store to export manualRunFindings",
  );
  expectSourceContains(
    mockStoreSource,
    /export const dqcPublishDiffs\s*:/,
    "expected mock-store to export dqcPublishDiffs",
  );
  expectSourceContains(
    mockStoreSource,
    /export const gitVersions\s*:/,
    "expected mock-store to export gitVersions",
  );
});

test("api layer exposes modules and routes for tables, manual runs, dqc publish, and versions", () => {
  const expectedFiles = [
    "apps/api/src/modules/tables/tables.module.ts",
    "apps/api/src/modules/tables/tables.controller.ts",
    "apps/api/src/modules/tables/tables.service.ts",
    "apps/api/src/modules/manual-runs/manual-runs.module.ts",
    "apps/api/src/modules/manual-runs/manual-runs.controller.ts",
    "apps/api/src/modules/manual-runs/manual-runs.service.ts",
    "apps/api/src/modules/dqc-publish/dqc-publish.module.ts",
    "apps/api/src/modules/dqc-publish/dqc-publish.controller.ts",
    "apps/api/src/modules/dqc-publish/dqc-publish.service.ts",
    "apps/api/src/modules/versions/versions.module.ts",
    "apps/api/src/modules/versions/versions.controller.ts",
    "apps/api/src/modules/versions/versions.service.ts",
  ];

  for (const filePath of expectedFiles) {
    assert.ok(existsSync(resolve(filePath)), `expected ${filePath} to exist`);
  }

  expectSourceContains(appModuleSource, /TablesModule/, "expected AppModule to import TablesModule");
  expectSourceContains(
    appModuleSource,
    /ManualRunsModule/,
    "expected AppModule to import ManualRunsModule",
  );
  expectSourceContains(
    appModuleSource,
    /DqcPublishModule/,
    "expected AppModule to import DqcPublishModule",
  );
  expectSourceContains(
    appModuleSource,
    /VersionsModule/,
    "expected AppModule to import VersionsModule",
  );
});

test("frontend api and demo data expose the new table-first client contracts", () => {
  for (const expectedExport of [
    "listTableAssets",
    "getTableAsset",
    "listTableTestCases",
    "listTableObservationPoints",
    "listTableBusinessRules",
    "getExecutionPublishSummary",
    "createManualRun",
    "listManualRunCandidates",
    "executeManualRun",
    "getManualRunResults",
    "createDqcPublishTask",
    "getDqcPublishDiff",
    "listGitVersions",
  ]) {
    expectSourceContains(
      apiLibSource,
      new RegExp(`export function ${expectedExport}\\b|export async function ${expectedExport}\\b`),
      `expected api.ts to export ${expectedExport}`,
    );
  }

  for (const expectedDemo of [
    "demoTableAssets",
    "demoObservationPoints",
    "demoTestCases",
    "demoBusinessRules",
    "demoManualRunCandidates",
    "demoManualRunResult",
    "demoDqcPublishDiffs",
    "demoGitVersions",
  ]) {
    expectSourceContains(
      demoDataSource,
      new RegExp(`export const ${expectedDemo}\\b`),
      `expected demo-data.ts to export ${expectedDemo}`,
    );
  }
});
