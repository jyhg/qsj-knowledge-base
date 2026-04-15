import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const schemaSql = readFileSync(resolve("apps/api/db/schema.sql"), "utf8");
const sharedTypesSource = readFileSync(
  resolve("packages/shared-types/src/index.ts"),
  "utf8",
);

function expectTable(tableName, requiredColumns) {
  const tableRegex = new RegExp(
    `create table if not exists ${tableName} \\(([^;]+?)\\n\\);`,
    "i",
  );
  const match = schemaSql.match(tableRegex);
  assert.ok(match, `expected table ${tableName} to exist`);

  for (const column of requiredColumns) {
    assert.match(
      match[1],
      new RegExp(`\\b${column}\\b`, "i"),
      `expected ${tableName}.${column} to exist`,
    );
  }
}

function getExportBlock(typeName) {
  const startToken = `export interface ${typeName}`;
  const typeStartToken = `export type ${typeName}`;

  const startIndex = sharedTypesSource.includes(startToken)
    ? sharedTypesSource.indexOf(startToken)
    : sharedTypesSource.indexOf(typeStartToken);

  assert.notEqual(startIndex, -1, `expected shared type ${typeName} to exist`);

  const remaining = sharedTypesSource.slice(startIndex);
  const nextExportIndex = remaining.indexOf("\nexport ", 1);

  return nextExportIndex === -1
    ? remaining
    : remaining.slice(0, nextExportIndex);
}

function expectSharedType(typeName, requiredMembers = []) {
  const block = getExportBlock(typeName);

  for (const member of requiredMembers) {
    assert.match(
      block,
      new RegExp(`\\b${member}\\b`),
      `expected ${typeName} to include member ${member}`,
    );
  }
}

test("schema.sql exposes the new table-asset core model", () => {
  expectTable("table_assets", [
    "table_name",
    "display_name",
    "risk_level",
    "current_version_id",
  ]);
  expectTable("observation_points", [
    "table_asset_id",
    "metric_code",
    "aggregation_expr",
    "dimension_json",
    "git_path",
  ]);
  expectTable("test_cases", [
    "table_asset_id",
    "test_case_type",
    "supports_one_service",
    "supports_dqc",
    "one_service_parser",
  ]);
  expectTable("business_rules", [
    "table_asset_id",
    "semantic_desc",
    "applicable_scope",
    "git_path",
  ]);
  expectTable("dqc_deployments", [
    "table_asset_id",
    "test_case_id",
    "dqc_rule_type",
    "publish_status",
  ]);
});

test("schema.sql exposes manual run and git version tracking tables", () => {
  expectTable("manual_runs", [
    "scene",
    "table_ids_json",
    "metric_codes_json",
    "status",
  ]);
  expectTable("manual_run_batches", [
    "manual_run_id",
    "one_service_request_id",
    "status",
  ]);
  expectTable("manual_run_sql_jobs", [
    "batch_id",
    "test_case_id",
    "raw_result_json",
    "parsed_result_json",
  ]);
  expectTable("manual_run_findings", [
    "batch_id",
    "table_asset_id",
    "test_case_id",
    "one_service_summary",
  ]);
  expectTable("git_versions", [
    "commit_sha",
    "related_object_type",
    "related_object_id",
    "version_no",
  ]);
  expectTable("git_change_items", [
    "git_version_id",
    "file_path",
    "change_type",
  ]);
});

test("shared types expose the new table-asset and execution contracts", () => {
  expectSharedType("ExecutionChannel");
  expectSharedType("ManualRunScene");
  expectSharedType("TableAssetSummary", [
    "tableName",
    "riskLevel",
    "observationPointCount",
    "testCaseCount",
  ]);
  expectSharedType("ObservationPoint", [
    "tableAssetId",
    "aggregationExpr",
    "dimensions",
  ]);
  expectSharedType("TestCaseSummary", [
    "tableAssetId",
    "testCaseType",
    "supportsOneService",
    "supportsDqc",
  ]);
  expectSharedType("BusinessRuleSummary", [
    "tableAssetId",
    "semanticDesc",
  ]);
  expectSharedType("ManualRunResult", [
    "batch",
    "findings",
    "oneServiceRequestId",
  ]);
  expectSharedType("DqcPublishDiffItem", [
    "suggestedAction",
    "currentDqcStatus",
  ]);
  expectSharedType("GitVersionSummary", [
    "commitSha",
    "relatedObjectType",
  ]);
});
