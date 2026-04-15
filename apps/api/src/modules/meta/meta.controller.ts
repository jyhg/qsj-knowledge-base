import { Controller, Get } from "@nestjs/common";

@Controller("meta")
export class MetaController {
  @Get("enums")
  getEnums() {
    return {
      roles: ["dw_developer", "pm"],
      taskStatuses: [
        "draft",
        "pending_scope_confirmation",
        "running",
        "pending_feedback",
        "completed"
      ],
      riskLevels: ["high", "medium", "low"],
      ruleTypes: [
        "completeness",
        "uniqueness",
        "volatility",
        "reconciliation",
        "distribution",
        "business_constraint"
      ],
      scenes: ["analysis_validation", "delivery_dqc"],
      feedbackItemTypes: [
        "anomaly_pattern",
        "sql_template",
        "scope_decision",
        "handling_method"
      ]
    };
  }
}

