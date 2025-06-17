import { forwardRef, Module } from '@nestjs/common';
import { QuestionRepository } from './question.repository';
import { TemplateRepository } from './template.repository';
import { ResponseRepository } from './response.repository';
import { TemplateService } from './template.service';
import { ResponseService } from './response.service';
import { QuestionService } from './question.service';
import { questionModelProvider, responseModelProvider, templateModelProvider } from '@tkat-backend/shared';
import { UtilsModule } from '@tkat-backend/utils';
import { TicketLibModule } from '../../ticket/src/ticket.module';

@Module({
  imports: [UtilsModule, forwardRef(() => TicketLibModule)],
  controllers: [],
  providers: [QuestionRepository, ResponseRepository, TemplateRepository, QuestionService, ResponseService, TemplateService, questionModelProvider, responseModelProvider, templateModelProvider],
  exports: [QuestionService, ResponseService, TemplateService],
})
export class TemplateLibModule {}
