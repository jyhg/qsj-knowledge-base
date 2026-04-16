import { Body, Controller, Get, Param, Patch, Post, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ObservationPointsService } from './observation-points.service.js';
import { ObservationPoint } from '@qsj/shared-types';

@Controller('observations')
export class ObservationPointsController {
  constructor(private readonly observationPointsService: ObservationPointsService) {}

  @Get()
  findAll() {
    return this.observationPointsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.observationPointsService.findOne(id);
  }

  @Post()
  create(@Body() createObservationPointDto: Partial<ObservationPoint>) {
    return this.observationPointsService.create(createObservationPointDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateObservationPointDto: Partial<ObservationPoint>) {
    return this.observationPointsService.update(id, updateObservationPointDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.observationPointsService.remove(id);
  }
}
