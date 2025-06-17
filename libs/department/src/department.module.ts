import { Module } from '@nestjs/common';
import { UtilsModule } from '@tkat-backend/utils';
import { departmentProvider } from 'libs/shared/src/mongoose-schema/department.schema';
import { DepartmentRepository } from './department.repository';
import { DepartmentService } from './department.service';

@Module({
  imports: [UtilsModule],
  providers: [DepartmentService, departmentProvider, DepartmentRepository],
  exports: [DepartmentService],
})
export class DepartmentLibModule {}
