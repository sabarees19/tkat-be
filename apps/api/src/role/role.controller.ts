import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RoleService } from '@tkat-backend/role';
import { CreateRoleDto, UpdateRoleDto } from '@tkat-backend/shared';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async findAllRoles() {
    return await this.roleService.findAllRoles();
  }

  @Get('/:id')
  async findRoleById(id: string) {
    return await this.roleService.findRoleById(id);
  }

  @Post()
  async createRole(@Body() request: CreateRoleDto) {
    return await this.roleService.createRole(request);
  }

  @Patch('/:id')
  async updateRoleById(
    @Param('id') id: string,
    @Body() request: UpdateRoleDto
  ) {
    return await this.roleService.updateRoleById(id, request);
  }

  @Delete('/:id')
  async deleteRole(@Param('id') id: string) {
    return await this.roleService.deleteRole(id);
  }
}
