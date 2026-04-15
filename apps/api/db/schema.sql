create table if not exists users (
  id text primary key,
  name text not null,
  email text,
  role text not null,
  status text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists table_assets (
  id text primary key,
  table_name text not null unique,
  display_name text not null,
  domain_code text,
  description text,
  risk_level text not null,
  owner_user_id text,
  status text not null,
  current_version_id text,
  created_at text not null,
  updated_at text not null,
  foreign key (owner_user_id) references users(id)
);

create table if not exists observation_points (
  id text primary key,
  table_asset_id text not null,
  name text not null,
  metric_code text not null,
  metric_name text not null,
  aggregation_expr text not null,
  time_grain text not null,
  dimension_json text not null,
  filter_json text not null,
  scene_tags_json text not null,
  status text not null,
  git_path text not null,
  version_no integer not null,
  created_by text not null,
  created_at text not null,
  updated_at text not null,
  foreign key (table_asset_id) references table_assets(id),
  foreign key (created_by) references users(id)
);

create table if not exists test_cases (
  id text primary key,
  table_asset_id text not null,
  name text not null,
  test_case_type text not null,
  logic_desc text not null,
  threshold_desc text,
  sql_template text not null,
  supports_one_service integer not null,
  supports_dqc integer not null,
  one_service_parser text,
  dqc_template_type text,
  risk_level text not null,
  status text not null,
  git_path text not null,
  version_no integer not null,
  created_by text not null,
  created_at text not null,
  updated_at text not null,
  foreign key (table_asset_id) references table_assets(id),
  foreign key (created_by) references users(id)
);

create table if not exists business_rules (
  id text primary key,
  table_asset_id text not null,
  name text not null,
  semantic_desc text not null,
  applicable_scope text,
  exception_scope text,
  common_causes text,
  analysis_hint text,
  status text not null,
  git_path text not null,
  version_no integer not null,
  created_by text not null,
  created_at text not null,
  updated_at text not null,
  foreign key (table_asset_id) references table_assets(id),
  foreign key (created_by) references users(id)
);

create table if not exists test_case_observation_links (
  id text primary key,
  test_case_id text not null,
  observation_id text not null,
  created_at text not null,
  foreign key (test_case_id) references test_cases(id),
  foreign key (observation_id) references observation_points(id)
);

create table if not exists business_rule_observation_links (
  id text primary key,
  business_rule_id text not null,
  observation_id text not null,
  created_at text not null,
  foreign key (business_rule_id) references business_rules(id),
  foreign key (observation_id) references observation_points(id)
);

create table if not exists business_rule_test_case_links (
  id text primary key,
  business_rule_id text not null,
  test_case_id text not null,
  created_at text not null,
  foreign key (business_rule_id) references business_rules(id),
  foreign key (test_case_id) references test_cases(id)
);

create table if not exists dqc_deployments (
  id text primary key,
  table_asset_id text not null,
  test_case_id text not null,
  dqc_rule_type text not null,
  monitor_name text not null,
  monitor_object text not null,
  monitor_field text,
  pre_sql text,
  condition_expr text not null,
  schedule_cycle text,
  schedule_time text,
  alert_level text,
  receivers_json text,
  dqc_rule_id text,
  publish_status text not null,
  last_synced_at text,
  git_path text not null,
  version_no integer not null,
  created_at text not null,
  updated_at text not null,
  foreign key (table_asset_id) references table_assets(id),
  foreign key (test_case_id) references test_cases(id)
);

create table if not exists manual_runs (
  id text primary key,
  title text not null,
  scene text not null,
  table_ids_json text not null,
  metric_codes_json text not null,
  requirement_desc text not null,
  change_desc text not null,
  business_date_start text not null,
  business_date_end text not null,
  executor_user_id text not null,
  status text not null,
  created_at text not null,
  updated_at text not null,
  foreign key (executor_user_id) references users(id)
);

create table if not exists manual_run_selected_test_cases (
  id text primary key,
  manual_run_id text not null,
  test_case_id text not null,
  selected integer not null,
  created_at text not null,
  foreign key (manual_run_id) references manual_runs(id),
  foreign key (test_case_id) references test_cases(id)
);

create table if not exists manual_run_batches (
  id text primary key,
  manual_run_id text not null,
  one_service_request_id text,
  status text not null,
  triggered_by text not null,
  started_at text,
  finished_at text,
  error_message text,
  created_at text not null,
  foreign key (manual_run_id) references manual_runs(id),
  foreign key (triggered_by) references users(id)
);

create table if not exists manual_run_sql_jobs (
  id text primary key,
  batch_id text not null,
  test_case_id text not null,
  sql_text text not null,
  sql_summary text not null,
  execution_status text not null,
  result_row_count integer,
  raw_result_json text,
  parsed_result_json text,
  started_at text,
  finished_at text,
  error_message text,
  created_at text not null,
  foreign key (batch_id) references manual_run_batches(id),
  foreign key (test_case_id) references test_cases(id)
);

create table if not exists manual_run_findings (
  id text primary key,
  batch_id text not null,
  table_asset_id text not null,
  test_case_id text not null,
  business_rule_id text,
  result_status text not null,
  finding_summary text not null,
  abnormal_dimensions_json text,
  evidence_json text not null,
  one_service_summary text,
  sort_score real not null default 0,
  created_at text not null,
  foreign key (batch_id) references manual_run_batches(id),
  foreign key (table_asset_id) references table_assets(id),
  foreign key (test_case_id) references test_cases(id),
  foreign key (business_rule_id) references business_rules(id)
);

create table if not exists feedback_batches (
  id text primary key,
  manual_run_id text not null,
  reason text not null,
  applicable_scenes_json text not null,
  status text not null,
  confirmed_by text,
  created_at text not null,
  confirmed_at text,
  foreign key (manual_run_id) references manual_runs(id),
  foreign key (confirmed_by) references users(id)
);

create table if not exists feedback_batch_items (
  id text primary key,
  batch_id text not null,
  item_type text not null,
  source_id text not null,
  selected integer not null,
  payload_json text not null,
  created_at text not null,
  foreign key (batch_id) references feedback_batches(id)
);

create table if not exists dqc_publish_tasks (
  id text primary key,
  title text not null,
  table_ids_json text not null,
  status text not null,
  created_by text not null,
  created_at text not null,
  updated_at text not null,
  foreign key (created_by) references users(id)
);

create table if not exists dqc_publish_diffs (
  id text primary key,
  publish_task_id text not null,
  table_asset_id text not null,
  test_case_id text not null,
  current_dqc_status text not null,
  suggested_action text not null,
  reason text not null,
  selected integer not null default 0,
  created_at text not null,
  foreign key (publish_task_id) references dqc_publish_tasks(id),
  foreign key (table_asset_id) references table_assets(id),
  foreign key (test_case_id) references test_cases(id)
);

create table if not exists git_versions (
  id text primary key,
  commit_sha text not null,
  commit_message text not null,
  author_user_id text not null,
  related_object_type text not null,
  related_object_id text not null,
  version_no integer not null,
  created_at text not null,
  foreign key (author_user_id) references users(id)
);

create table if not exists git_change_items (
  id text primary key,
  git_version_id text not null,
  file_path text not null,
  change_type text not null,
  diff_summary text,
  created_at text not null,
  foreign key (git_version_id) references git_versions(id)
);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  notification_type text not null,
  title text not null,
  content text not null,
  related_object_type text,
  related_object_id text,
  read_at text,
  created_at text not null,
  foreign key (user_id) references users(id)
);

