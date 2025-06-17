import { Injectable } from '@nestjs/common';
import { PermissionRepository } from './permission.repository';
import { UtilsService } from '@tkat-backend/utils';
import {
    BadRequestError,
  badRequestErrorEnum,
  CreatePermissionDto,
  NotFoundError,
  notFoundErrorEnum,
  PermissionDto,
  UpdatePermissionDto,
  zodCreatePermissionSchema,
  ZodError,
  zodErrorEnum,
  zodPermissionSchema,
  zodUpdatePermissionSchema,
} from '@tkat-backend/shared';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly utilsService: UtilsService
  ) {}

  async createPermission(request: CreatePermissionDto): Promise<PermissionDto> {
    const parsedRequest = zodCreatePermissionSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });

    const result = await this.permissionRepository.create(parsedRequest.data);
    const parsedResult = zodPermissionSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    return parsedResult.data;
  }

  async findAllPermissions(): Promise<PermissionDto[]> {
    const result = await this.permissionRepository.findAll();
    const parsedResult = zodPermissionSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findPermissionById(id: string): Promise<PermissionDto | undefined> {
    const result = await this.permissionRepository.findById(id);
    if (!result) return undefined;
    const parsedResult = zodPermissionSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findPermissionIdByPermissionName(permissionName: string[]) {
    return await this.permissionRepository.findPermissionIdByPermissionName(permissionName);
  }

  async updatePermissionById(id: string, request: UpdatePermissionDto): Promise<PermissionDto> {
    const parsedRequest = zodUpdatePermissionSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });

    if (this.utilsService.isObjectEmpty(parsedRequest.data)) {
      throw new BadRequestError(badRequestErrorEnum.enum.UPDATE_REQUEST_EMPTY);
    }

    const result = await this.permissionRepository.update(id, parsedRequest.data);
    if (!result) throw new NotFoundError(notFoundErrorEnum.enum.PERMISSION_NOT_FOUND);
    const parsedResult = zodPermissionSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    return parsedResult.data;
  }

  async deletePermission(id: string): Promise<PermissionDto> {
    const result = await this.permissionRepository.softDelete(id);
    if (!result) throw new NotFoundError(notFoundErrorEnum.enum.PERMISSION_NOT_FOUND);
    const parsedResult = zodPermissionSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async checkIfPermissionIdExists(id: string): Promise<PermissionDto> {
    const result = await this.findPermissionById(id);
    if (!result) throw new NotFoundError(notFoundErrorEnum.enum.PERMISSION_NOT_FOUND);
    return result;
  }
}
