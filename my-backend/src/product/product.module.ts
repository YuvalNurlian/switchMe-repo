// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PriceEstimateController } from './price-estimate.controller';
import { PriceEstimateService } from './price-estimate.service';

@Module({
  controllers: [
    ProductController,
    PriceEstimateController,  //price estimate
  ],
  providers: [
    ProductService,
    PriceEstimateService,     //price estimate 
  ],
  exports: [ProductService],
})
export class ProductModule {}
