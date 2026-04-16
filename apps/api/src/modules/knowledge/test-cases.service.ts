import { Injectable, NotFoundException } from '@nestjs/common';
import { TestCaseDetail } from '@qsj/shared-types';
import { testCases as mockTestCases } from '../../data/mock-store.js';

function nowIso() {
  return new Date().toISOString();
}

@Injectable()
export class TestCasesService {
  async findAll(): Promise<TestCaseDetail[]> {
    return mockTestCases;
  }

  async findOne(id: string): Promise<TestCaseDetail> {
    const testCase = mockTestCases.find((item) => item.id === id);
    if (!testCase) {
      throw new NotFoundException(`Test Case with ID ${id} not found`);
    }
    return testCase;
  }

  async create(createTestCaseDto: Partial<TestCaseDetail>): Promise<TestCaseDetail> {
    const now = nowIso();
    const created: TestCaseDetail = {
      id: `tc_${Date.now()}`,
      tableAssetId: createTestCaseDto.tableAssetId ?? '',
      name: createTestCaseDto.name ?? '',
      testCaseType: createTestCaseDto.testCaseType ?? 'reconciliation',
      logicDesc: createTestCaseDto.logicDesc ?? '',
      thresholdDesc: createTestCaseDto.thresholdDesc ?? null,
      observationIds: createTestCaseDto.observationIds ?? [],
      supportedScenes: createTestCaseDto.supportedScenes ?? [],
      channel: createTestCaseDto.channel ?? 'one_service',
      supportsOneService: createTestCaseDto.supportsOneService ?? true,
      supportsDqc: createTestCaseDto.supportsDqc ?? false,
      oneServiceParser: createTestCaseDto.oneServiceParser ?? null,
      dqcTemplateType: createTestCaseDto.dqcTemplateType ?? null,
      riskLevel: createTestCaseDto.riskLevel ?? 'low',
      status: createTestCaseDto.status ?? 'draft',
      lastResultStatus: null,
      lastExecutedAt: null,
      sqlTemplate: createTestCaseDto.sqlTemplate ?? '',
      businessRuleIds: createTestCaseDto.businessRuleIds ?? [],
      gitPath: `knowledge-assets/test-cases/tc_${Date.now()}.yaml`,
      versionNo: 1,
      createdBy: createTestCaseDto.createdBy ?? 'system',
      createdAt: now,
      updatedAt: now,
    };
    mockTestCases.unshift(created);
    return created;
  }

  async update(id: string, updateTestCaseDto: Partial<TestCaseDetail>): Promise<TestCaseDetail> {
    const index = mockTestCases.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new NotFoundException(`Test Case with ID ${id} not found`);
    }
    const updated = { ...mockTestCases[index], ...updateTestCaseDto, updatedAt: nowIso() };
    mockTestCases.splice(index, 1, updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const index = mockTestCases.findIndex((item) => item.id === id);
    if (index >= 0) {
      mockTestCases.splice(index, 1);
    }
  }
}
