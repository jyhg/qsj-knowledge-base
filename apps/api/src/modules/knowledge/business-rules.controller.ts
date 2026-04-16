import { Body, Controller, Get, Param, Patch, Post, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { BusinessRulesService } from './business-rules.service.js';
import { BusinessRuleDetail } from '@qsj/shared-types';

@Controller('business-rules')
export class BusinessRulesController {
  constructor(private readonly businessRulesService: BusinessRulesService) {}

  @Get()
  findAll() {
    return this.businessRulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessRulesService.findOne(id);
  }

  @Post()
  create(@Body() createBusinessRuleDto: Partial<BusinessRuleDetail>) {
    return this.businessRulesService.create(createBusinessRuleDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBusinessRuleDto: Partial<BusinessRuleDetail>) {
    return this.businessRulesService.update(id, updateBusinessRuleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.businessRulesService.remove(id);
  }
}
