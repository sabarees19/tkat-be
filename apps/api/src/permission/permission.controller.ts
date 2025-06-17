import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PermissionService } from '@tkat-backend/permission';
import { CreatePermissionDto, PermissionDto, UpdatePermissionDto } from '@tkat-backend/shared';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async findAllPermissions(): Promise<PermissionDto[]> {
    return await this.permissionService.findAllPermissions();
  }

  @Get(':id')
  async findPermissionById(@Param('id') id: string): Promise<PermissionDto | undefined> {
    return await this.permissionService.findPermissionById(id);
  }

  @Post()
  async createPermission(@Body() request: CreatePermissionDto): Promise<PermissionDto> {
    return await this.permissionService.createPermission(request);
  }

  @Patch(':id')
  async updatePermissionById(
    @Param('id') id: string,
    @Body() request: UpdatePermissionDto
  ): Promise<PermissionDto> {
    return await this.permissionService.updatePermissionById(id, request);
  }

  @Delete(':id')
  async deletePermission(@Param('id') id: string): Promise<PermissionDto> {
    return await this.permissionService.deletePermission(id);
  }
}
