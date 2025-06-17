import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CategoryService } from '@tkat-backend/category';
import {
  NotFoundError,
  notFoundErrorEnum,
  Ticket,
  TicketCreateDto,
  TicketUpdateDto,
  ZodError,
  zodErrorEnum,
  zodTicketCreateSchema,
  zodTicketDetailSchema,
  zodTicketDetailsSchema,
  zodTicketSchema,
  zodTicketUpdateSchema,
} from '@tkat-backend/shared';
import { ResponseService } from '@tkat-backend/template';
import { UtilsService } from '@tkat-backend/utils';
import { TicketParticipantsService } from './ticket-participants.service';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly ticketParticipantsService: TicketParticipantsService,
    private readonly utilsService: UtilsService,
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
    @Inject(forwardRef(() => ResponseService))
    private readonly responseService: ResponseService
  ) {}

  async findAllTicket(isTicketClosed?: boolean, isAssignee?: boolean) {
    const result = await this.ticketRepository.findTicket(
      isAssignee ? undefined : this.utilsService.getUserId(),
      undefined,
      isTicketClosed,
      isAssignee ? this.utilsService.getUserId() : undefined
    );
    const parsedResult = zodTicketDetailSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findTicketById(id: string) {
    const ticket = await this.ticketRepository.findTicket(undefined, id);
    if (!ticket)
      throw new NotFoundError(notFoundErrorEnum.enum.TICKET_NOT_FOUND);
    const parsedTicket = zodTicketDetailSchema.safeParse(ticket);
    if (!parsedTicket.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedTicket.error,
      });
    const participants =
      await this.ticketParticipantsService.getTicketParticipantsByTicketId(id);
    const deatilsResult = zodTicketDetailsSchema.safeParse({
      ...parsedTicket.data,
      canApprove: participants.findIndex(
        (approver) =>
          approver.userType === 'APPROVER' &&
          approver.approverStatus === 'Waiting' &&
          approver.userId === this.utilsService.getUserId()
      ),
      approvers: participants.filter(
        (approver) => approver.userType === 'APPROVER'
      ),
      cc: participants.filter((cc) => cc.userType === 'CC'),
      responses: await this.responseService.findResponseByTicketId(id),
    });
    if (!deatilsResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: deatilsResult.error,
      });
    return deatilsResult.data;
  }

  async create(request: TicketCreateDto) {
    const parsedRequest = zodTicketCreateSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    const category = await this.categoryService.findCategoryById(
      parsedRequest.data.categoryId
    );
    if (!category)
      throw new NotFoundError(notFoundErrorEnum.enum.CATEGORY_NOT_FOUND);
    const ticket = this.ticketParse(
      await this.ticketRepository.create({
        ...parsedRequest.data,
        status: 'Pending',
        requesterId: this.utilsService.getUserId(),
        approvalFlow: category.approvalFlow,
      })
    );
    await this.ticketParticipantsService.createTicketParticipants(
      ticket,
      parsedRequest.data.ccIds
    );

    const responses =
      parsedRequest.data.responses?.map((response) => ({
        ...response,
        ticketId: ticket.id,
      })) || [];
    await this.responseService.createMultipleResponses(responses);
    return 'success';
  }

  private ticketParse(result: Ticket | null) {
    if (!result)
      throw new NotFoundError(notFoundErrorEnum.enum.TICKET_NOT_FOUND);
    const parsedResult = zodTicketSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async updateTicket(id: string, request: TicketUpdateDto) {
    const requestData =
      request.status === 'Completed' ||
      request.status === 'Rejected' ||
      request.status === 'Cancelled'
        ? { ...request, isTicketClosed: true }
        : request;
    const parsedRequest = zodTicketUpdateSchema.safeParse(requestData);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    const ticket = await this.ticketRepository.update(id, parsedRequest.data);
    return this.ticketParse(ticket);
  }
}
