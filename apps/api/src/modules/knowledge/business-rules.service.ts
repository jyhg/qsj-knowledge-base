import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRuleDetail } from '@qsj/shared-types';
import { businessRules as mockBusinessRules } from '../../data/mock-store.js';

function nowIso() {
  return new Date().toISOString();
}

@Injectable()
export class BusinessRulesService {
  async findAll(): Promise<BusinessRuleDetail[]> {
    return mockBusinessRules;
  }

  async findOne(id: string): Promise<BusinessRuleDetail> {
    const businessRule = mockBusinessRules.find((item) => item.id === id);
    if (!businessRule) {
      throw new NotFoundException(`Business Rule with ID ${id} not found`);
    }
    return businessRule;
  }

  async create(createBusinessRuleDto: Partial<BusinessRuleDetail>): Promise<BusinessRuleDetail> {
    const now = nowIso();
    const created: BusinessRuleDetail = {
      id: `br_${Date.now()}`,
      tableAssetId: createBusinessRuleDto.tableAssetId ?? '',
      name: createBusinessRuleDto.name ?? '',
      semanticDesc: createBusinessRuleDto.semanticDesc ?? '',
      applicableScope: createBusinessRuleDto.applicableScope ?? null,
      exceptionScope: createBusinessRuleDto.exceptionScope ?? null,
      observationIds: createBusinessRuleDto.observationIds ?? [],
      testCaseIds: createBusinessRuleDto.testCaseIds ?? [],
      status: createBusinessRuleDto.status ?? 'draft',
      commonCauses: createBusinessRuleDto.commonCauses ?? null,
      analysisHint: createBusinessRuleDto.analysisHint ?? null,
      gitPath: `knowledge-assets/business-rules/br_${Date.now()}.yaml`,
      versionNo: 1,
      createdBy: createBusinessRuleDto.createdBy ?? 'system',
      createdAt: now,
      updatedAt: now,
    };
    mockBusinessRules.unshift(created);
    return created;
  }

  async update(id: string, updateBusinessRuleDto: Partial<BusinessRuleDetail>): Promise<BusinessRuleDetail> {
    const index = mockBusinessRules.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new NotFoundException(`Business Rule with ID ${id} not found`);
    }
    const updated = { ...mockBusinessRules[index], ...updateBusinessRuleDto, updatedAt: nowIso() };
    mockBusinessRules.splice(index, 1, updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const index = mockBusinessRules.findIndex((item) => item.id === id);
    if (index >= 0) {
      mockBusinessRules.splice(index, 1);
    }
  }
}
