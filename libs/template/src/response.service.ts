import { Injectable } from '@nestjs/common';
import {
  BadRequestError,
  badRequestErrorEnum,
  ResponseDto,
  CreateResponseDto,
  NotFoundError,
  notFoundErrorEnum,
  UpdateResponseDto,
  zodResponseSchema,
  zodCreateResponseSchema,
  ZodError,
  zodErrorEnum,
  zodUpdateResponseSchema,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { ResponseRepository } from './response.repository';
import { TicketService } from 'libs/ticket/src/ticket.service';

@Injectable()
export class ResponseService {
  constructor(
    private readonly responseRepository: ResponseRepository,
    private readonly ticketService: TicketService,
    private readonly utilsService: UtilsService
  ) {}

  async createResponse(createResponseDto: CreateResponseDto): Promise<ResponseDto> {
    const parsedRequest = zodCreateResponseSchema.safeParse(createResponseDto);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });

    await this.ticketService.findTicketById(createResponseDto.ticketId);

    const result = await this.responseRepository.create({
      ...createResponseDto,
    });
    const parsedResult = zodResponseSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async createMultipleResponses(createResponseDto: CreateResponseDto[]): Promise<ResponseDto[]> {
    const parsedRequest = zodCreateResponseSchema.array().safeParse(createResponseDto);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    const result = await this.responseRepository.createAll(parsedRequest.data);
    const parsedResult = zodResponseSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findAllResponses(): Promise<ResponseDto[]> {
    const result = await this.responseRepository.findAll();
    const parsedResult = zodResponseSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findResponseById(id: string): Promise<ResponseDto | undefined> {
    const result = await this.responseRepository.findById(id);
    if (!result) return undefined;
    const parsedResult = zodResponseSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findResponseByTicketId(ticketId: string): Promise<ResponseDto[]> {
    const result = await this.responseRepository.findResponseByTicketId(ticketId);
    const parsedResult = zodResponseSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async updateResponse(
    id: string,
    updateResponseDto: UpdateResponseDto
  ): Promise<ResponseDto> {
    const parsedRequest = zodUpdateResponseSchema.safeParse(updateResponseDto);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    if (this.utilsService.isObjectEmpty(parsedRequest.data))
      throw new BadRequestError(badRequestErrorEnum.enum.UPDATE_REQUEST_EMPTY);
    
    const responseExists = await this.findResponseById(id);
    if (!responseExists)
      throw new NotFoundError(notFoundErrorEnum.enum.RESPONSE_NOT_FOUND);

    const result = await this.responseRepository.update(id, {
      ...parsedRequest.data,
    });
    const parsedResult = zodResponseSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async deleteResponse(id: string): Promise<ResponseDto> {
    const result = await this.responseRepository.softDelete(id);
    if (!result)
      throw new NotFoundError(notFoundErrorEnum.enum.RESPONSE_NOT_FOUND);
    const parsedResult = zodResponseSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async checkIfResponseIdExists(id: string): Promise<true> {
    const responseExists = await this.responseRepository.existsById(id);
    if (!responseExists)
      throw new NotFoundError(notFoundErrorEnum.enum.RESPONSE_NOT_FOUND);
    return true;
  }
}
