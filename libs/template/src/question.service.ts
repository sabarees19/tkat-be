import { Injectable } from '@nestjs/common';
import {
  BadRequestError,
  badRequestErrorEnum,
  QuestionDto,
  CreateQuestionDto,
  NotFoundError,
  notFoundErrorEnum,
  UpdateQuestionDto,
  zodQuestionSchema,
  zodCreateQuestionSchema,
  ZodError,
  zodErrorEnum,
  zodUpdateQuestionSchema,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { QuestionRepository } from './question.repository';

@Injectable()
export class QuestionService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly utilsService: UtilsService
  ) {}

  async createQuestion(createQuestionDto: CreateQuestionDto): Promise<QuestionDto> {
    const parsedRequest = zodCreateQuestionSchema.safeParse(createQuestionDto);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });

    const result = await this.questionRepository.create({
      ...createQuestionDto,
    });
    const parsedResult = zodQuestionSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findAllQuestions(): Promise<QuestionDto[]> {
    const result = await this.questionRepository.findAll();
    const parsedResult = zodQuestionSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findQuestionById(id: string): Promise<QuestionDto | undefined> {
    const result = await this.questionRepository.findById(id);
    if (!result) return undefined;
    const parsedResult = zodQuestionSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findQuestionsByTemplateId(templateId: string): Promise<QuestionDto[]> {
    const result = await this.questionRepository.findQuestionsByTemplateId(templateId);
    const parsedResult = zodQuestionSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async updateQuestion(
    id: string,
    updateQuestionDto: UpdateQuestionDto
  ): Promise<QuestionDto> {
    const parsedRequest = zodUpdateQuestionSchema.safeParse(updateQuestionDto);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    if (this.utilsService.isObjectEmpty(parsedRequest.data))
      throw new BadRequestError(badRequestErrorEnum.enum.UPDATE_REQUEST_EMPTY);
    
    const questionExists = await this.findQuestionById(id);
    if (!questionExists)
      throw new NotFoundError(notFoundErrorEnum.enum.QUESTION_NOT_FOUND);

    const result = await this.questionRepository.update(id, {
      ...parsedRequest.data,
    });
    const parsedResult = zodQuestionSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async deleteQuestion(id: string): Promise<QuestionDto> {
    const result = await this.questionRepository.softDelete(id);
    if (!result)
      throw new NotFoundError(notFoundErrorEnum.enum.QUESTION_NOT_FOUND);
    const parsedResult = zodQuestionSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async checkIfQuestionIdExists(id: string): Promise<true> {
    const questionExists = await this.questionRepository.existsById(id);
    if (!questionExists)
      throw new NotFoundError(notFoundErrorEnum.enum.QUESTION_NOT_FOUND);
    return true;
  }
}
