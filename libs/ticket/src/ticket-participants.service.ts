import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CategoryApproverService } from '@tkat-backend/category';
import {
  BadRequestError,
  badRequestErrorEnum,
  NotFoundError,
  notFoundErrorEnum,
  TicketDto,
  TicketParticipants,
  TicketParticipantsDetailDto,
  TicketParticipantsDto,
  UpdateTicketParticipantsDto,
  ZodError,
  zodErrorEnum,
  zodTicketDetailSchema,
  zodTicketParticipantsCreateSchema,
  zodTicketParticipantsDetailSchema,
  zodTicketPaticipantsSchema,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { TicketParticipantsRepository } from './ticket-participants.repository';
import { TicketService } from './ticket.service';

@Injectable()
export class TicketParticipantsService {
  constructor(
    private readonly ticketParticipantsRepository: TicketParticipantsRepository,
    @Inject(forwardRef(() => TicketService))
    private readonly ticketService: TicketService,
    private readonly categoryApproverService: CategoryApproverService,
    private readonly utilsService: UtilsService
  ) {}

  async createTicketParticipants(
    ticket: TicketDto,
    ccIds: string[]
  ): Promise<TicketParticipantsDto[]> {
    const categoryApprovers =
      await this.categoryApproverService.findCategoryApproverByCategoryId(
        ticket.categoryId
      );
    const ticketParticipants = [
      ...categoryApprovers?.map((approver, index) => ({
        ticketId: ticket.id,
        userId: approver.approverId,
        approvalOrder: approver.approvalOrder,
        userType: 'APPROVER',
        approverStatus:
          (index === 0 && ticket.approvalFlow === 'SEQUENTIAL') ||
          ticket.approvalFlow === 'PARALLEL'
            ? 'Waiting'
            : 'Pending',
      })),
      ...ccIds?.map((ccId) => ({
        ticketId: ticket.id,
        userId: ccId,
        userType: 'CC',
      })),
    ];
    const parsedRequest = zodTicketParticipantsCreateSchema
      .array()
      .safeParse(ticketParticipants);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    const result = await this.ticketParticipantsRepository.createAll(
      parsedRequest.data
    );
    const parsedResult = zodTicketPaticipantsSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async getTicketParticipantsByTicketId(
    ticketId: string
  ): Promise<TicketParticipantsDetailDto[]> {
    const result =
      await this.ticketParticipantsRepository.findTicketParticipantsByTicketId(
        ticketId
      );
    const parsedResult = zodTicketParticipantsDetailSchema
      .array()
      .safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async updateTicketParticipants(
    id: string,
    ticketId: string,
    request: UpdateTicketParticipantsDto
  ) {
    const ticket = await this.ticketService.findTicketById(ticketId);
    if (ticket.status !== 'Pending')
      throw new BadRequestError(
        badRequestErrorEnum.enum.TICKET_STATUS_ALREADY_UPDATED
      );
    const ticketParticipants = await this.ticketParticipantsRepository.update(
      id,
      request
    );
    if (!ticketParticipants)
      throw new NotFoundError(
        notFoundErrorEnum.enum.TICKET_PARTICIPANTS_NOT_FOUND
      );
    let nextApprover: TicketParticipants | null = null;
    if (request.approverStatus === 'Approved') {
      nextApprover =
        await this.ticketParticipantsRepository.existsByIdAndApprovalOrder(
          ticketId,
          ticketParticipants.approvalOrder
            ? ticketParticipants.approvalOrder + 1
            : 0
        );
      if (nextApprover) {
        await this.ticketParticipantsRepository.update(nextApprover.id, {
          approverStatus: 'Waiting',
        });
      }
    }
    if (
      request.approverStatus === 'Rejected' ||
      (request.approverStatus === 'Approved' && !nextApprover)
    ) {
      await this.ticketService.updateTicket(ticketId, {
        status: request.approverStatus === 'Rejected' ? 'Rejected' : 'Approved',
      });
    }
  }

  async findParticpantsTicket(
    userType: string,
    approverStatus?: string,
    isTicketClosed?: boolean
  ) {
    const result =
      await this.ticketParticipantsRepository.findParticpantsTicket(
        userType,
        this.utilsService.getUserId(),
        approverStatus,
        isTicketClosed
      );
    const parsedResult = zodTicketDetailSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }
}
