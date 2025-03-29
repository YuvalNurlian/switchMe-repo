import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([])], // אין כאן Entity כי אנחנו שולפים ישירות
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
