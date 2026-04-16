import { Injectable, NotFoundException } from '@nestjs/common';
import { ObservationPoint } from '@qsj/shared-types';
import { observationPoints as mockObservationPoints } from '../../data/mock-store.js';

function nowIso() {
  return new Date().toISOString();
}

@Injectable()
export class ObservationPointsService {
  async findAll(): Promise<ObservationPoint[]> {
    return mockObservationPoints;
  }

  async findOne(id: string): Promise<ObservationPoint> {
    const observationPoint = mockObservationPoints.find((item) => item.id === id);
    if (!observationPoint) {
      throw new NotFoundException(`Observation Point with ID ${id} not found`);
    }
    return observationPoint;
  }

  async create(createObservationPointDto: Partial<ObservationPoint>): Promise<ObservationPoint> {
    const now = nowIso();
    const created: ObservationPoint = {
      id: `op_${Date.now()}`,
      tableAssetId: createObservationPointDto.tableAssetId ?? '',
      name: createObservationPointDto.name ?? '',
      metricCode: createObservationPointDto.metricCode ?? '',
      metricName: createObservationPointDto.metricName ?? '',
      aggregationExpr: createObservationPointDto.aggregationExpr ?? '',
      timeGrain: createObservationPointDto.timeGrain ?? 'day',
      dimensions: createObservationPointDto.dimensions ?? [],
      filters: createObservationPointDto.filters ?? [],
      sceneTags: createObservationPointDto.sceneTags ?? [],
      status: createObservationPointDto.status ?? 'draft',
      gitPath: `knowledge-assets/observation-points/op_${Date.now()}.yaml`,
      versionNo: 1,
      createdBy: createObservationPointDto.createdBy ?? 'system',
      createdAt: now,
      updatedAt: now,
    };
    mockObservationPoints.unshift(created);
    return created;
  }

  async update(id: string, updateObservationPointDto: Partial<ObservationPoint>): Promise<ObservationPoint> {
    const index = mockObservationPoints.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new NotFoundException(`Observation Point with ID ${id} not found`);
    }
    const updated = { ...mockObservationPoints[index], ...updateObservationPointDto, updatedAt: nowIso() };
    mockObservationPoints.splice(index, 1, updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const index = mockObservationPoints.findIndex((item) => item.id === id);
    if (index >= 0) {
      mockObservationPoints.splice(index, 1);
    }
  }
}
