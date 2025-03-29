import { Controller, Get } from '@nestjs/common';
import { ConditionService } from './condition.service';

@Controller('conditions') // הנתיב יהיה /conditions
export class ConditionController {
  constructor(private readonly conditionService: ConditionService) {}

  @Get()
  async getAll(): Promise<any[]> {
    return this.conditionService.getAllConditions();
  }
}
