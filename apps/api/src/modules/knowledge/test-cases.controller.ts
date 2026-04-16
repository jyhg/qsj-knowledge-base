import { Body, Controller, Get, Param, Patch, Post, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestCasesService } from './test-cases.service.js';
import { TestCaseDetail } from '@qsj/shared-types';

@Controller('test-cases')
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Get()
  findAll() {
    return this.testCasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testCasesService.findOne(id);
  }

  @Post()
  create(@Body() createTestCaseDto: Partial<TestCaseDetail>) {
    return this.testCasesService.create(createTestCaseDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestCaseDto: Partial<TestCaseDetail>) {
    return this.testCasesService.update(id, updateTestCaseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.testCasesService.remove(id);
  }
}
