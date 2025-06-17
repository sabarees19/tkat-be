import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateDepartmentDto,
  DepartmentDto,
  UpdateDepartmentDto,
} from '@tkat-backend/shared';
import { DepartmentService } from 'libs/department/src/department.service';
import { Permissions } from '../auth/permission.decorator';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Permissions('DEPARTMENT:CREATE')
  @Post()
  create(
    @Body() departmentDto: CreateDepartmentDto
  ): Promise<DepartmentDto | undefined> {
    return this.departmentService.createDepartment(departmentDto);
  }

  @Permissions('DEPARTMENT:LIST')
  @Get()
  findAll(): Promise<DepartmentDto[]> {
    return this.departmentService.findAllDepartment();
  }

  @Permissions('DEPARTMENT:LIST')
  @Get(':id')
  findDepartmentById(
    @Param('id') id: string
  ): Promise<DepartmentDto | undefined> {
    return this.departmentService.findDepartmentById(id);
  }

  @Permissions('DEPARTMENT:UPDATE')
  @Patch(':id')
  updateDepartmentById(
    @Param('id') id: string,
    @Body() departmentDto: UpdateDepartmentDto
  ): Promise<DepartmentDto | undefined> {
    return this.departmentService.updateDepartmentById(id, departmentDto);
  }

  @Permissions('DEPARTMENT:DELETE')
  @Delete(':id')
  deleteDepartmentById(
    @Param('id') id: string
  ): Promise<DepartmentDto | undefined> {
    return this.departmentService.deleteDepartmentById(id);
  }
}
