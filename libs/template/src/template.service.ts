import { Injectable } from '@nestjs/common';
import {
  BadRequestError,
  badRequestErrorEnum,
  TemplateDto,
  CreateTemplateDto,
  NotFoundError,
  notFoundErrorEnum,
  UpdateTemplateDto,
  zodTemplateSchema,
  zodCreateTemplateSchema,
  ZodError,
  zodErrorEnum,
  zodUpdateTemplateSchema,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { TemplateRepository } from './template.repository';

@Injectable()
export class TemplateService {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly utilsService: UtilsService
  ) {}

  private async generateTemplateName(): Promise<string> {
    return this.templateRepository.generateUniqueName();
  }

  async createTemplate(createTemplateDto: CreateTemplateDto): Promise<TemplateDto> {
    const parsedRequest = zodCreateTemplateSchema.safeParse(createTemplateDto);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });

    const result = await this.templateRepository.create({
      ...createTemplateDto,
      title: await this.generateTemplateName(),
    });
    const parsedResult = zodTemplateSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findAllTemplates(): Promise<TemplateDto[]> {
    const result = await this.templateRepository.findAll();
    const parsedResult = zodTemplateSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findTemplateById(id: string): Promise<TemplateDto | undefined> {
    const result = await this.templateRepository.findById(id);
    if (!result) return undefined;
    const parsedResult = zodTemplateSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async updateTemplate(
    id: string,
    updateTemplateDto: UpdateTemplateDto
  ): Promise<TemplateDto> {
    const parsedRequest = zodUpdateTemplateSchema.safeParse(updateTemplateDto);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    if (this.utilsService.isObjectEmpty(parsedRequest.data))
      throw new BadRequestError(badRequestErrorEnum.enum.UPDATE_REQUEST_EMPTY);
    
    const templateExists = await this.findTemplateById(id);
    if (!templateExists)
      throw new NotFoundError(notFoundErrorEnum.enum.TEMPLATE_NOT_FOUND);


    if (parsedRequest.data.title) {
      const existingTemplate = await this.templateRepository.findByName(parsedRequest.data.title);
      if (existingTemplate) {
        if (existingTemplate.id !== id) {
          throw new BadRequestError(badRequestErrorEnum.enum.TEMPLATE_NAME_ALREADY_EXISTS);
        }
      }
    }

    const result = await this.templateRepository.update(id, {
      ...parsedRequest.data,
    });
    const parsedResult = zodTemplateSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async deleteTemplate(id: string): Promise<TemplateDto> {
    const result = await this.templateRepository.softDelete(id);
    if (!result)
      throw new NotFoundError(notFoundErrorEnum.enum.TEMPLATE_NOT_FOUND);
    const parsedResult = zodTemplateSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async checkIfTemplateIdExists(id: string): Promise<true> {
    const templateExists = await this.templateRepository.existsById(id);
    if (!templateExists)
      throw new NotFoundError(notFoundErrorEnum.enum.TEMPLATE_NOT_FOUND);
    return true;
  }
}