import { Injectable } from '@nestjs/common';
import { PermissionMappingRepository } from './permission-mapping.repository';
import { UtilsService } from '@tkat-backend/utils';
import { BadRequestError, badRequestErrorEnum, CreatePermissionMappingDto, NotFoundError, notFoundErrorEnum, PermissionMappingDto, Role, UpdatePermissionDto, UpdatePermissionMappingDto, zodCreatePermissionMappingSchema, ZodError, zodErrorEnum, zodPermissionMappingSchema, zodPermissionMappingSchemaWithPermissionDetails } from '@tkat-backend/shared';
import { RoleService } from '@tkat-backend/role';
import { UserService } from 'libs/user/src/user.service';
import { PermissionService } from './permission.service';

@Injectable()
export class PermissionMappingService {
  constructor(
    private readonly permissionMappingRepository: PermissionMappingRepository,
    private readonly permissionService: PermissionService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly utilsService: UtilsService
  ) {}

  async createPermissionMapping(request: CreatePermissionMappingDto): Promise<PermissionMappingDto> {
    const parsedRequest = zodCreatePermissionMappingSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });

    await this.permissionService.checkIfPermissionIdExists(parsedRequest.data.permissionId);
    let permissionMappinfData = { ...parsedRequest.data };
    if (permissionMappinfData.roleId) {
      await this.roleService.checkIfRoleIdExists(permissionMappinfData.roleId);
    }
    if (permissionMappinfData.userId) {
      await this.userService.findUserById(permissionMappinfData.userId);
    }

    const result = await this.permissionMappingRepository.create(parsedRequest.data);
    const parsedResult = zodPermissionMappingSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    return parsedResult.data;
  }

  async findAllPermissionMapping(): Promise<PermissionMappingDto[]> {
    const result = await this.permissionMappingRepository.findAll();
    const parsedResult = zodPermissionMappingSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async getPermissionMappingById(id: string): Promise<PermissionMappingDto | undefined> {
    const permissionMapping = await this.permissionMappingRepository.findById(id);
    if (!permissionMapping) return undefined;
    const parsedResult = zodPermissionMappingSchema.safeParse(permissionMapping);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async getPermissionByRoleId(roleId: string) {
    await this.roleService.checkIfRoleIdExists(roleId);
    const permissionMapping = await this.permissionMappingRepository.findByRoleId(roleId);
    const parsedResult = zodPermissionMappingSchemaWithPermissionDetails.array().safeParse(permissionMapping);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async getPermissionByUserId(userId: string): Promise<PermissionMappingDto[]> {
    await this.userService.findUserById(userId);
    const permissionMapping = await this.permissionMappingRepository.findByUserId(userId);
    const parsedResult = zodPermissionMappingSchemaWithPermissionDetails.array().safeParse(permissionMapping);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async hasPermission(permissionName: string[], roleId: string): Promise<boolean> {
    const permissionId: string[] = (await this.permissionService.findPermissionIdByPermissionName(permissionName)).map(permission => permission.id);
    const count = await this.permissionMappingRepository.hasPermission(permissionId, roleId);
    return count.length === permissionId.length;
  }

  async updatePermissionMappingById(id: string, request: UpdatePermissionMappingDto): Promise<PermissionMappingDto> {
    const parsedRequest = zodCreatePermissionMappingSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });

    if (this.utilsService.isObjectEmpty(parsedRequest.data)) {
      throw new BadRequestError(badRequestErrorEnum.enum.UPDATE_REQUEST_EMPTY);
    }

    let permissionMappinfData = { ...parsedRequest.data };
    if (permissionMappinfData.roleId) {
      await this.roleService.checkIfRoleIdExists(permissionMappinfData.roleId);
    }
    if (permissionMappinfData.userId) {
      await this.userService.findUserById(permissionMappinfData.userId);
    }

    const result = await this.permissionMappingRepository.update(id, parsedRequest.data);
    if (!result) throw new NotFoundError(notFoundErrorEnum.enum.PERMISSION_MAPPING_NOT_FOUND);
    const parsedResult = zodPermissionMappingSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    return parsedResult.data;
  }

  async deletePermissionMappingById(id: string): Promise<PermissionMappingDto> {
    const result = await this.permissionMappingRepository.softDelete(id);
    if (!result) throw new NotFoundError(notFoundErrorEnum.enum.PERMISSION_MAPPING_NOT_FOUND);
    const parsedResult = zodPermissionMappingSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async checkIfPermissionMappingExists(permissionMappingId: string): Promise<boolean> {
    const result = await this.permissionMappingRepository.findById(permissionMappingId);
    if (!result) throw new NotFoundError(notFoundErrorEnum.enum.PERMISSION_MAPPING_NOT_FOUND);
    return true;
  }
}
