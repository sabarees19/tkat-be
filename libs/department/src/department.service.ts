import { Injectable } from '@nestjs/common';
import {
  BadRequestError,
  badRequestErrorEnum,
  CreateDepartmentDto,
  Department,
  DepartmentDto,
  NotFoundError,
  notFoundErrorEnum,
  UpdateDepartmentDto,
  zodCreateDepartmentSchema,
  zodDepartmentSchema,
  ZodError,
  zodErrorEnum,
  zodUpdateDepartmentSchema,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { ClsService } from 'nestjs-cls';
import { DepartmentRepository } from './department.repository';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly utilsService: UtilsService,
    private readonly clsService: ClsService
  ) {}

  async createDepartment(
    request: CreateDepartmentDto
  ): Promise<DepartmentDto | undefined> {
    const parsedRequest = zodCreateDepartmentSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    await this.nameAlreadyExists(parsedRequest.data.departmentName);
    const saved = await this.departmentRepository.create({
      ...parsedRequest.data,
      departmentCheckName: parsedRequest.data.departmentName.toUpperCase(),
    });
    return this.departmentParse(saved);
  }

  async findAllDepartment(): Promise<DepartmentDto[]> {
    const parsedResult = zodDepartmentSchema
      .array()
      .safeParse(await this.departmentRepository.findAll());
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findDepartmentById(id: string): Promise<DepartmentDto> {
    const result = await this.departmentRepository.findById(id);
    return this.departmentParse(result);
  }

  async checkIfDepartment(id: string): Promise<true> {
    if (await this.departmentRepository.existsById(id)) return true;
    throw new NotFoundError(notFoundErrorEnum.enum.DEPARTMENT_NOT_FOUND);
  }

  async updateDepartmentById(
    id: string,
    request: UpdateDepartmentDto
  ): Promise<DepartmentDto> {
    const parsedRequest = zodUpdateDepartmentSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    if (this.utilsService.isObjectEmpty(parsedRequest.data)) {
      throw new BadRequestError(badRequestErrorEnum.enum.UPDATE_REQUEST_EMPTY);
    }
    if (parsedRequest.data.departmentName) {
      await this.nameAlreadyExists(parsedRequest.data.departmentName, id);
      parsedRequest.data = {
        ...parsedRequest.data,
        departmentCheckName: parsedRequest.data.departmentName.toUpperCase(),
      };
    }
    const result = await this.departmentRepository.update(
      id,
      parsedRequest.data
    );
    return this.departmentParse(result);
  }

  async deleteDepartmentById(id: string): Promise<DepartmentDto> {
    const result = await this.departmentRepository.softDelete(id);
    return this.departmentParse(result);
  }

  private async nameAlreadyExists(departmentName: string, id?: string) {
    if (
      await this.departmentRepository
        .existsByDepartmentCheckName(departmentName.toUpperCase())
        .then((result) => {
          if (!id) return result;
          return result?._id == id ? null : result?._id;
        })
    )
      throw new BadRequestError(
        badRequestErrorEnum.enum.DEPARTMENT_NAME_ALREADY_EXISTS
      );
  }

  private async departmentParse(result: Department | null) {
    if (!result)
      throw new NotFoundError(notFoundErrorEnum.enum.DEPARTMENT_NOT_FOUND);
    const parsedResult = zodDepartmentSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }
}
