import { Module, forwardRef } from '@nestjs/common';
import { ExchangeMatchesController } from './exchange-matches.controller';
import { ExchangeMatchesGeneratorService } from './exchange-matches-generator.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([]), forwardRef(() => ProductModule)],
  controllers: [ExchangeMatchesController],
  providers: [ExchangeMatchesGeneratorService],
  exports: [ExchangeMatchesGeneratorService]
})
export class ExchangeMatchesModule {}
