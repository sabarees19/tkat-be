import { Module } from '@nestjs/common';
import { TicketLibModule } from '@tkat-backend/ticket';
import { TicketController } from './ticket.controller';

@Module({
  imports: [TicketLibModule],
  controllers: [TicketController],
})
export class TicketModule {}
