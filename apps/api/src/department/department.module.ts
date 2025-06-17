import { Module } from '@nestjs/common';
import { DepartmentLibModule } from '@tkat-backend/department';
import { DepartmentController } from './department.controller';


@Module({
  imports: [DepartmentLibModule],
  controllers: [DepartmentController]
})
export class DepartmentModule { }
