import { Controller, Get, Param, Query } from "@nestjs/common";

@Controller("compare")
export class CompareController {
  @Get("tasks/:taskId")
  compareTaskRuns(
    @Param("taskId") taskId: string,
    @Query("baseRunId") baseRunId: string,
    @Query("targetRunId") targetRunId: string
  ) {
    return {
      taskId,
      baseRunId,
      targetRunId,
      diffs: [
        {
          section: "rules",
          summary: "规则内容存在 2 处差异",
          left: "旧规则阈值 20%",
          right: "新规则阈值 30%"
        },
        {
          section: "sql",
          summary: "SQL 增加投放玩法维度",
          left: "group by platform, dt",
          right: "group by platform, play_type, dt"
        },
        {
          section: "results",
          summary: "高风险异常数从 2 提升到 4",
          left: "high=2",
          right: "high=4"
        }
      ]
    };
  }

  @Get("knowledge/:cardId")
  compareKnowledgeVersions(
    @Param("cardId") cardId: string,
    @Query("baseVersionId") baseVersionId: string,
    @Query("targetVersionId") targetVersionId: string
  ) {
    return {
      cardId,
      baseVersionId,
      targetVersionId,
      diffs: [
        {
          section: "rules",
          summary: "新增 ROI 波动规则",
          left: "无",
          right: "rule_2"
        }
      ]
    };
  }
}

