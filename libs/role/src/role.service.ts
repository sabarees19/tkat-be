import { Injectable } from '@nestjs/common';
import {
  BadRequestError,
  badRequestErrorEnum,
  CreateRoleDto,
  NotFoundError,
  notFoundErrorEnum,
  RoleDto,
  UpdateRoleDto,
  zodCreateRoleSchema,
  ZodError,
  zodErrorEnum,
  zodRoleSchema,
  zodUpdateRoleSchema,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly utilsService: UtilsService
  ) {}

  async createRole(request: CreateRoleDto): Promise<RoleDto> {
    const parsedRequest = zodCreateRoleSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    const result = await this.roleRepository.create(parsedRequest.data);
    const parsedResult = zodRoleSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findAllRoles(): Promise<RoleDto[]> {
    const result = await this.roleRepository.findAll();
    const parsedResult = zodRoleSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findRoleById(id: string): Promise<RoleDto | undefined> {
    const result = await this.roleRepository.findById(id);
    if (!result) return undefined;

    const parsedResult = zodRoleSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async updateRoleById(id: string, request: UpdateRoleDto): Promise<RoleDto> {
    const parsedRequest = zodUpdateRoleSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });

    if (this.utilsService.isObjectEmpty(parsedRequest.data)) {
      throw new BadRequestError(badRequestErrorEnum.enum.UPDATE_REQUEST_EMPTY);
    }

    const result = await this.roleRepository.update(id, parsedRequest.data);
    if (!result) throw new NotFoundError(notFoundErrorEnum.enum.ROLE_NOT_FOUND);

    const parsedResult = zodRoleSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async deleteRole(id: string): Promise<RoleDto> {
    const result = await this.roleRepository.softDelete(id);
    if (!result) throw new NotFoundError(notFoundErrorEnum.enum.ROLE_NOT_FOUND);
    const parsedResult = zodRoleSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async checkIfRoleIdExists(id: string): Promise<true> {
    const roleExists = await this.roleRepository.existsById(id);
    if (!roleExists)
      throw new NotFoundError(notFoundErrorEnum.enum.ROLE_NOT_FOUND);
    return true;
  }
}