create table if not exists audit_logs (
  id text primary key,
  actor_user_id text not null,
  action_type text not null,
  target_type text not null,
  target_id text not null,
  payload_json text not null,
  created_at text not null,
  foreign key (actor_user_id) references users(id)
);

create index if not exists idx_table_assets_name on table_assets(table_name);
create index if not exists idx_table_assets_owner on table_assets(owner_user_id, risk_level);
create index if not exists idx_observation_points_table on observation_points(table_asset_id, metric_code);
create index if not exists idx_test_cases_table on test_cases(table_asset_id, test_case_type, risk_level);
create index if not exists idx_business_rules_table on business_rules(table_asset_id);
create index if not exists idx_dqc_deployments_table on dqc_deployments(table_asset_id, publish_status);
create index if not exists idx_manual_runs_status on manual_runs(status, scene);
create index if not exists idx_manual_run_batches_run on manual_run_batches(manual_run_id, created_at desc);
create index if not exists idx_manual_run_findings_batch on manual_run_findings(batch_id, result_status, sort_score desc);
create index if not exists idx_dqc_publish_diffs_task on dqc_publish_diffs(publish_task_id, suggested_action);
create index if not exists idx_git_versions_object on git_versions(related_object_type, related_object_id, created_at desc);
create index if not exists idx_notifications_user on notifications(user_id, read_at, created_at desc);
