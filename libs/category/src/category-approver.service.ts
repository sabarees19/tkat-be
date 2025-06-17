import { Injectable } from '@nestjs/common';
import { UtilsService } from '@tkat-backend/utils';
import { CategoryApproverRepository } from './category-approver.repository';
import {
  BadRequestError,
  badRequestErrorEnum,
  CategoryApproverDto,
  CreateCategoryApproverDto,
  NotFoundError,
  notFoundErrorEnum,
  UpdateCategoryApproverDto,
  zodCategoryApproverSchema,
  zodCreateCategoryApproverSchema,
  ZodError,
  zodErrorEnum,
  zodUpdateCategoryApproverSchema,
} from '@tkat-backend/shared';
import { UserService } from 'libs/user/src/user.service';

@Injectable()
export class CategoryApproverService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly userService: UserService,
    private readonly categoryApproverRepository: CategoryApproverRepository
  ) {}

  async createCategoryApprover(
    request: CreateCategoryApproverDto[]
  ): Promise<CategoryApproverDto[]> {
    const parsedRequest = zodCreateCategoryApproverSchema.array().safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });

    const approverIds = parsedRequest.data.map(approver => approver.approverId);
    await this.userService.validateUsersExist(approverIds);
    
    const result = await this.categoryApproverRepository.createAll(
      parsedRequest.data
    );
    const parsedResult = zodCategoryApproverSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    return parsedResult.data;
  }

  async findAllCategoryApprovers(): Promise<CategoryApproverDto[]> {
    const result = await this.categoryApproverRepository.findAll();
    const parsedResult = zodCategoryApproverSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findCategoryApproverById(
    id: string
  ): Promise<CategoryApproverDto | undefined> {
    const result = await this.categoryApproverRepository.findById(id);
    if (!result) return undefined;
    const parsedResult = zodCategoryApproverSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findCategoryApproverByCategoryId(
    categoryId: string
  ): Promise<CategoryApproverDto[]> {
    const result = await this.categoryApproverRepository.findByCategoryId(
      categoryId
    );
    const parsedResult = zodCategoryApproverSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findCategoryApproverByApproverId(
    approverId: string
  ): Promise<CategoryApproverDto[]> {
    const result = await this.categoryApproverRepository.findByApproverId(
      approverId
    );
    const parsedResult = zodCategoryApproverSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async updateCategoryApproverById(
    id: string,
    request: UpdateCategoryApproverDto
  ): Promise<CategoryApproverDto> {
    const parsedRequest = zodUpdateCategoryApproverSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });

    if (this.utilsService.isObjectEmpty(parsedRequest.data)) {
      throw new BadRequestError(badRequestErrorEnum.enum.UPDATE_REQUEST_EMPTY);
    }

    const result = await this.categoryApproverRepository.update(
      id,
      parsedRequest.data
    );
    if (!result)
      throw new NotFoundError(
        notFoundErrorEnum.enum.CATEGORY_APPROVER_NOT_FOUND
      );

    const parsedResult = zodCategoryApproverSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    return parsedResult.data;
  }

  async updateCategoryApproverByApproverIdAndCategoryId(
    approverId: string,
    categoryId: string,
    request: UpdateCategoryApproverDto
  ): Promise<CategoryApproverDto> {
    const parsedRequest = zodUpdateCategoryApproverSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });

    const result = await this.categoryApproverRepository.findByApproverIdAndCategoryId(approverId, categoryId);
    if (!result)
      throw new NotFoundError(
        notFoundErrorEnum.enum.CATEGORY_APPROVER_NOT_FOUND
      );

    const updatedResult = await this.categoryApproverRepository.update(result.id, parsedRequest.data);
    if (!updatedResult)
      throw new NotFoundError(
        notFoundErrorEnum.enum.CATEGORY_APPROVER_NOT_FOUND
      );
    const parsedUpdatedResult = zodCategoryApproverSchema.safeParse(updatedResult);
    if (!parsedUpdatedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedUpdatedResult.error,
      });
    return parsedUpdatedResult.data;
  }

  async deleteCategoryApproverById(id: string): Promise<CategoryApproverDto> {
    const result = await this.categoryApproverRepository.softDelete(id);
    if (!result)
      throw new NotFoundError(
        notFoundErrorEnum.enum.CATEGORY_APPROVER_NOT_FOUND
      );

    const parsedResult = zodCategoryApproverSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async checkIfCategoryApproverExists(
    id: string
  ): Promise<CategoryApproverDto> {
    const result = await this.findCategoryApproverById(id);
    if (!result)
      throw new NotFoundError(
        notFoundErrorEnum.enum.CATEGORY_APPROVER_NOT_FOUND
      );
    return result;
  }
}
