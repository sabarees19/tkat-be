import { forwardRef, Module } from '@nestjs/common';
import { CategoryLibModule } from '@tkat-backend/category';
import {
  ticketParticipantsModuleProvider,
  ticketProvider,
} from '@tkat-backend/shared';
import { UtilsModule } from '@tkat-backend/utils';
import { TicketParticipantsRepository } from './ticket-participants.repository';
import { TicketParticipantsService } from './ticket-participants.service';
import { TicketRepository } from './ticket.repository';
import { TicketService } from './ticket.service';
import { TemplateLibModule } from '@tkat-backend/template';

@Module({
  imports: [UtilsModule, forwardRef(() => CategoryLibModule), forwardRef(() => TemplateLibModule)],
  providers: [
    TicketService,
    TicketRepository,
    ticketProvider,
    TicketParticipantsService,
    TicketParticipantsRepository,
    ticketParticipantsModuleProvider,
  ],
  exports: [TicketService, TicketParticipantsService],
})
export class TicketLibModule {}
