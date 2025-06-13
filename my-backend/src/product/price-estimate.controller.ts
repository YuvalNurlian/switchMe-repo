import { Controller, Post, Body } from '@nestjs/common';
import { PriceEstimateService } from './price-estimate.service';

@Controller('products')
export class PriceEstimateController {
  constructor(private readonly svc: PriceEstimateService) {}

  @Post('estimate')
  estimate(@Body('description') description: string) {
    return this.svc.estimate(description);
  }
}
