import { Injectable } from "@nestjs/common";

type SqlJobStatus = "queued" | "running" | "succeeded" | "failed";

interface SqlJobExecution {
  sql: string;
  sqlType: string;
  status: SqlJobStatus;
  jobId: string | null;
  rowCount: number;
  errorMessage: string | null;
}

export interface OneServiceExecutionSummary {
  mode: "one_service" | "mock";
  sqlCount: number;
  executions: SqlJobExecution[];
}

interface SubmitSqlJobResponse {
  jobId?: string;
  status?: SqlJobStatus;
  rowCount?: number;
  resultRowCount?: number;
  errorMessage?: string;
}

interface SqlExecutorInput {
  sqls: Array<{
    sql: string;
    sqlType: string;
  }>;
  taskRunId: string;
  submittedBy: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getEnvNumber(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function isReadOnlySql(sql: string) {
  const normalized = sql.trim().toLowerCase();
  return normalized.startsWith("select") || normalized.startsWith("with") || normalized.startsWith("explain");
}

function buildUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

@Injectable()
export class OneServiceSqlExecutorService {
  private readonly baseUrl = process.env.ONE_SERVICE_BASE_URL?.trim() ?? "";
  private readonly submitPath =
    process.env.ONE_SERVICE_SUBMIT_PATH?.trim() ?? "/internal/execution/sql-jobs";
  private readonly statusPathTemplate =
    process.env.ONE_SERVICE_STATUS_PATH_TEMPLATE?.trim() ??
    "/internal/execution/sql-jobs/{jobId}";
  private readonly token = process.env.ONE_SERVICE_TOKEN?.trim() ?? "";
  private readonly pollIntervalMs = getEnvNumber("ONE_SERVICE_POLL_INTERVAL_MS", 1000);
  private readonly pollMaxAttempts = getEnvNumber("ONE_SERVICE_POLL_MAX_ATTEMPTS", 10);

  async executeReadOnlySqls(input: SqlExecutorInput): Promise<OneServiceExecutionSummary> {
    if (input.sqls.some((item) => !isReadOnlySql(item.sql))) {
      throw new Error("ONE_SERVICE_EXECUTION_FAILED:NON_READONLY_SQL");
    }

    if (!this.baseUrl) {
      return this.executeMock(input);
    }

    const executions: SqlJobExecution[] = [];

    for (const item of input.sqls) {
      const submission = await this.submitSqlJob(item.sql, item.sqlType, input.taskRunId, input.submittedBy);

      let status = submission.status ?? "queued";
      let rowCount = submission.resultRowCount ?? submission.rowCount ?? 0;
      let errorMessage = submission.errorMessage ?? null;

      if (submission.jobId && (status === "queued" || status === "running")) {
        const finalStatus = await this.pollSqlJob(submission.jobId);
        status = finalStatus.status ?? "failed";
        rowCount = finalStatus.resultRowCount ?? finalStatus.rowCount ?? rowCount;
        errorMessage = finalStatus.errorMessage ?? errorMessage;
      }

      executions.push({
        sql: item.sql,
        sqlType: item.sqlType,
        status,
        jobId: submission.jobId ?? null,
        rowCount,
        errorMessage
      });
    }

    return {
      mode: "one_service",
      sqlCount: executions.length,
      executions
    };
  }

  private async submitSqlJob(
    sql: string,
    sqlType: string,
    taskRunId: string,
    submittedBy: string
  ): Promise<SubmitSqlJobResponse> {
    const response = await fetch(buildUrl(this.baseUrl, this.submitPath), {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({
        sql,
        taskRunId,
        sqlType,
        submittedBy
      })
    });

    if (!response.ok) {
      throw new Error(`ONE_SERVICE_EXECUTION_FAILED:SUBMIT_${response.status}`);
    }

    return (await response.json()) as SubmitSqlJobResponse;
  }

  private async pollSqlJob(jobId: string): Promise<SubmitSqlJobResponse> {
    const statusPath = this.statusPathTemplate.replace("{jobId}", jobId);

    for (let attempt = 0; attempt < this.pollMaxAttempts; attempt += 1) {
      const response = await fetch(buildUrl(this.baseUrl, statusPath), {
        headers: this.buildHeaders()
      });

      if (!response.ok) {
        throw new Error(`ONE_SERVICE_EXECUTION_FAILED:POLL_${response.status}`);
      }

      const payload = (await response.json()) as SubmitSqlJobResponse;
      const status = payload.status ?? "queued";

      if (status === "succeeded" || status === "failed") {
        return payload;
      }

      await sleep(this.pollIntervalMs);
    }

    throw new Error("ONE_SERVICE_EXECUTION_FAILED:POLL_TIMEOUT");
  }

  private executeMock(input: SqlExecutorInput): OneServiceExecutionSummary {
    return {
      mode: "mock",
      sqlCount: input.sqls.length,
      executions: input.sqls.map((item, index) => ({
        sql: item.sql,
        sqlType: item.sqlType,
        status: "succeeded",
        jobId: `mock_job_${input.taskRunId}_${index + 1}`,
        rowCount: 10 + index * 3,
        errorMessage: null
      }))
    };
  }

  private buildHeaders() {
    return {
      "content-type": "application/json",
      ...(this.token ? { authorization: `Bearer ${this.token}` } : {})
    };
  }
}
