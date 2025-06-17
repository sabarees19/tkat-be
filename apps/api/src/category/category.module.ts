import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryLibModule } from '@tkat-backend/category';

@Module({
  imports: [CategoryLibModule],
  controllers: [CategoryController],
})
export class CategoryModule {}
