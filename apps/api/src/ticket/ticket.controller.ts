import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  TicketCreateDto,
  TicketUpdateDto,
  UpdateTicketParticipantsDto,
} from '@tkat-backend/shared';
import { TicketParticipantsService } from 'libs/ticket/src/ticket-participants.service';
import { TicketService } from 'libs/ticket/src/ticket.service';
import { Public } from '../auth/auth.public';
import { Permissions } from '../auth/permission.decorator';

@Public()
@Controller('ticket')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly ticketParticipantsService: TicketParticipantsService
  ) {}

  @Permissions('TICKET:CREATE')
  @Post()
  create(@Body() createTicketDto: TicketCreateDto) {
    return this.ticketService.create(createTicketDto);
  }

  @Permissions('TICKET:LIST')
  @Get()
  findAllTicket(
    @Query('isTicketClosed', new ParseBoolPipe({ optional: true }))
    isTicketClosed: boolean,
    @Query('isAssignee', new ParseBoolPipe({ optional: true }))
    isAssignee: boolean
  ) {
    return this.ticketService.findAllTicket(isTicketClosed, isAssignee);
  }

  @Get('/participants')
  findParticpantsTicket(
    @Query('userType') userType: string,
    @Query('approverStatus') approverStatus: string,
    @Query('isTicketClosed', new ParseBoolPipe({ optional: true }))
    isTicketClosed: boolean
  ) {
    return this.ticketParticipantsService.findParticpantsTicket(
      userType,
      approverStatus,
      isTicketClosed
    );
  }

  @Permissions('TICKET:LIST')
  @Get(':id')
  findTicketById(@Param('id') id: string) {
    return this.ticketService.findTicketById(id);
  }

  // @Permissions('TICKET:UPDATE')
  @Patch('participants')
  updateTicketParticipants(
    @Query('id') id: string,
    @Query('ticketId') ticketId: string,
    @Body() updateTicketParticipantsDto: UpdateTicketParticipantsDto
  ) {
    return this.ticketParticipantsService.updateTicketParticipants(
      id,
      ticketId,
      updateTicketParticipantsDto
    );
  }

  @Patch(':id')
  updateTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: TicketUpdateDto
  ) {
    return this.ticketService.updateTicket(id, updateTicketDto);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
  //   return this.ticketService.update(+id, updateTicketDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ticketService.remove(+id);
  // }
}
