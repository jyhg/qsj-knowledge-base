create table if not exists users (
  id text primary key,
  name text not null,
  email text,
  role text not null,
  status text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists tasks (
  id text primary key,
  title text not null,
  scene text not null,
  target_table text not null,
  requirement_desc text not null,
  change_desc text not null,
  business_date_start text not null,
  business_date_end text not null,
  executor_user_id text not null,
  pm_user_id text not null,
  status text not null,
  extra_sql text,
  has_pending_feedback integer not null default 0,
  last_run_at text,
  created_by text not null,
  updated_by text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists task_metrics (
  id text primary key,
  task_id text not null,
  metric_code text not null,
  metric_name text not null,
  sort_order integer not null,
  created_at text not null,
  foreign key (task_id) references tasks(id)
);

create table if not exists task_scope_confirmations (
  id text primary key,
  task_id text not null,
  implementation_id text not null,
  confirmed_by text not null,
  confirmed_role text not null,
  comment text not null,
  created_at text not null,
  foreign key (task_id) references tasks(id)
);

create table if not exists task_runs (
  id text primary key,
  task_id text not null,
  run_no integer not null,
  scene text not null,
  status text not null,
  started_at text,
  finished_at text,
  triggered_by text not null,
  stale_reason text,
  created_at text not null,
  foreign key (task_id) references tasks(id)
);

create table if not exists task_run_checks (
  id text primary key,
  run_id text not null,
  level text not null,
  metric_code text,
  check_type text not null,
  rule_id text,
  risk_level text not null,
  status text not null,
  finding_summary text,
  impact_scope text,
  evidence_json text not null,
  sort_score real not null default 0,
  created_at text not null,
  foreign key (run_id) references task_runs(id)
);

create table if not exists task_run_sql_executions (
  id text primary key,
  run_id text not null,
  check_id text,
  sql_type text not null,
  sql_summary text not null,
  sql_text text not null,
  submitted_by text not null,
  execution_status text not null,
  result_row_count integer,
  one_service_job_id text,
  started_at text,
  finished_at text,
  error_message text,
  created_at text not null,
  foreign key (run_id) references task_runs(id)
);

create table if not exists task_run_dqc_packages (
  id text primary key,
  run_id text not null,
  package_version integer not null,
  package_json text not null,
  generated_by text not null,
  created_at text not null,
  foreign key (run_id) references task_runs(id)
);

create table if not exists task_run_dqc_executions (
  id text primary key,
  run_id text not null,
  package_id text not null,
  dqc_request_id text,
  execution_status text not null,
  result_summary_json text,
  started_at text,
  finished_at text,
  error_message text,
  created_at text not null,
  foreign key (run_id) references task_runs(id)
);

create table if not exists feedback_batches (
  id text primary key,
  task_id text not null,
  run_id text not null,
  reason text not null,
  applicable_scene text not null,
  confirmed_by text not null,
  status text not null,
  created_at text not null,
  foreign key (task_id) references tasks(id)
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

create table if not exists knowledge_cards (
  id text primary key,
  card_type text not null,
  metric_code text not null,
  metric_name text not null,
  table_name text not null,
  business_grain text not null,
  business_definition text not null,
  dimension_json text not null,
  status text not null,
  owner_user_id text,
  current_version_id text,
  created_by text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists knowledge_card_versions (
  id text primary key,
  card_id text not null,
  version_no integer not null,
  create_mode text not null,
  snapshot_json text not null,
  reason text,
  applicable_scene text,
  created_by text not null,
  created_at text not null,
  foreign key (card_id) references knowledge_cards(id)
);

create table if not exists knowledge_rules (
  id text primary key,
  card_id text not null,
  name text not null,
  rule_type text not null,
  check_object text not null,
  logic_desc text not null,
  threshold_desc text,
  risk_level text not null,
  rule_level text not null,
  trigger_condition text not null,
  sql_template text,
  dqc_template_json text,
  is_active integer not null default 1,
  created_at text not null,
  updated_at text not null,
  foreign key (card_id) references knowledge_cards(id)
);

create table if not exists knowledge_anomaly_patterns (
  id text primary key,
  card_id text not null,
  pattern_name text not null,
  pattern_desc text not null,
  evidence_example text,
  handling_method text,
  created_at text not null,
  updated_at text not null,
  foreign key (card_id) references knowledge_cards(id)
);

create table if not exists knowledge_scope_implementations (
  id text primary key,
  card_id text not null,
  sql_source text not null,
  is_standard integer not null default 0,
  conflict_desc text,
  effective_from text,
  effective_to text,
  confirmed_comment text,
  created_at text not null,
  updated_at text not null,
  foreign key (card_id) references knowledge_cards(id)
);

create table if not exists knowledge_rollbacks (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  from_version_id text not null,
  to_version_id text not null,
  rollback_by text not null,
  rollback_reason text,
  created_at text not null
);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  task_id text,
  type text not null,
  title text not null,
  content text not null,
  status text not null,
  created_at text not null,
  read_at text
);

create table if not exists audit_logs (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  operator_user_id text not null,
  operator_role text not null,
  detail_json text not null,
  created_at text not null
);

create index if not exists idx_tasks_scene_status on tasks(scene, status);
create index if not exists idx_task_metrics_task on task_metrics(task_id, metric_code);
create index if not exists idx_task_runs_task on task_runs(task_id, run_no desc);
create index if not exists idx_task_run_checks_run on task_run_checks(run_id, metric_code, risk_level, status);
create index if not exists idx_knowledge_cards_table_metric on knowledge_cards(table_name, metric_code, status);
create index if not exists idx_knowledge_rules_card on knowledge_rules(card_id, is_active);
create index if not exists idx_notifications_user on notifications(user_id, status, created_at desc);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id, created_at desc);
