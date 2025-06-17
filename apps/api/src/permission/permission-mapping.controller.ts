import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PermissionMappingService } from '@tkat-backend/permission';
import {
  PermissionMappingDto,
  CreatePermissionMappingDto,
  UpdatePermissionMappingDto,
} from '@tkat-backend/shared';

@Controller('permission-mapping')
export class PermissionMappingController {
  constructor(
    private readonly permissionMappingService: PermissionMappingService
  ) {}

  @Get()
  async findAllPermissionMapping(): Promise<PermissionMappingDto[]> {
    return await this.permissionMappingService.findAllPermissionMapping();
  }

  @Get(':id')
  async findPermissionMappingById(@Param('id') id: string): Promise<PermissionMappingDto | undefined> {
    return await this.permissionMappingService.getPermissionMappingById(id);
  }

  @Get('user/:id')
  async findPermissionMappingByUserId(@Param('id') id: string): Promise<PermissionMappingDto[]> {
    return await this.permissionMappingService.getPermissionByUserId(id);
  }

  @Get('role/:id')
  async findPermissionMappingByRoleId(@Param('id') id: string) {
    return await this.permissionMappingService.getPermissionByRoleId(id);
  }

  @Post()
  async createPermissionMapping(@Body() request: CreatePermissionMappingDto): Promise<PermissionMappingDto> {
    return await this.permissionMappingService.createPermissionMapping(request);
  }

  @Patch(':id')
  async updatePermissionMappingById(
    @Param('id') id: string,
    @Body() request: UpdatePermissionMappingDto
  ): Promise<PermissionMappingDto> {
    return await this.permissionMappingService.updatePermissionMappingById(
      id,
      request
    );
  }

  @Delete(':id')
  async deletePermissionMapping(@Param('id') id: string): Promise<PermissionMappingDto> {
    return await this.permissionMappingService.deletePermissionMappingById(id);
  }
}
