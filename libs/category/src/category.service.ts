import { Injectable } from '@nestjs/common';
import {
  BadRequestError,
  badRequestErrorEnum,
  CategoryDto,
  CreateCategoryDto,
  NotFoundError,
  notFoundErrorEnum,
  UpdateCategoryDto,
  zodCategoryDetailsSchema,
  zodCategorySchema,
  zodCreateCategorySchema,
  ZodError,
  zodErrorEnum,
  zodUpdateCategorySchema,
} from '@tkat-backend/shared';
import { TemplateService } from '@tkat-backend/template';
import { UtilsService } from '@tkat-backend/utils';
import { DepartmentService } from 'libs/department/src/department.service';
import { CategoryApproverService } from './category-approver.service';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly departmentService: DepartmentService,
    private readonly templateService: TemplateService,
    private readonly categoryApproverService: CategoryApproverService,
    private readonly utilsService: UtilsService
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto
  ): Promise<CategoryDto> {
    const parsedRequest = zodCreateCategorySchema.safeParse(createCategoryDto);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    await this.departmentService.findDepartmentById(
      parsedRequest.data.departmentId
    );

    const categoryNameExists = await this.checkIfCategoryNameExists(
      parsedRequest.data.departmentId,
      parsedRequest.data.categoryName
    );
    if (categoryNameExists)
      throw new BadRequestError(
        badRequestErrorEnum.enum.CATEGORY_NAME_ALREADY_EXISTS
      );

    if (parsedRequest.data.templateId) {
      await this.templateService.checkIfTemplateIdExists(parsedRequest.data.templateId);
    }

    const result = await this.categoryRepository.create({
      ...createCategoryDto,
      categoryCheckName: createCategoryDto.categoryName.toUpperCase(),
    });
    const parsedResult = zodCategorySchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });

    const categoryApprover = await this.categoryApproverService.createCategoryApprover(parsedRequest.data.approvers.map((approver) => ({
      ...approver,
      categoryId: parsedResult.data.id,
    })));

    const categoryDetailsResult = zodCategoryDetailsSchema.safeParse({
      ...parsedResult.data,
      approvers: categoryApprover,
    });
    if (!categoryDetailsResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: categoryDetailsResult.error,
      });
    return categoryDetailsResult.data;
  }

  async findAllCategories(): Promise<CategoryDto[]> {
    const result = await this.categoryRepository.findCategoryDetails();
    const parsedResult = zodCategoryDetailsSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findCategoriesByDepartmentId(
    departmentId: string
  ): Promise<CategoryDto[]> {
    const result = await this.categoryRepository.findByDepartmentId(
      departmentId
    );
    const parsedResult = zodCategoryDetailsSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findCategoryById(id: string): Promise<CategoryDto | undefined> {
    const result = await this.categoryRepository.findCategoryDetails(id);
    if (!result) return undefined;
    const parsedResult = zodCategoryDetailsSchema.safeParse(result[0]);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<CategoryDto> {
    const parsedRequest = zodUpdateCategorySchema.safeParse(updateCategoryDto);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    if (this.utilsService.isObjectEmpty(parsedRequest.data))
      throw new BadRequestError(badRequestErrorEnum.enum.UPDATE_REQUEST_EMPTY);
    const categoryExists = await this.findCategoryById(id);
    if (!categoryExists)
      throw new NotFoundError(notFoundErrorEnum.enum.CATEGORY_NOT_FOUND);

    if (parsedRequest.data.categoryName) {
      const categoryNameExists = await this.checkIfCategoryNameExists(
        categoryExists.departmentId,
        parsedRequest.data.categoryName
      );
      if (categoryNameExists && categoryNameExists._id != id)
        throw new BadRequestError(
          badRequestErrorEnum.enum.CATEGORY_NAME_ALREADY_EXISTS
        );
      parsedRequest.data = {
        ...parsedRequest.data,
        categoryCheckName: parsedRequest.data.categoryName.toUpperCase(),
      };
    }

    if (parsedRequest.data.templateId) {
      await this.templateService.checkIfTemplateIdExists(parsedRequest.data.templateId);
    }

    if (parsedRequest.data.approvers) {
      const currentApprovers = await this.categoryApproverService.findCategoryApproverByCategoryId(id);
      const currentApproverIds = new Set(currentApprovers.map(a => a.approverId));
      const newApproverIds = new Set(parsedRequest.data.approvers.map(a => a.approverId));

      // Handle approvers to be deleted (present in current but not in new list)
      for (const approver of currentApprovers) {
        if (!newApproverIds.has(approver.approverId)) {
          await this.categoryApproverService.deleteCategoryApproverById(approver.id);
        }
      }

      // Handle updates and creates
      for (const approver of parsedRequest.data.approvers) {
        if (currentApproverIds.has(approver.approverId)) {
          // Update existing approver
          await this.categoryApproverService.updateCategoryApproverByApproverIdAndCategoryId(
            approver.approverId,
            id,
            {
              approvalOrder: approver.approvalOrder,
            }
          );
        } else {
          // Create new approver
          await this.categoryApproverService.createCategoryApprover([{
            approverId: approver.approverId,
            approvalOrder: approver.approvalOrder,
            categoryId: id
          }]);
        }
      }
    }

    const result = await this.categoryRepository.update(id, {
      ...parsedRequest.data,
    });
    const parsedResult = zodCategorySchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async deleteCategory(id: string): Promise<CategoryDto> {
    const result = await this.categoryRepository.softDelete(id);
    if (!result)
      throw new NotFoundError(notFoundErrorEnum.enum.CATEGORY_NOT_FOUND);
    const parsedResult = zodCategorySchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async checkIfCategoryIdExists(id: string): Promise<true> {
    const categoryExists = await this.categoryRepository.existsById(id);
    if (!categoryExists)
      throw new NotFoundError(notFoundErrorEnum.enum.CATEGORY_NOT_FOUND);
    return true;
  }

  async checkIfCategoryNameExists(
    departmentId: string,
    categoryName: string
  ) {
    const categoryNameExists =
      await this.categoryRepository.existsByDepartmentIdAndName(
        departmentId,
        categoryName
      );
    return categoryNameExists;
  }
}
