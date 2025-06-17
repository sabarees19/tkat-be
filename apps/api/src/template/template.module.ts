import { Module } from '@nestjs/common';
import { TemplateLibModule } from '@tkat-backend/template';
import { TemplateController } from './template.controller';

@Module({
  imports: [TemplateLibModule],
  controllers: [TemplateController],
})
export class TemplateModule {}
